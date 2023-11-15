import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import configServer from './server-config';

import connectDB from './config/DB';
import cache from './config/cache';
import { PORT } from './config/const';
import { SocketServerProvider } from './socket';
import { Logger } from './utils/logger';

//  ------------------------- Setup Variables
const app = express();

configServer(app);

connectDB()
	.then(() => {
		Logger.status('Running Status', 'Database connected');
	})
	.catch((err) => {
		Logger.critical('Database Connection Failed', err);
		process.exit();
	});

const server = app.listen(PORT, async () => {
	SocketServerProvider.getInstance(server);
	await cache.connect();
	Logger.status('Running Status', `Server started on port ${PORT}`);
});

process.on('unhandledRejection', (err: Error) => {
	Logger.critical('Unhandled rejection', err);
	server.close(() => process.exit(1));
});
