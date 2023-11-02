import chai from 'chai';
import supertest from 'supertest';
import configureCommander from '../config/commander.config.js';
import configureDotenv from '../config/dotenv.config.js';
import configureMongo from '../config/mongoDB.config.js';
import mongoose from 'mongoose';
import UserMongoManager from '../dao/mongoManagers/users.managers.js';
import { testUser, newUser, testUserPassword } from './dataScenario.js';

const env = configureCommander();
configureDotenv(env);

const expect = chai.expect;

const host = `${process.env.APP_URL}`;
const requester = supertest(host);

const userMongoManager = new UserMongoManager();

const prepareScenario = async () => {
    const user = await userMongoManager.createUser(testUser);
};

const destroyScenario = async () => {
    await userMongoManager.deleteUserByEmail(testUser.email);
    await userMongoManager.deleteUserByEmail(newUser.email);
};

describe('Test api/sessions endpoints', () => {
    before('Before all scripts', async function () {
        this.timeout(10000);
        await configureMongo();
        await prepareScenario();
    });

    describe('register', () => {

        it('POST Should register valid user', async () => {
            const { statusCode, ok, body } = await requester.post('/api/sessions/register').send(newUser);
            expect(ok).to.equal(true);
            expect(statusCode).to.equal(200);
            expect(body.status).to.equal(1);
            expect(body.msg).to.equal('New flowerier registered');
            expect(body.user).to.be.a('object');
            expect(body.user.firstName).to.equal(newUser.firstName);
            expect(body.user.lastName).to.equal(newUser.lastName);
            expect(body.user.email).to.equal(newUser.email);
            expect(body.user.birthDate).to.equal(newUser.birthDate);
            expect(body.user.role).to.equal(newUser.role);
            expect(body.user).to.have.property('id');
            expect(body.user.id).to.be.a('string');            
        });

        it('POST Should not register user with existing email', async () => {
            const { statusCode, ok, body } = await requester.post('/api/sessions/register').send(testUser);
            expect(ok).to.equal(false);
            expect(statusCode).to.equal(401);
            expect(body.status).to.equal(0);
            expect(body.msg).to.equal('Flowerier already exists');
        });

    });

    describe('login', () => {

        it('POST Should login valid user', async () => {
            const { statusCode, ok, body , header} = await requester.post('/api/sessions/login').send({
                email: testUser.email, password: testUserPassword
            });
            expect(ok).to.equal(true);
            expect(statusCode).to.equal(200);
            expect(body.status).to.equal(1);
            expect(body.msg).to.equal('Flowerier successfully logged in');
            expect(body.jwt).to.be.a('string');

            const cookieResult = header['set-cookie'][0]

            const cookie =  {
                name: cookieResult.split('=')[0],
                value: cookieResult.split('=')[1]
            }

            expect(cookie.name).to.equal('floweryjwt');
            expect(cookie.value).to.be.a('string');

        });

        it('POST Should not login user with incorrest password', async () => {
            const { statusCode, ok, body } = await requester.post('/api/sessions/login').send({
                email: testUser.email, password: testUserPassword + '1'
            });
            expect(ok).to.equal(false);
            expect(statusCode).to.equal(401);
            expect(body.status).to.equal(0);
            expect(body.msg).to.equal('Password is incorrect');
        });

        it('POST Should not login invalid user', async () => {
            const { statusCode, ok, body } = await requester.post('/api/sessions/login').send({
                email: testUser.email + 'w', password: testUserPassword + '1'
            });
            expect(ok).to.equal(false);
            expect(statusCode).to.equal(401);
            expect(body.status).to.equal(0);
            expect(body.msg).to.equal('Wrong flowerier');
        });

    });

    describe('currentuser', () => {
            let session;

            before('Before all scripts in currentuser', async function () {
                const loginResponse = await requester
                    .post('/api/sessions/login')
                    .send({email: testUser.email, password: testUserPassword})
                session = loginResponse.headers['set-cookie'][0].split(';')[0].split('=')[1];
            });
            
            it('GET Should get current user', async () => {
                const { statusCode, ok, body } = await requester.get('/api/sessions/currentuser').set('Cookie', [`floweryjwt=${session}`]);
                expect(ok).to.equal(true);
                expect(statusCode).to.equal(200);
                expect(body.status).to.equal(1);
                expect(body.msg).to.equal('Flowerier logged in');
                expect(body.user).to.be.a('object');
                expect(body.user.firstName).to.equal(testUser.firstName);
                expect(body.user.lastName).to.equal(testUser.lastName);
                expect(body.user.email).to.equal(testUser.email);
                expect(body.user.birthDate).to.equal(testUser.birthDate);
                expect(body.user.role).to.equal(testUser.role);
            });
   
        });

        describe('logout', () => {
            let session;

            before('Before all scripts in logout', async function () {
                const loginResponse = await requester
                    .post('/api/sessions/login')
                    .send({email: testUser.email, password: testUserPassword})
                session = loginResponse.headers['set-cookie'][0].split(';')[0].split('=')[1];
            });
            
            it('POST Should logout', async () => {
                const { statusCode, ok, body } = await requester.post('/api/sessions/logout').set('Cookie', [`floweryjwt=${session}`]);
                expect(ok).to.equal(true);
                expect(statusCode).to.equal(200);
                expect(body.status).to.equal(1);
                expect(body.msg).to.equal('Flowerier successfully logged out');
            });
   
        });

    after('After all scripts', async () => {
        await destroyScenario();
        mongoose.disconnect();
    });

});