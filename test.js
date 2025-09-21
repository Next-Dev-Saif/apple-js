const { Osascript } = require("./Osascript");
const script = new Osascript();

async function startTest() {
  
    await script.executeScript([script.appleCommands.display("Welcome to apple.js ,Glad to see you ,  shall we open chrome ?"),
    script.appleCommands.speak("Welcome to apple js , shall we open chrome ?"),
    // script.appleCommands.browser.openInChrome("https://github.com/Next-Dev-Saif/apple-js"),
    // script.appleCommands.fullscreenFrontApp(),
   
]);
await script.executeSingleCommand(script.appleCommands.systemControl.screenshotToDesktop())
 await script.executeSingleCommand(script.appleCommands.fun.playSosumi()); 
 await script.executeScript([
    script.appleCommands.notifications.alertWithSound("Opsii Dubsii","Looks like Siri wants to tell joke .","Blow"),
    script.appleCommands.delay(3),
    script.appleCommands.ai.tellJoke(),
    script.appleCommands.notifications.alertWithSound("Apple-js version 1.0.4","Enjoy the new methods of apple-js","Glass"),
    script.appleCommands.delay(3),
    script.appleCommands.fun.dramaticAnnouncement("Holy Moly ! i am alive "),
    script.appleCommands.demoTypeHelloWorld(),
    script.appleCommands.speak("Are you impressed with apple js ?","Zarvox"),
    script.appleCommands.ui.typeText("Apple-js",0.5),
    script.appleCommands.notifications.alertWithSound("Apple-js version 1.0.4","Enjoy the latest version")
   
 ])
}
startTest();