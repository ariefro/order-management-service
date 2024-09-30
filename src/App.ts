import cors from 'cors';
import express, { Application } from 'express';
import logger from './configs/logger';
import helmet from 'helmet';
import http from 'http';
import swaggerUi from 'swagger-ui-express';
import apiRoutes from './routes';
import errorHandler from './middlewares/error-handler';
import swaggerDocument from '../docs/swagger.json';
import { PrismaClient } from '@prisma/client';

export default class App {
	public express: Application;
	public httpServer: http.Server;
	private prisma: PrismaClient;
	private logger: typeof logger;

	constructor(prisma: PrismaClient) {
		this.express = express();
		this.httpServer = http.createServer(this.express);
		this.prisma = prisma;
		this.logger = logger;
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
			await this.prisma.$connect();
			this.logger.info('Connected to the database');
		} catch (error) {
			await this.prisma.$disconnect();
			this.logger.error('Unable to connect to the database: ', error);
			process.exit(1);
		}
	}
}
