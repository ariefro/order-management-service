import * as express from 'express';
import { InternalServerError, NotFoundError, ValidationError } from '../errors';

const errorHandler = (
	err: Error,
	req: express.Request,
	res: express.Response,
): express.Response => {
	if (err instanceof ValidationError) {
		return res.status(err.status).json({ error: err.message });
	}

	if (err instanceof NotFoundError) {
		return res.status(err.status).json({ error: err.message });
	}

	if (err instanceof InternalServerError) {
		return res.status(err.status).json({ error: err.message });
	}

	// Default to 500 if no other errors match
	return res.status(500).json({ error: 'An unexpected error occurred' });
};

export default errorHandler;
