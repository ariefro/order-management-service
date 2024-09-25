import * as http from 'http';
import App from './App';
import { AddressInfo } from 'net';
import logger from './config/logger';

const app: App = new App();
let server: http.Server;
const port = process.env.PORT ?? 8080;

function serverError(error: NodeJS.ErrnoException): void {
	if (error.syscall !== 'listen') {
		logger.error(`Server error: ${error.message}`);
		throw error;
	}

	logger.error(`Server error: ${error.code} - ${error.message}`);
	throw error;
}

function serverListening(): void {
	const addressInfo: AddressInfo = server.address() as AddressInfo;
	logger.info(`Listening on ${addressInfo.address}:${port}`);
}

app.init()
	.then(() => {
		app.express.set('port', port);

		server = app.httpServer;
		server.on('error', serverError);
		server.on('listening', serverListening);
		server.listen(port);
	})
	.catch((err: Error) => {
		logger.info('App initialization error');
		logger.error(err.name);
		logger.error(err.message);
		logger.error(err.stack);
	});

process.on('unhandledRejection', (reason: Error) => {
	logger.error('Unhandled Promise Rejection: reason: ', reason.message);
	logger.error(reason.stack);
});
