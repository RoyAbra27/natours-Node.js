/* eslint-disable import/first */
import mongoose from 'mongoose';

process.on('uncaughtException', (err) => {
  console.error('UNHANDLED EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

import './utils/config.js';
import app from './app.js';

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log('DB connection ACTIVE');
});

const port = process.env.PORT;

const server = app.listen(port, () => {
  console.log('http://localhost:3000');
  console.log(`Server is running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.error('SIGTERM RECIEVED. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated!');
  });
});
