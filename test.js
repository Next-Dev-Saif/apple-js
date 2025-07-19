const { Osascript } = require("./Osascript");
const script = new Osascript();

async function startTest() {
  
    await script.executeScript([script.appleCommands.display("Welcome to apple.js"),
script.appleCommands.systemControl.setVolume(0)]);
await script.executeSingleCommand(script.appleCommands.display("Bush !"))
    script.close();

}
startTest();