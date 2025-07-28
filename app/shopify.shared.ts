import {APP_LOG_LEVEL} from './const';

/* eslint-disable sort-keys */
export const log = {
	level: APP_LOG_LEVEL as 'error' | 'info' | 'debug',
	levels: {
		error: 0,
		info: 1,
		debug: 2,
	},
	noop() {},

	debug(...args: unknown[]) {
		if (this.levels[this.level] >= this.levels.debug) {
			return console.debug('log.debug', ...args);
		}
		return this.noop();
	},

	info(...args: unknown[]) {
		if (this.levels[this.level] >= this.levels.info) {
			return console.info('log.info', ...args);
		}
		return this.noop;
	},

	error(...args: unknown[]) {
		if (this.levels[this.level] >= this.levels.error) {
			return console.error('log.error', ...args);
		}
		return this.noop;
	},
};
/* eslint-enable sort-keys */
