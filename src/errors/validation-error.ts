export class ValidationError extends Error {
	public status: number;
	constructor(message: string) {
		super(message);
		this.status = 400;
		this.name = 'ValidationError';
	}
}
