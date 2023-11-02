import express from 'express';
import __dirname from '../utils/utils.js'
import path from 'path';

export default function configurePublicFolder(app) {
  app.use('/files', express.static(path.join(__dirname, './public')));
}
