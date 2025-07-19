const path = require("path");
const { AppleScript } = require("./apple-script/Apple.js");
const { spawn } = require("child_process");

/**
 * @class Osascript
 * @classdesc A persistent AppleScript executor that runs commands through a background Node.js subprocess
 * for faster and queued execution of AppleScript via `osascript`.
 *
 * @example
 * const { Osascript } = require('./index.js');
 * const script = new Osascript();
 *
 * await script.executeScript([
 *   script.appleCommands.speak("Hello"),
 *   script.appleCommands.activateApp("Music"),
 *   script.appleCommands.awaitAppIsFrontmost("Music")
 * ]);
 *
 * script.close(); // Always close when done
 */
class Osascript {
  /**
   * @private
   * @type {import('child_process').ChildProcessWithoutNullStreams | null}
   */
  mainThread;

  /**
   * @type {typeof AppleScript}
   * @description Exposes static AppleScript builder commands
   */
  appleCommands = AppleScript;

  /**
   * @private
   * @type {Array<{resolve: Function, reject: Function}>}
   * @description Tracks pending promises waiting for output
   */
  #pending = [];

  /**
   * Spawns the persistent background process (mainThread) used to run AppleScript commands.
   * This improves performance by avoiding repeated process spawning.
   */
  constructor() {
    this.mainThread = spawn("node", [path.join(__dirname, "./workers/index.js")], {
      stdio: ["pipe", "pipe", "pipe"]
    });

    this.mainThread.stderr.on("data", this.#errorHandler.bind(this));
    this.mainThread.stdout.on("data", this.#handleOutput.bind(this));
  }

  /**
   * @private
   * @param {Buffer} err
   * Handles error output from the child process and rejects the associated promise.
   */
  #errorHandler(err) {
    console.error("[Osascript][stderr]", err?.toString());
    const current = this.#pending.shift();
    if (current) current.reject(err.toString());
  }

  /**
   * @private
   * @param {Buffer} out
   * Handles stdout output from the child process and resolves the associated promise.
   */
  #handleOutput(out) {
    const output = out?.toString();
    console.log("[Osascript][stdout]", output);
    const current = this.#pending.shift();
    if (current) current.resolve(output);
  }

  /**
   * Executes one or more AppleScript commands using a persistent subprocess.
   * @async
   * @param {string[]} appleCodeArray - Array of AppleScript lines to be joined and executed
   * @returns {Promise<string>} Resolves with stdout result from AppleScript, or rejects with error
   * @throws If the background thread is not running
   */
  async executeScript(appleCodeArray) {
    if (!this.mainThread) {
      throw new Error("Osascript runtime error: mainThread is not running");
    }

    const appleScript = appleCodeArray?.join("\n");
    console.log("Running Apple Script\n", appleScript);

    const command = `osascript -e '${appleScript.replace(/'/g, "\\'")}'\n`;

    return new Promise((resolve, reject) => {
      this.#pending.push({ resolve, reject });
      this.mainThread.stdin.write(command);
    });
  }

  /**
   * Restarts the background AppleScript execution thread.
   * Can be used if the process crashes or is terminated.
   */
  restart() {
    this.mainThread = spawn("node", [path.join(__dirname, "./workers/index.js")], {
      stdio: ["pipe", "pipe", "pipe"]
    });
  }

  /**
   * Gracefully shuts down the background process and frees system resources.
   * Always call this when done to avoid leaving zombie processes.
   */
  close() {
    if (this.mainThread) {
      this.mainThread.stdin.write("exit\n");
      this.mainThread.stdin.end();
      this.mainThread = null;
    }
  }
  /**if you want more customization and more js logic , execute single-command */
async  executeSingleCommand(scriptCommand){
    if(!this.mainThread) throw "Error ! main thread is not running"
 let command=`osascript -e '${scriptCommand?.replace(/'/g, "\\'")}'\n`;
return new Promise((resolve, reject) => {
  this.#pending.push({ resolve, reject });
  this.mainThread.stdin.write(command);
});

  }
}

module.exports = { Osascript };
