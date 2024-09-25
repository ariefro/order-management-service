import express, { Application } from 'express';
import logger from './config/logger';
import http from 'http';
import { PrismaClient } from '@prisma/client';

export default class App {
	public express: Application;
	public httpServer: http.Server;
	private prisma: PrismaClient;

	constructor() {
		this.express = express();
		this.httpServer = http.createServer(this.express);
		this.prisma = new PrismaClient();
	}

	public async init(): Promise<void> {
		await this.assertDatabaseConnection();
	}

	private async assertDatabaseConnection(): Promise<void> {
		try {
			await this.prisma.$connect();
			logger.info('Connected to the database using Prisma successfully');
		} catch (error) {
			logger.error(
				'Unable to connect to the database using Prisma: ',
				error,
			);
			process.exit(1);
		}
	}
}
