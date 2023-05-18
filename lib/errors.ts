export class AppError extends Error {
	code: number;
	name: string;

	constructor(message: string, code = 500) {
		super(message);
		this.code = code;
		this.name = this.constructor.name;
	}
}
