import { statusBadRequest } from '../constants/http-status-code';

export class ValidationError extends Error {
	public status: number;
	constructor(message: string) {
		super(message);
		this.status = statusBadRequest;
		this.name = 'ValidationError';
	}
}
