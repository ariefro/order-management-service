import { statusInternalServerError } from '../constants/http-status-code';

export class InternalServerError extends Error {
	public status: number;
	constructor(message: string = 'Internal Server Error') {
		super(message);
		this.status = statusInternalServerError;
		this.name = 'InternalServerError';
	}
}
