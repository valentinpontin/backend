import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'express-compression';
import errorHandler from '../utils/errorHandler/errorHandler.js'
import { floweryRequestLogger } from '../utils/logger.js';
import { default as jwt } from 'jsonwebtoken';
import { UserService } from "../services/users.services.js";
import { jwtVerify, tokenFromCookieExtractor } from '../utils/utils.js';
import { th } from '@faker-js/faker';


export const configureMiddlewares = (app) => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }));
  app.use(cookieParser());
  app.use(compression({
    brotli: {enabled: true, zlib: {}}
  }));
  app.use(floweryRequestLogger);
}

export const configurePostMiddlewares = (app) => {
  app.use(errorHandler);
}

export const validateResetPasswordToken = (redirectOnError = false) => {
  return (req, res, next) => {
      try {
          const token = req.params.token;
          jwt.verify(token, process.env.AUTH_SECRET);
          const data = jwt.decode(token);
          req.email = data.email;
          req.token = token;
          next();
      } catch (error) {
          if (redirectOnError) {
              res.redirect('/resetPasswordRequest');
          } else {
              throw error;
          }
      }
  };
};

export const jwtFromCookie = async (req, res, next) => {
  try {
      const token = tokenFromCookieExtractor(req);
      if (!token) {
          return next();
      }
      req.user = token;
      next();
  } catch (error) {
      throw error;
  }
};

export const setLastConnection = async (req, res, next) => {
  try {
      const userService = new UserService();
      const token = req.user;
      if (!token) {
          return next();
      }
      const decodedToken = jwtVerify(token);
      const user = decodedToken.user;
      if (!user || !user.email || user.email.toLowerCase() === process.env.ADMIN_USER.toLowerCase()) {
          return next();
      }
      await userService.updateLastConnection(user.email);
      next();
  } catch (error) {
      throw error;
  }
};

export const checkDocumentUploader = async (req, res, next) => {
  try {
      const user = req.user;
      if (!user) {
        return res.status(401).send({ status: 0, msg: 'Unauthorized' });
      }
      if ( user.email !== req.params.email ) {
        return res.status(403).send({ status: 0, msg: 'Forbidden' });
      }
      next();
  } catch (error) {
      throw error;
  }
};

