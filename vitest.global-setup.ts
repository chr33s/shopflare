import { execSync } from "node:child_process";

export default function setup() {
	execSync("react-router build", { cwd: import.meta.dirname });
}
