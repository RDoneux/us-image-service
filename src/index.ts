import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import logger from './middleware/logger';
import actuatorController from './controllers/actuator.controller';
import { errorLog, infoLog } from './globals/logging-globals';
import exampleController from './controllers/image.controller';

export const environment = process.env.NODE_ENV || 'development';
console.log(
  `starting server in ${environment} environment... if there is no further logging, ensure DEBUG=<project-name>:* is defined in environment variables`
);
infoLog('Starting server...');

export const application = express();
let PORT = process.env.PORT || 4000;
// if running in test environment, force to port 4001 to avoid conflicts with potentially running instances
if (environment === 'test') PORT = 4001;

// middleware
application.use(logger);

// controllers
application.use(actuatorController);
application.use(exampleController);

// root endpoints
application.use((request: Request, response: Response) => {
  response.status(404).json('endpoint not found, did you remember  to use the controller?');
});

// start server
/* eslint-disable @typescript-eslint/no-unused-expressions */
export const server = application.listen(PORT, (error?: Error) => {
  error
    ? errorLog(error)
    : infoLog(`Server launched successfully, listening at: http://localhost:${PORT}`);
});
