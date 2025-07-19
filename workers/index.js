// workers/index.js
const { exec } = require("child_process");

process.stdin.on("data", (chunk) => {
  const command = chunk.toString().trim();

  if (command === "exit") {
    console.log("[Worker] Exiting.");
    process.exit(0);
    return;
  }

  // Run AppleScript using osascript
  exec(command, (err, stdout, stderr) => {
    if (err) {
      process.stderr.write(`[ERROR] ${stderr || err.message}\n`);
    } else {
      process.stdout.write(stdout + "\n"); // send back result
    }
  });
});
