import * as express from 'express';
import { InternalServerError, NotFoundError, ValidationError } from '../errors';

const errorHandler = (
	err: Error,
	_req: express.Request,
	res: express.Response,
	_next: express.NextFunction,
): express.Response => {
	if (err instanceof ValidationError) {
		return res
			.status(err.status)
			.json({ status: 'error', message: err.message });
	}

	if (err instanceof NotFoundError) {
		return res
			.status(err.status)
			.json({ status: 'error', message: err.message });
	}

	if (err instanceof InternalServerError) {
		return res
			.status(err.status)
			.json({ status: 'error', message: err.message });
	}

	// Default to 500 if no other errors match
	return res
		.status(500)
		.json({ status: 'error', message: 'An unexpected error occurred' });
};

export default errorHandler;
