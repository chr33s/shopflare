import {execSync} from 'node:child_process';

export default function setup() {
	execSync('vite build', {cwd: import.meta.dirname});
}
