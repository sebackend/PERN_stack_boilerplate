import { spawn } from "node:child_process";

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      ...options,
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} exited with code ${code ?? 1}`));
    });
  });
}

console.log("Applying migrations...");
await run("./node_modules/.bin/prisma", ["migrate", "deploy"], { cwd: "/app" });

console.log("Starting API...");
const server = spawn(process.execPath, ["/app/dist/server.js"], {
  stdio: "inherit",
});

server.on("exit", (code) => {
  process.exit(code ?? 0);
});

server.on("error", (error) => {
  console.error(error);
  process.exit(1);
});
