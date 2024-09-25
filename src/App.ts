import cors from 'cors';
import express, { Application } from 'express';
import logger from './config/logger';
import helmet from 'helmet';
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
		this.middleware();
		await this.assertDatabaseConnection();
	}

	private middleware(): void {
		this.express.use(helmet({ contentSecurityPolicy: true }));
		this.express.use(express.json({ limit: '100mb' }));
		this.express.use(
			express.urlencoded({ limit: '100mb', extended: true }),
		);

		const corsOptions = {
			origin: process.env.ALLOWED_ORIGIN_URL,
		};
		this.express.use(cors(corsOptions));
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
			await this.prisma.$disconnect();
			process.exit(1);
		}
	}
}
