import mongoose from 'mongoose';
import { floweryLogger } from '../utils/logger.js';

export default async function configureMongo() {
  try {
    const mongo = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`;
    await mongoose.connect(mongo, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    floweryLogger('info', `MongoDB connection successful to ${process.env.DB_NAME} database`);
  } catch (err) {
    floweryLogger('error', `Cannot connect to MongoDB ${process.env.DB_NAME} database - ${err}`);
  }
}