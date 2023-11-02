import passport from "passport";
import local from "passport-local";
import UsersModel from "../dao/models/users.model.js";
import { createHash, isValidPassword, tokenFromCookieExtractor } from "../utils/utils.js";
import GitHubStrategy from "passport-github2";
import jwt from 'passport-jwt';
import { default as token } from 'jsonwebtoken';
import { UserDTO } from "../dto/users.dto.js";

const JWTStrategy = jwt.Strategy;
const ExtractJWT = jwt.ExtractJwt;
export const generateToken = user => token.sign({ user }, process.env.AUTH_SECRET, { expiresIn: '1d' })

const LocalStrategy = local.Strategy;

const initializePassport = () => {
    passport.use('register', new LocalStrategy({
        usernameField: 'email',
        passReqToCallback: true,
    }, async (req, username, password, done) => {
        let errorMsg;
        try {
            const { firstName, lastName, email, birthDate } = req.body;
            if (username.toLowerCase() === process.env.ADMIN_USER.toLowerCase()) {
                errorMsg = "Flowerier already exists";
                return done(null, false, errorMsg);
            }
            const exists = await UsersModel.findOne({ email: { $regex: new RegExp(`^${username}$`, 'i') } });
            if (exists) {
                errorMsg = "Flowerier already exists";
                return done(null, false, errorMsg);
            }
            const newUser = {
                firstName,
                lastName,
                email: email.toLowerCase(),
                birthDate,
                password: createHash(password),
            };
            const user = await UsersModel.create(newUser);
            const userDTO = new UserDTO(user);
            return done(null, userDTO);
        } catch (error) {
            errorMsg = error.message;
            return done(errorMsg);
        }
    }));

    passport.use('login', new LocalStrategy({
        usernameField: 'email',
        passReqToCallback: true,
    }, async (req, username, password, done) => {
        let errorMsg;
        try {
            let userJwt;
            if (username.toLowerCase() === process.env.ADMIN_USER.toLowerCase()) {
                if (password !== process.env.ADMIN_PASSWORD) {
                    errorMsg = "Password is incorrect";
                    return done(null, false, errorMsg);
                }
                userJwt = {
                    firstName: 'Admin',
                    lastName: 'Flowerier',
                    email: process.env.ADMIN_USER,
                    birthDate: '',
                    role: 'admin'
                };
            } else {
                const user = await UsersModel.findOne({ email: { $regex: new RegExp(`^${username}$`, 'i') } });
                if (!user) {
                    errorMsg = "Wrong flowerier";
                    return done(null, false, errorMsg);
                }
                if (!isValidPassword(user, password)) {
                    errorMsg = "Password is incorrect";
                    return done(null, false, errorMsg);
                }
                const userDTO = new UserDTO(user);
                userJwt = userDTO;
            }
            const jwt = generateToken(userJwt);
            return done(null, jwt);
        } catch (error) {
            errorMsg = error.message;
            return done(errorMsg);
        }
    }));

    passport.use('resetPassword', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'newPassword',
        passReqToCallback: true,
    }, async (req, username, password, done) => {
        let errorMsg;
        try {
            if (username.toLowerCase() !== req.email.toLowerCase()) {
                errorMsg = "Invalid flowerier email in token";
                return done(null, false, errorMsg);
            }
            if (username.toLowerCase() === process.env.ADMIN_USER.toLowerCase()) {
                errorMsg = "Admin password cannot be reset";
                return done(null, false, errorMsg);
            } else {
                const user = await UsersModel.findOne({ email: { $regex: new RegExp(`^${username}$`, 'i') } });
                if (!user) {
                    errorMsg = "Wrong flowerier";
                    return done(null, false, errorMsg);
                }
                if (isValidPassword(user, password)) {
                    errorMsg = "New password cannot be the same as the old one";
                    return done(null, false, errorMsg);
                }
                const newHashedPassword = createHash(password);
                await UsersModel.updateOne({ _id: user._id }, { $set: { password: newHashedPassword } });
                const userDTO = new UserDTO(user);
                return done(null, userDTO);
            }
        } catch (error) {
            errorMsg = error.message;
            return done(errorMsg);
        }
    }));

    passport.use('github', new GitHubStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: `${process.env.APP_URL}/api/sessions/githubcallback`
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await UsersModel.findOne({ email: profile._json.email });
            if (!user) {
                user = {
                    firstName: profile._json.name,
                    lastName: '',
                    email: profile._json.email,
                    password: '',
                }
                user = await UsersModel.create(user);
            }
            const userDTO = new UserDTO(user);
            const jwt = generateToken(userDTO);
            return done(null, jwt);
        } catch (error) {
            return done('Github login failure');
        }
    }));

    passport.use('jwt', new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromExtractors([tokenFromCookieExtractor]),
        secretOrKey: process.env.AUTH_SECRET
    }, async (jwt_payload, done) => {
        try {
            const user = jwt_payload.user;
            return done(null, user);
        } catch (error) {
            done(error);
        }
    }));

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (_id, done) => {
        try {
            const user = await UsersModel.findOne({ _id });
            return done(null, user);
        } catch {
            return done({ msg: "Error deserializing user" });
        }
    });

};

export default initializePassport;