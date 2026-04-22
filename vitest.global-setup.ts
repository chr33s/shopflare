import { execSync } from "node:child_process";

export default function setup() {
	execSync("npx react-router build --mode=test", { cwd: import.meta.dirname });
}
