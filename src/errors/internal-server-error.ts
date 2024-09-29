import { statusInternalServerError } from '../constants/http-status-code';

export class InternalServerError extends Error {
	public status: number;
	constructor(message: string) {
		super(message);
		this.status = statusInternalServerError;
		this.name = 'InternalServerError';
	}
}
