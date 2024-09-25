import express, { Application } from 'express';
import database from './config/database';
import logger from './config/logger';
import http from 'http';

export default class App {
	public express: Application = express();

	public httpServer: http.Server = http.createServer(this.express);

	public async init(): Promise<void> {
		await this.assertDatabaseConnection();
	}

	private async assertDatabaseConnection(): Promise<void> {
		try {
			await database.authenticate();
			await database.sync();
			logger.info('Connection has been established successfully');
		} catch (error) {
			logger.error('Unable to connect to the database: ', error);
		}
	}
}
