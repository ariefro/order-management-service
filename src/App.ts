import cors from 'cors';
import express, { Application } from 'express';
import logger from './configs/logger';
import helmet from 'helmet';
import http from 'http';
import swaggerUi from 'swagger-ui-express';
import apiRoutes from './routes';
import errorHandler from './middlewares/error-handler';
import prisma from '../prisma/client';
import swaggerDocument from '../docs/swagger.json';

export default class App {
	public express: Application;
	public httpServer: http.Server;

	constructor() {
		this.express = express();
		this.httpServer = http.createServer(this.express);
	}

	public async init(): Promise<void> {
		this.middleware();
		this.routes();
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

	private routes(): void {
		this.express.use(
			'/api-docs',
			swaggerUi.serve,
			swaggerUi.setup(swaggerDocument),
		);
		this.express.use('/api', apiRoutes);
		this.express.use(errorHandler);
	}

	private async assertDatabaseConnection(): Promise<void> {
		try {
			await prisma.$connect();
			logger.info('Connected to the database');
		} catch (error) {
			logger.error('Unable to connect to the database: ', error);
			await prisma.$disconnect();
			process.exit(1);
		}
	}
}
