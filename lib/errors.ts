export class AppError extends Error {
	code: number;
	name: string;

	constructor(code: number, message: string) {
		super(message);
		this.code = code;
		this.name = this.constructor.name;
	}
}
