export class InternalServerError extends Error {
	public status: number;
	constructor(message: string = 'Internal Server Error') {
		super(message);
		this.status = 500;
		this.name = 'InternalServerError';
	}
}
