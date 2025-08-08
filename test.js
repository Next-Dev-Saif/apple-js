const { Osascript } = require("./Osascript");
const script = new Osascript();

async function startTest() {
  
    await script.executeScript([script.appleCommands.display("Welcome to apple.js ,Glad to see you ,  shall we open chrome ?"),
    script.appleCommands.speak("Welcome to apple js , shall we open chrome ?"),
    script.appleCommands.browser.openInChrome("https://github.com/Next-Dev-Saif/apple-js"),
    script.appleCommands.fullscreenFrontApp(),
   
]);
await script.executeSingleCommand(script.appleCommands.display("Bush ! , we did it "))
    setTimeout(async()=>{
        await script.executeSingleCommand( script.appleCommands.dispatchSystemEvent("swipe-right"));
        script.close();
    },3000)


}
startTest();