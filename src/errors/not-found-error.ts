import { statusNotFound } from '../constants/http-status-code';

export class NotFoundError extends Error {
	public status: number;
	constructor(message: string) {
		super(message);
		this.status = statusNotFound;
		this.name = 'NotFoundError';
	}
}
