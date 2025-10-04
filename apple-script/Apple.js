
/**
 * @class AppleScript
 * @classdesc
 * A lightweight utility class for generating AppleScript code from JavaScript.
 * Useful for building AppleScript snippets programmatically or compiling JS-like logic
 * into AppleScript-compatible statements.
 *
 * Each static method returns a valid AppleScript string representing that specific command.
 *
 * @example
 * const script = [
 *   AppleScript.set("greeting", "Hello world"),
 *   AppleScript.displayVar("greeting"),
 *   AppleScript.speak("Hello world", "Samantha")
 * ].join("\n");
 *
 * // Output:
 * // set greeting to "Hello world"
 * // display dialog greeting
 * // say "Hello world" using "Samantha"
 */
class AppleScript {

  /** Equivalent of: display dialog "message" */
  static display(msg) {
    return `display dialog "${msg}"`;
  }

  /** Equivalent of: log "message" (for Script Editor console) */
  static log(msg) {
    return `log "${msg}"`;
  }
  /** Gets the button returned from a dialog result variable */
  static buttonReturnOf(varName) {
    return `button returned of ${varName}`;
  }

  /** Gets a specific property (e.g. 'text returned') of a variable */
  static returnOf(property, varName) {
    return `${property} of ${varName}`;
  }

  /** Variable assignment: set name to "John" */
  static set(varName, value) {
    const quoted = typeof value === "string" ? `"${value}"` : value;
    return `set ${varName} to ${quoted}`;
  }

  /** If statement: if condition then ... end if */
  static if(condition, bodyLines = []) {
    const body = bodyLines.map(line => `\t${line}`).join("\n");
    return `if ${condition} then\n${body}\nend if`;
  }

  /** If-else block */
  static ifElse(condition, ifLines = [], elseLines = []) {
    const ifBody = ifLines.map(l => `\t${l}`).join("\n");
    const elseBody = elseLines.map(l => `\t${l}`).join("\n");
    return `if ${condition} then\n${ifBody}\nelse\n${elseBody}\nend if`;
  }

  /** Repeat with i from 1 to 5 */
  static repeatWith(varName, from, to, bodyLines = []) {
    const body = bodyLines.map(line => `\t${line}`).join("\n");
    return `repeat with ${varName} from ${from} to ${to}\n${body}\nend repeat`;
  }

  /** Repeat while condition */
  static repeatWhile(condition, bodyLines = []) {
    const body = bodyLines.map(line => `\t${line}`).join("\n");
    return `repeat while ${condition}\n${body}\nend repeat`;
  }

  /** Delay in seconds */
  static delay(seconds) {
    return `delay ${seconds}`;
  }

  /** Run shell command */
  static shell(cmd) {
    return `do shell script "${cmd.replace(/"/g, '\\"')}"`;
  }

  /** Activate application */
  static activateApp(appName) {
    return `tell application "${appName}" to activate`;
  }

  /** Open a file using full POSIX path */
  static openFile(posixPath) {
    return `open POSIX file "${posixPath}"`;
  }

  /** Comment line */
  static comment(text) {
    return `-- ${text}`;
  }
  /** Speak text out loud */
  static speak(text, voice = null) {
    const safeText = `"${text}"`;
    if (voice) {
      return `say ${safeText} using "${voice}"`;
    }
    return `say ${safeText}`;
  }

  /**
   * Toggles full screen of the frontmost app window.
   */
  static fullscreenFrontApp() {
    return `tell application "System Events"
  tell application process (name of first application process whose frontmost is true)
    tell window 1
      set value of attribute "AXFullScreen" to not (value of attribute "AXFullScreen")
    end tell
  end tell
end tell`;
  }



  /**
* Waits until the given application becomes frontmost.
* @param {string} appName - The name of the application to wait for.
* @returns {string} AppleScript code that polls until the app is frontmost.
*/
  static awaitAppIsFrontmost(appName) {
    return [
      `repeat until frontmost of application "${appName}" is true`,
      `\tdelay 0.1`,
      `end repeat`
    ].join("\n");
  }
  static activateAndAwait(appName) {
    return [
      AppleScript.activateApp(appName),
      AppleScript.awaitAppIsFrontmost(appName)
    ].join("\n");
  }

  static AppleCodeBlock(...statements) {
    return [...statements]
  }
  /**Disaptches a named event triggering the system-events functionality */
  static dispatchSystemEvent(eventName) {
    const map = {
      // Navigation gestures
      "swipe-left": `tell application "System Events" to key code 124 using {control down}`,
      "swipe-right": `tell application "System Events" to key code 123 using {control down}`,
      "swipe-up": `tell application "System Events" to key code 126 using {control down}`,
      "swipe-down": `tell application "System Events" to key code 125 using {control down}`,

      // Desktop switching
      "switch-desktop-left": `tell application "System Events" to key code 123 using {control down}`,
      "switch-desktop-right": `tell application "System Events" to key code 124 using {control down}`,

      // Mission control & expose
      "mission-control": `tell application "System Events" to key code 126 using {control down}`,
      "app-expose": `tell application "System Events" to key code 125 using {control down}`,

      // System control
      "lock-screen": `do shell script "pmset displaysleepnow"`,
      "start-screensaver": `tell application "System Events" to start current screen saver`,
      "empty-trash": `tell application "Finder" to empty the trash`,
      "take-screenshot": `do shell script "screencapture -x ~/Desktop/osascript-taken-shot_$(date +%s).png"`,
      "toggle-dark-mode": `do shell script "osascript -e 'tell application \\"System Events\\" to tell appearance preferences to set dark mode to not dark mode'"`,
      "do-not-disturb-on": `do shell script "defaults -currentHost write com.apple.notificationcenterui doNotDisturb -boolean true && killall NotificationCenter"`,
      "do-not-disturb-off": `do shell script "defaults -currentHost write com.apple.notificationcenterui doNotDisturb -boolean false && killall NotificationCenter"`
    };

    return map[eventName] || `-- Unknown system event: ${eventName}`;
  }

  /**
   * Browser automation commands
   * Safari is AppleScript-native, Chrome support depends on scripting permissions being enabled.
   */
  static browser = {
    /**
     * Open a URL in Safari (creates a new document if none exists).
     * @param {string} url - The URL to open.
     * @returns {string} AppleScript code
     */
    openInSafari(url) {
      return [
        `tell application "Safari"`,
        `\tactivate`,
        `\tif (count of windows) = 0 then`,
        `\t\tmake new document with properties {URL:"${url}"}`,
        `\telse`,
        `\t\tset URL of front document to "${url}"`,
        `\tend if`,
        `end tell`
      ].join("\n");
    },

    /**
     * Open a URL in Google Chrome (requires accessibility scripting).
     * @param {string} url - The URL to open.
     */
    openInChrome(url) {
      return [
        `tell application "Google Chrome"`,
        `\tactivate`,
        `\tif (count of windows) = 0 then`,
        `\t\tmake new window`,
        `\tend if`,
        `\ttell front window`,
        `\t\tset newTab to make new tab with properties {URL: "${url}"}`,
        `\tend tell`,
        `end tell`
      ].join("\n");
    },

    /**
     * Gets the current URL from Safari's front tab.
     * @returns {string} AppleScript code to get the current URL.
     */
    getCurrentURLFromSafari() {
      return `tell application "Safari" to return URL of front document`;
    },

    /**
     * Activates Safari.
     */
    activateSafari() {
      return `tell application "Safari" to activate`;
    },

    /**
     * Creates a new tab in Safari.
     * @param {string} url - URL to load in the new tab (optional).
     */
    newSafariTab(url = null) {
      if (url) {
        return [
          `tell application "Safari"`,
          `\ttell window 1`,
          `\t\tmake new tab at end of tabs with properties {URL:"${url}"}`,
          `\tend tell`,
          `end tell`
        ].join("\n");
      }
      return [
        `tell application "Safari"`,
        `\ttell window 1`,
        `\t\tmake new tab at end of tabs`,
        `\tend tell`,
        `end tell`
      ].join("\n");
    }
  };
  /**
 * Finder-related AppleScript commands.
 */
  static finder = {
    /**
     * Opens a folder in Finder.
     * @param {string} path - POSIX path to the folder.
     */
    openFolder(path) {
      return `tell application "Finder" to open POSIX file "${path}"`;
    },

    /**
     * Reveals a file or folder in Finder.
     * @param {string} path - POSIX path to the item.
     */
    revealInFinder(path) {
      return `tell application "Finder" to reveal POSIX file "${path}"`;
    },

    /**
     * Moves a file or folder to the trash.
     * @param {string} path - POSIX path to the item.
     */
    moveToTrash(path) {
      return `tell application "Finder" to delete POSIX file "${path}"`;
    },

    /**
     * Creates a new folder inside a directory.
     * @param {string} path - POSIX path where the new folder should be created.
     * @param {string} name - Name of the new folder.
     */
    createFolder(path, name) {
      return `tell application "Finder" to make new folder at POSIX file "${path}" with properties {name:"${name}"}`;
    },

    /**
     * Gets the paths of selected items in the front Finder window.
     */
    getSelectedItems() {
      return `tell application "Finder" to get selection`;
    },

    /**
     * Sets desktop wallpaper.
     * @param {string} imagePath - POSIX path to the image file.
     */
    setDesktopWallpaper(imagePath) {
      return [
        `tell application "System Events"`,
        `\ttell every desktop`,
        `\t\tset picture to "${imagePath}"`,
        `\tend tell`,
        `end tell`
      ].join("\n");
    }
  };
  /**
 * System control utilities using `do shell script` and AppleScript.
 * Useful for shutdown, logout, volume, brightness, screenshots, etc.
 */
  static systemControl = {
    /**
     * Shuts down the computer after confirmation.
     */
    shutdown() {
      return [
        `display dialog "Are you sure you want to shut down the computer?" buttons {"Cancel", "OK"} default button "Cancel"`,
        `if button returned of result is "OK" then`,
        `\ttell application "System Events" to shut down`,
        `end if`
      ].join("\n");
    },

    /**
     * Restarts the computer (no confirmation).
     */
    restart() {
      return `tell application "System Events" to restart`;
    },

    /**
     * Logs out the current user after confirmation.
     */
    logout() {
      return [
        `display dialog "Are you sure you want to log out?" buttons {"Cancel", "OK"} default button "Cancel"`,
        `if button returned of result is "OK" then`,
        `\ttell application "System Events" to log out`,
        `end if`
      ].join("\n");
    },

    /**
     * Locks the screen after confirmation.
     */
    lockScreen() {
      return [
        `display dialog "Do you want to lock the screen?" buttons {"Cancel", "OK"} default button "Cancel"`,
        `if button returned of result is "OK" then`,
        `\tdo shell script "pmset displaysleepnow"`,
        `end if`
      ].join("\n");
    },

    /**
     * Starts the screensaver immediately.
     */
    startScreensaver() {
      return `tell application "System Events" to start current screen saver`;
    },

    /**
     * Empties the trash after confirmation.
     */
    emptyTrash() {
      return [
        `display dialog "Are you sure you want to empty the Trash?" buttons {"Cancel", "OK"} default button "Cancel"`,
        `if button returned of result is "OK" then`,
        `\ttell application "Finder" to empty the trash`,
        `end if`
      ].join("\n");
    },

    /**
     * Ejects all mounted external volumes.
     */
    ejectAllDisks() {
      return `do shell script "diskutil eject /Volumes/*"`;
    },

    /**
     * Takes a screenshot and saves it to Desktop.
     */
    screenshotToDesktop() {
      return `do shell script "screencapture -x ~/Desktop/screenshot_$(date +%s).png"`;
    },

    /**
     * Sets system volume (0–100).
     * @param {number} volume
     */
    setVolume(volume) {
      const level = Math.max(0, Math.min(100, volume));
      return `set volume output volume ${level}`;
    },

    /**
     * Toggles system mute.
     * @param {boolean} mute
     */
    toggleMute(mute = true) {
      return `set volume ${mute ? "with" : "without"} output muted`;
    },



    /**
     * Enables or disables Do Not Disturb (older macOS versions only).
     * @param {boolean} enable
     */
    toggleDoNotDisturb(enable = true) {
      const flag = enable ? "true" : "false";
      return `do shell script "defaults -currentHost write com.apple.notificationcenterui doNotDisturb -boolean ${flag} && killall NotificationCenter"`;
    },

    /**
     * Enables dark mode using shell.
     */
    enableDarkMode() {
      return `do shell script "osascript -e 'tell application \\"System Events\\" to tell appearance preferences to set dark mode to true'"`;
    },

    /**
     * Disables dark mode using shell.
     */
    disableDarkMode() {
      return `do shell script "osascript -e 'tell application \\"System Events\\" to tell appearance preferences to set dark mode to false'"`;
    },

    /**
     * Toggles dark mode state.
     */
    toggleDarkMode() {
      return `do shell script "osascript -e 'tell application \\"System Events\\" to tell appearance preferences to set dark mode to not dark mode'"`;
    }

    ,
    /** Puts the Mac to sleep (not just display) */
    sleepMac() {
      return `tell application "System Events" to sleep`;
    },

    /** Restarts Finder (helpful when it hangs) */
    restartFinder() {
      return `do shell script "killall Finder"`;
    },

    /** Relaunches Dock to refresh icons or spacing */
    restartDock() {
      return `do shell script "killall Dock"`;
    },

    /** Toggles Night Shift mode (requires macOS Catalina+) */
    toggleNightShift() {
      return `do shell script "osascript -e 'tell application \\"System Events\\" to tell appearance preferences to set night shift to not night shift'"`;
    },

    /** Opens System Settings at a specific pane */
    openSettingsPane(pane = "General") {
      return `do shell script "open x-apple.systempreferences:${pane}"`;
    },

    /** Displays the battery percentage using Notification */
    showBatteryLevel() {
      return [
        `set batteryLevel to do shell script "pmset -g batt | grep -Eo '\\d+%'"`,
        `display notification "Battery at " & batteryLevel with title "🔋 Battery Status"`
      ].join("\n");
    },

    /** Ejects a specific volume by name */
    ejectVolume(volumeName) {
      return `do shell script "diskutil eject '/Volumes/${volumeName}'"`;
    },

    /** Shows all connected external disks */
    listExternalDisks() {
      return `do shell script "diskutil list external | grep '/dev/'"`;
    },

    /** Displays storage usage in a dialog */
    showStorageUsage() {
      return [
        `set usage to do shell script "df -h / | tail -1 | awk '{print $3 \\" used of \\" $2}'"`,
        `display dialog "Disk usage: " & usage buttons {"OK"} default button 1`
      ].join("\n");
    },

    /** Get CPU temperature (requires 'osx-cpu-temp' CLI) */
    getCPUTemperature() {
      return `do shell script "osx-cpu-temp"`;
    },

    /** Get list of running processes */
    listRunningApps() {
      return `do shell script "ps -A -o comm | grep -E '.app'"`;
    },

    /** Kill a process by name */
    killProcess(processName) {
      return `do shell script "killall '${processName}'"`;
    },

    /** Displays current Wi-Fi network name */
    showWiFiNetwork() {
      return [
        `set wifiName to do shell script "networksetup -getairportnetwork en0 | cut -d':' -f2"`,
        `display notification "Connected to" & wifiName with title "📶 Wi-Fi"`
      ].join("\n");
    },

    /** Enables screen recording permission prompt (helpful for automation setup) */
    requestScreenRecordingPermission() {
      return `do shell script "tccutil reset ScreenCapture com.apple.AppleScript"`;
    },

    /** Restart menu bar (control center, etc.) */
    restartMenuBar() {
      return `do shell script "killall ControlCenter; killall SystemUIServer"`;
    },

    /** Open Energy Saver preferences */
    openEnergySaverSettings() {
      return `do shell script "open x-apple.systempreferences:com.apple.preference.energysaver"`;
    }


  };

  /**
   * Fun & experimental AI-related utilities (Siri, ChatGPT, etc.)
   * Note: Siri scripting is limited — these are conceptual or use workarounds.
   */
  static ai = {
    /**
     * Ask Siri a question (macOS Ventura+ with Siri enabled)
     * Requires Accessibility permissions.
     * @param {string} question - What to ask Siri
     * @returns {string} AppleScript code
     */
    askSiri(question) {
      return [
        `tell application "System Events"`,
        `\ttell process "Siri"`,
        `\t\tset frontmost to true`,
        `\tend tell`,
        `end tell`,
        `delay 0.5`,
        `tell application "System Events" to keystroke "${question}"`,
        `tell application "System Events" to keystroke return`
      ].join("\n");
    },

    /**
     * Open ChatGPT in browser and auto-paste prompt (if logged in)
     * @param {string} prompt - Your question for ChatGPT
     * @returns {string} AppleScript code
     */
    openChatGPTWithPrompt(prompt) {
      const encoded = encodeURIComponent(prompt);
      const url = `https://chat.openai.com/?q=${encoded}`;
      return [
        AppleScript.browser.openInSafari(url),
        `delay 2`,
        `tell application "System Events" to keystroke "v" using {command down}`
      ].join("\n");
    },

    /**
     * Speak a joke using system voice (fetches from a hardcoded list)
     * @returns {string} AppleScript code
     */
    tellJoke() {
      const jokes = [
        "Why don’t scientists trust atoms? Because they make up everything!",
        "I told my computer I needed a break... now it won’t stop sending me Kit-Kats.",
        "Why did the JavaScript developer go broke? Because he used up all his cache!"
      ];
      const joke = jokes[Math.floor(Math.random() * jokes.length)];
      return AppleScript.speak(joke, "Samantha");
    }


    ,/** Ask ChatGPT via Safari and auto-paste + send prompt */
    askChatGPT(prompt) {
      const encoded = encodeURIComponent(prompt);
      const url = `https://chat.openai.com/?q=${encoded}`;
      return [
        `tell application "Safari"`,
        `\tactivate`,
        `\tif (count of windows) = 0 then make new document`,
        `\tset URL of front document to "${url}"`,
        `end tell`,
        `delay 2`,
        `tell application "System Events" to keystroke return`
      ].join("\n");
    },

    /** Generate a random motivational quote and speak it */
    motivateUser() {
      const quotes = [
        "Keep pushing forward, success is near!",
        "Every great journey starts with one small step.",
        "Your potential is limitless. Don’t stop now.",
        "You’re stronger than your doubts. Believe it.",
        "Consistency beats talent every time."
      ];
      const quote = quotes[Math.floor(Math.random() * quotes.length)];
      return [
        `display notification "${quote}" with title "💪 Motivation Boost"`,
        `say "${quote}" using "Samantha"`
      ].join("\n");
    },

    /** Summarize clipboard text using local shell + GPT (if installed via CLI tools like 'gpt') */
    summarizeClipboard() {
      return [
        `set clipText to the clipboard`,
        `do shell script "echo " & quoted form of clipText & " | gpt -s 'Summarize clearly in one sentence'"`,
        `display notification "Summary complete." with title "🧠 AI Summary"`
      ].join("\n");
    },

    /** Read aloud clipboard contents */
    readClipboard() {
      return [
        `set clipText to the clipboard`,
        `say clipText using "Samantha"`
      ].join("\n");
    },

    /** Daily affirmation using voice + notification */
    dailyAffirmation() {
      const affirmations = [
        "I am focused, capable, and calm.",
        "I attract positivity and progress.",
        "Every challenge helps me grow stronger.",
        "I create my own opportunities.",
        "Today, I am exactly where I need to be."
      ];
      const a = affirmations[Math.floor(Math.random() * affirmations.length)];
      return [
        `display notification "${a}" with title "🌞 Daily Affirmation"`,
        `say "${a}" using "Samantha"`
      ].join("\n");
    },

    /** Generate random programming wisdom */
    devWisdom() {
      const wisdom = [
        "Debugging is like being the detective in a crime movie where you are also the murderer.",
        "A clean codebase is like a well-kept garden: prune often.",
        "The best code is the one you never had to write.",
        "Naming things is the hardest problem in computer science.",
        "Measure twice, deploy once."
      ];
      const quote = wisdom[Math.floor(Math.random() * wisdom.length)];
      return [
        `display notification "${quote}" with title "💻 Dev Wisdom"`,
        `say "${quote}" using "Samantha"`
      ].join("\n");
    },

    /** AI assistant introduction */
    introduceYourself() {
      return [
        `say "Hello! I’m your Apple.js AI assistant. Ready to help automate your Mac." using "Samantha"`,
        `display notification "Apple.js Assistant is active." with title "🤖 Ready!"`
      ].join("\n");
    },

    /** Random tech joke using Siri voice */
    tellTechJoke() {
      const jokes = [
        "Why do programmers hate nature? It has too many bugs.",
        "I told Siri a joke about recursion, but she didn’t get it — she just kept repeating it.",
        "Why did the computer show up at work late? It had a hard drive!",
        "Why was the JavaScript developer sad? Because they didn’t know how to null their feelings.",
        "What’s a computer’s favorite snack? Microchips!"
      ];
      const joke = jokes[Math.floor(Math.random() * jokes.length)];
      return [
        `display notification "${joke}" with title "😂 Tech Humor"`,
        `say "${joke}" using "Samantha"`
      ].join("\n");
    },

    /** Compose a random friendly message to lift mood */
    friendlyMessage() {
      const messages = [
        "Hey there, just a reminder that you’re doing great today!",
        "Don’t forget to take a deep breath — you’ve got this!",
        "You’ve already accomplished more than you think.",
        "Keep smiling, it confuses the bugs.",
        "One small step for you, one giant leap for productivity!"
      ];
      const msg = messages[Math.floor(Math.random() * messages.length)];
      return [
        `display notification "${msg}" with title "🌻 Friendly Ping"`,
        `say "${msg}" using "Victoria"`
      ].join("\n");
    },

    /** Opens ChatGPT in Chrome with the given question */
    openChatGPTChrome(question) {
      const encoded = encodeURIComponent(question);
      return [
        `tell application "Google Chrome"`,
        `\tactivate`,
        `\tif (count of windows) = 0 then make new window`,
        `\tset URL of active tab of front window to "https://chat.openai.com/?q=${encoded}"`,
        `end tell`
      ].join("\n");
    },

    /** AI meditation session */
    startMeditation() {
      const lines = [
        "Close your eyes and take a deep breath.",
        "Let go of any tension in your shoulders.",
        "Feel your breath move through your body.",
        "You are calm, focused, and grounded."
      ];
      const joined = lines.join(" ");
      return [
        `display notification "Starting mindfulness session" with title "🧘 AI Meditation"`,
        `say "${joined}" using "Samantha"`
      ].join("\n");
    },

    /** Random compliment generator */
    giveCompliment() {
      const compliments = [
        "You have an excellent taste in automation tools.",
        "Your workflow is cleaner than a fresh macOS install.",
        "You’re the kind of developer Apple would hire.",
        "You make scripting look easy.",
        "You’re crushing it today!"
      ];
      const line = compliments[Math.floor(Math.random() * compliments.length)];
      return [
        `display notification "${line}" with title "💬 Compliment"`,
        `say "${line}" using "Zarvox"`
      ].join("\n");
    },

    /** AI focus reminder every 15 minutes */
    focusReminder() {
      return [
        `repeat 3 times`,
        `\tdelay 900`,
        `\tdisplay notification "Stay focused! Take a short stretch." with title "🧘 Focus Reminder"`,
        `\tsay "Stay focused! Take a short stretch break." using "Samantha"`,
        `end repeat`
      ].join("\n");
    },

    /** AI news reader — opens Apple News and speaks intro */
    readDailyNews() {
      return [
        `tell application "News" to activate`,
        `delay 1`,
        `say "Here are your top headlines for today." using "Samantha"`
      ].join("\n");
    },

    /** Predicts your productivity level randomly 😅 */
    predictProductivity() {
      const predictions = [
        "Your productivity will peak right after coffee.",
        "Take it slow today, creative energy is coming later.",
        "You’re unstoppable today — code like lightning!",
        "Your Mac senses you’re in deep work mode.",
        "Avoid meetings today — focus on building!"
      ];
      const p = predictions[Math.floor(Math.random() * predictions.length)];
      return [
        `display notification "${p}" with title "🔮 Productivity Forecast"`,
        `say "${p}" using "Samantha"`
      ].join("\n");
    }



  };

  /**
  * Media control utilities — Music, QuickTime, Photos
  */
  static media = {
    /**
     * Play/Pause Music.app (formerly iTunes)
     */
    toggleMusicPlayPause() {
      return `tell application "Music" to playpause`;
    },

    /**
     * Play specific track in Music.app
     * @param {string} trackName
     * @param {string} artistName (optional)
     */
    playTrack(trackName, artistName = null) {
      if (artistName) {
        return [
          `tell application "Music"`,
          `\tplay track "${trackName}" of artist "${artistName}"`,
          `end tell`
        ].join("\n");
      }
      return [
        `tell application "Music"`,
        `\tplay track "${trackName}"`,
        `end tell`
      ].join("\n");
    },

    /**
     * Increase Music volume by 10%
     */
    musicVolumeUp() {
      return `tell application "Music" to set sound volume to (sound volume + 10)`;
    },

    /**
     * Decrease Music volume by 10%
     */
    musicVolumeDown() {
      return `tell application "Music" to set sound volume to (sound volume - 10)`;
    },

    /**
     * Start screen recording via QuickTime Player
     */
    startScreenRecording() {
      return [
        `tell application "QuickTime Player"`,
        `\tactivate`,
        `\tnew screen recording`,
        `\tdelay 1`,
        `\ttell application "System Events" to click button "Record" of window 1`,
        `end tell`
      ].join("\n");
    },

    /**
     * Take photo with FaceTime HD Camera using Photo Booth
     */
    takePhotoBoothPhoto() {
      return [
        `tell application "Photo Booth" to activate`,
        `delay 1`,
        `tell application "System Events" to keystroke " "`
      ].join("\n");
    }
  };

  /**
  * Advanced UI interaction — simulate mouse, clicks, drag
  * Requires: System Preferences > Security & Privacy > Accessibility > Script Editor / Terminal
  */
  static ui = {
    /**
     * Click at specific screen coordinates (x, y)
     * @param {number} x
     * @param {number} y
     */
    clickAt(x, y) {
      return [
        `tell application "System Events"`,
        `\ttell application process "Finder"`,
        `\t\tclick at {${x}, ${y}}`,
        `\tend tell`,
        `end tell`
      ].join("\n");
    },

    /**
     * Double-click at coordinates
     * @param {number} x
     * @param {number} y
     */
    doubleClickAt(x, y) {
      return [
        `tell application "System Events"`,
        `\ttell application process "Finder"`,
        `\t\tdouble click at {${x}, ${y}}`,
        `\tend tell`,
        `end tell`
      ].join("\n");
    },

    /**
     * Right-click (secondary click) at coordinates
     * @param {number} x
     * @param {number} y
     */
    rightClickAt(x, y) {
      return [
        `tell application "System Events"`,
        `\ttell application process "Finder"`,
        `\t\tclick at {${x}, ${y}} right`,
        `\tend tell`,
        `end tell`
      ].join("\n");
    },

    /**
     * Type a string with optional delay between keystrokes (for realism)
     * @param {string} text
     * @param {number} delaySeconds (optional, per keystroke)
     */
    typeText(text, delaySeconds = 0.05) {
      const lines = [];
      for (let char of text) {
        if (char === "\\") {
          lines.push(`keystroke "\\\\"`);
        } else if (char === '"') {
          lines.push(`keystroke "\\""`); // Escape AppleScript quote
        } else {
          lines.push(`keystroke "${char}"`);
        }
        if (delaySeconds > 0) lines.push(`delay ${delaySeconds}`);
      }
      return [
        `tell application "System Events"`,
        `\t${lines.join("\n\t")}`,
        `end tell`
      ].join("\n");
    }



    ,
    /** Presses Command+Tab to switch to next app */
    switchApp() {
      return `tell application "System Events" to key code 48 using {command down}`;
    },

    /** Presses Command+Shift+Tab to switch backward */
    switchAppBack() {
      return `tell application "System Events" to key code 48 using {command down, shift down}`;
    },

    /** Minimize frontmost window */
    minimizeFrontWindow() {
      return [
        `tell application "System Events"`,
        `\ttell (process 1 where frontmost is true)`,
        `\t\tset value of attribute "AXMinimized" of window 1 to true`,
        `\tend tell`,
        `end tell`
      ].join("\n");
    },

    /** Maximize frontmost window */
    maximizeFrontWindow() {
      return [
        `tell application "System Events"`,
        `\ttell (process 1 where frontmost is true)`,
        `\t\tset value of attribute "AXZoomed" of window 1 to true`,
        `\tend tell`,
        `end tell`
      ].join("\n");
    },

    /** Move frontmost window to top-left of screen */
    moveWindowTopLeft() {
      return [
        `tell application "System Events"`,
        `\ttell (process 1 where frontmost is true)`,
        `\t\tset position of window 1 to {0, 0}`,
        `\tend tell`,
        `end tell`
      ].join("\n");
    },

    /** Resize front window to given width/height */
    resizeFrontWindow(width = 800, height = 600) {
      return [
        `tell application "System Events"`,
        `\ttell (process 1 where frontmost is true)`,
        `\t\tset size of window 1 to {${width}, ${height}}`,
        `\tend tell`,
        `end tell`
      ].join("\n");
    },

    /** Simulate copy (Cmd+C) */
    copy() {
      return `tell application "System Events" to keystroke "c" using {command down}`;
    },

    /** Simulate paste (Cmd+V) */
    paste() {
      return `tell application "System Events" to keystroke "v" using {command down}`;
    },

    /** Simulate select-all (Cmd+A) */
    selectAll() {
      return `tell application "System Events" to keystroke "a" using {command down}`;
    },

    /** Simulate undo (Cmd+Z) */
    undo() {
      return `tell application "System Events" to keystroke "z" using {command down}`;
    },

    /** Simulate redo (Cmd+Shift+Z) */
    redo() {
      return `tell application "System Events" to keystroke "z" using {command down, shift down}`;
    },

    /** Press ESC key */
    pressEscape() {
      return `tell application "System Events" to key code 53`;
    },

    /** Press Spacebar */
    pressSpace() {
      return `tell application "System Events" to key code 49`;
    },

    /** Press Arrow key (direction: up, down, left, right) */
    pressArrow(direction = "down") {
      const map = { up: 126, down: 125, left: 123, right: 124 };
      return `tell application "System Events" to key code ${map[direction] || 125}`;
    },

    /** Triple-click at coordinates */
    tripleClickAt(x, y) {
      return [
        `tell application "System Events"`,
        `\ttell process "Finder"`,
        `\t\tdouble click at {${x}, ${y}}`,
        `\t\tdelay 0.1`,
        `\t\tclick at {${x}, ${y}}`,
        `\tend tell`,
        `end tell`
      ].join("\n");
    },

    /** Scroll smoothly with short delays */
    smoothScroll(direction = "down", steps = 10, delayBetween = 0.05) {
      const key = direction === "up" ? 126 : 125;
      return [
        `tell application "System Events"`,
        `\trepeat ${steps} times`,
        `\t\tkey code ${key}`,
        `\t\tdelay ${delayBetween}`,
        `\tend repeat`,
        `end tell`
      ].join("\n");
    },

    /** Highlight and select front window’s title text (for renaming files, etc.) */
    highlightWindowTitle() {
      return [
        `tell application "System Events"`,
        `\ttell (process 1 where frontmost is true)`,
        `\t\ttry`,
        `\t\t\tperform action "AXRaise" of window 1`,
        `\t\t\tkey code 36`,
        `\t\tend try`,
        `\tend tell`,
        `end tell`
      ].join("\n");
    }



  };

  /**
  * macOS User Notification Center alerts
  * Requires: macOS 10.8+
  */
  static notifications = {
    /**
     * Display a user notification with title, subtitle, and message
     * @param {string} title
     * @param {string} subtitle
     * @param {string} message
     */
    alert(title, subtitle, message) {
      return `display notification "${message}" with title "${title}" subtitle "${subtitle}"`;
    },

    /**
     * Simple banner notification
     * @param {string} message
     */
    banner(message) {
      return `display notification "${message}"`;
    },

    /**
     * Alert with sound
     * @param {string} title
     * @param {string} message
     * @param {string} soundName (e.g., "default", "Glass", "Blow", "Frog")
     */
    alertWithSound(title, message, soundName = "default") {
      return `display notification "${message}" with title "${title}" sound name "${soundName}"`;
    }
  };

  /**
  * Fun & Easter Egg Methods
  */
  static fun = {
    /**
     * Make the screen flash white briefly (like a camera flash)
     */
    screenFlash() {
      return [
        `tell application "System Events"`,
        `\tkey code 144 using {command down, option down} -- Decrease contrast`,
        `\tdelay 0.1`,
        `\tkey code 145 using {command down, option down} -- Increase contrast`,
        `end tell`
      ].join("\n");
    },

    /**
     * Make the Dock bounce an app icon (if app is not running)
     * @param {string} appName (e.g., "Safari")
     */
    bounceDockIcon(appName) {
      return [
        `tell application "System Events"`,
        `\ttell dock item "${appName}" of dock preferences`,
        `\t\tlaunch`,
        `\tend tell`,
        `end tell`
      ].join("\n");
    },

    /**
     * Hide all windows except frontmost app (like ⌘+Option+H)
     */
    hideOtherApps() {
      return `tell application "System Events" to keystroke "h" using {command down, option down}`;
    },

    /**
     * Play the famous "Sosumi" alert sound (classic Mac easter egg)
     */
    playSosumi() {
      return `do shell script "afplay /System/Library/Sounds/Sosumi.aiff"`;
    },

    /**
     * Make your Mac say something funny in a dramatic voice
     * @param {string} phrase
     */
    dramaticAnnouncement(phrase = "The machines are rising.") {
      return AppleScript.speak(phrase, "Zarvox");
    }
  };

  /**
 * Opens a URL in the default browser (figures out which is default via shell).
 * More reliable than guessing Safari or Chrome.
 * @param {string} url - The URL to open.
 * @returns {string} AppleScript code
 */
  static openInDefaultBrowser(url) {
    return `do shell script "open '${url}'"`;
  }

  /**
  * Gets the current date and time as a formatted string (via shell).
  * @param {string} format - Optional. Uses `date` command format (e.g., "+%Y-%m-%d %H:%M")
  * @returns {string} AppleScript code that returns the formatted date
  */
  static getCurrentDateTime(format = "+%Y-%m-%d %H:%M:%S") {
    return `do shell script "date '${format}'"`;
  }

  /**
  * Copies text to clipboard using pbcopy.
  * @param {string} text - Text to copy
  * @returns {string} AppleScript code
  */
  static copyToClipboard(text) {
    const safeText = text.replace(/"/g, '\\"').replace(/'/g, `\\'`);
    return `do shell script "echo '${safeText}' | pbcopy"`;
  }

  /**
  * Pastes clipboard contents (simulates Cmd+V).
  * Useful after copyToClipboard or manual copy.
  * @returns {string} AppleScript code
  */
  static pasteFromClipboard() {
    return `tell application "System Events" to keystroke "v" using {command down}`;
  }

  /**
  * Simulates pressing a global hotkey (e.g., Cmd+Space for Spotlight).
  * @param {string} key - Single key or keycode (e.g., "space", "123")
  * @param {string[]} modifiers - Array like ["command", "shift", "control", "option"]
  * @returns {string} AppleScript code
  */
  static pressHotkey(key, modifiers = []) {
    const modMap = {
      command: "command down",
      shift: "shift down",
      control: "control down",
      option: "option down"
    };
    const mods = modifiers.map(m => modMap[m] || "").filter(Boolean).join(", ");
    const usingClause = mods ? ` using {${mods}}` : "";
    return `tell application "System Events" to keystroke "${key}"${usingClause}`;
  }

  /**
  * Gets the name of the frontmost application.
  * @returns {string} AppleScript code that returns app name
  */
  static getFrontmostApp() {
    return `tell application "System Events" to get name of first application process whose frontmost is true`;
  }

  /**
  * Displays a large alert using 'osascript' with bigger dialog (via shell).
  * More attention-grabbing than display dialog.
  * @param {string} message
  * @param {string} title (optional)
  * @returns {string} AppleScript code
  */
  static bigAlert(message, title = "Alert") {
    const safeMsg = message.replace(/"/g, '\\"');
    const safeTitle = title.replace(/"/g, '\\"');
    return `do shell script "osascript -e 'display alert \\"${safeTitle}\\" message \\"${safeMsg}\\"'"`
  }

  /**
  * Shows a notification AND speaks it aloud — great for accessibility or attention.
  * @param {string} message
  * @param {string} voice (optional)
  * @returns {string} AppleScript code
  */
  static announce(message, voice = "Samantha") {
    return [
      AppleScript.notifications.banner(message),
      AppleScript.speak(message, voice)
    ].join("\n");
  }

  /**
  * Gets battery percentage of MacBook (if available).
  * @returns {string} AppleScript code that returns battery % as string
  */
  static getBatteryLevel() {
    return `do shell script "pmset -g batt | grep -Eo '\\d+%' | cut -d% -f1"`;
  }

  /**
  * Checks if laptop is plugged in.
  * @returns {string} AppleScript code returning "AC Power" or "Battery Power"
  */
  static getPowerSource() {
    return `do shell script "pmset -g ps | grep 'Now drawing' | cut -d'(' -f2 | cut -d' ' -f1"`;
  }

  /**
  * Sets screen brightness via shell (requires sudo or brightness tool installed).
  * @param {number} level - 0.0 to 1.0
  * @returns {string} AppleScript code (note: may require external tool like 'brightness')
  */
  static setBrightness(level) {
    const clamped = Math.max(0, Math.min(1, level));
    // Note: macOS doesn’t allow brightness via AppleScript natively — requires helper
    return `-- ⚠️ Requires 'brightness' CLI tool: brew install brightness\n` +
      `do shell script "brightness ${clamped}"`;
  }

  /**
  * Gets current screen resolution.
  * @returns {string} AppleScript code returning "width x height"
  */
  static getScreenResolution() {
    return `do shell script "system_profiler SPDisplaysDataType | grep Resolution | awk '{print $2, $4}' | tr -d '\\n'"`;
  }

  /**
  * Gets macOS version.
  * @returns {string} AppleScript code returning version string
  */
  static getMacOSVersion() {
    return `do shell script "sw_vers -productVersion"`;
  }

  /**
  * Gets username of current user.
  * @returns {string} AppleScript code
  */
  static getCurrentUser() {
    return `do shell script "whoami"`;
  }

  /**
  * Gets machine’s local hostname.
  * @returns {string} AppleScript code
  */
  static getHostName() {
    return `do shell script "hostname"`;
  }

  /**
  * Creates a spoken countdown from N to 1, then says “Go!”.
  * Great for timers, presentations, or Pomodoro.
  * @param {number} startFrom - Number to start from (e.g., 5)
  * @param {string} voice - Voice to use
  * @returns {string} AppleScript code
  */
  static countdown(startFrom = 5, voice = "Samantha") {
    const lines = [];
    for (let i = startFrom; i >= 1; i--) {
      lines.push(AppleScript.speak(i.toString(), voice));
      lines.push(AppleScript.delay(1));
    }
    lines.push(AppleScript.speak("Go!", voice));
    return lines.join("\n");
  }

  /**
  * Types “Hello World” with dramatic pauses and sound — perfect for demos.
  * @returns {string} AppleScript code
  */
  static demoTypeHelloWorld() {
    return [
      AppleScript.speak("Initiating demo sequence", "Zarvox"),
      AppleScript.delay(1),
      AppleScript.ui.typeText("Hello", 0.3),
      AppleScript.delay(0.5),
      AppleScript.ui.typeText(" World!", 0.3),
      AppleScript.delay(0.5),
      AppleScript.fun.playSosumi(),
      AppleScript.speak("Demo complete.", "Zarvox")
    ].join("\n");
  }



  /**
  * Shuts down gently with spoken warning and countdown.
  * @param {number} countdownSeconds - How long to wait before shutdown (default 10)
  * @returns {string} AppleScript code
  */
  static gentleShutdown(countdownSeconds = 10) {
    const lines = [
      AppleScript.speak(`System will shut down in ${countdownSeconds} seconds.`, "Samantha"),
      AppleScript.bigAlert(`Shutting down in ${countdownSeconds}s`, "System Alert")
    ];
    for (let i = countdownSeconds - 1; i > 0; i--) {
      lines.push(AppleScript.speak(i.toString(), "Samantha"));
      lines.push(AppleScript.delay(1));
    }
    lines.push(AppleScript.speak("Goodbye.", "Samantha"));
    lines.push(AppleScript.systemControl.shutdown());
    return lines.join("\n");
  }

  /**
  * “Focus Mode” — Hides all apps, mutes sound, enables Do Not Disturb, speaks confirmation.
  * @returns {string} AppleScript code
  */
  static focusMode() {
    return [
      AppleScript.speak("Entering focus mode.", "Samantha"),
      AppleScript.fun.hideOtherApps(),
      AppleScript.systemControl.toggleMute(true),
      AppleScript.systemControl.toggleDoNotDisturb(true),
      AppleScript.setBrightness(0.7),
      AppleScript.notifications.alert("🧘 Focus Mode", "Activated", "All distractions silenced.")
    ].join("\n");
  }

  /**
  * “Party Mode” — Sets bright wallpaper, plays music, disables DND, speaks welcome.
  * @param {string} playlistName - Optional playlist to play in Music.app
  * @returns {string} AppleScript code
  */
  static partyMode(playlistName = "Party Hits") {
    return [
      AppleScript.speak("Let’s party!", "Boing"),
      AppleScript.systemControl.setVolume(80),
      AppleScript.systemControl.toggleMute(false),
      AppleScript.systemControl.toggleDoNotDisturb(false),
      AppleScript.setBrightness(1.0),
      AppleScript.shell(`osascript -e 'tell application "Music" to play playlist "${playlistName}"'`),
      AppleScript.finder.setDesktopWallpaper("/System/Library/Desktop Pictures/Solid Colors/Red.png"),
      AppleScript.notifications.alert("🎉 Party Mode", "Activated", "Crank it up!")
    ].join("\n");
  }

  /**
  * Speaks the current time aloud every minute for N minutes — great for Pomodoro or accessibility.
  * @param {number} minutes - How many minutes to announce
  * @param {string} voice - Voice to use
  * @returns {string} AppleScript code
  */
  static announceTimeEveryMinute(minutes = 5, voice = "Samantha") {
    const lines = [
      AppleScript.speak(`Time announcer starting for ${minutes} minutes.`, voice)
    ];
    for (let i = 0; i < minutes; i++) {
      lines.push(AppleScript.delay(60));
      lines.push(AppleScript.speak("The time is now...", voice));
      lines.push(`set currentTime to ${AppleScript.getCurrentDateTime("+%I:%M %p")}`);
      lines.push(`say currentTime using "${voice}"`);
    }
    lines.push(AppleScript.speak("Time announcer finished.", voice));
    return lines.join("\n");
  }
  /**
 * Application control namespace — global + app-specific automation.
 * Works with any macOS app that supports AppleScript or Accessibility access.
 */
static application = {
  /** Launch or bring an app to front */
  open(appName) {
    return `tell application "${appName}" to activate`;
  },

  /** Quit app gracefully */
  quit(appName) {
    return `tell application "${appName}" to quit`;
  },

  /** Force quit app immediately */
  forceQuit(appName) {
    return `do shell script "killall '${appName}'"`;
  },

  /** Relaunch app */
  relaunch(appName) {
    return [
      `do shell script "killall '${appName}'"`,
      `delay 1`,
      `tell application "${appName}" to activate`
    ].join("\n");
  },

  /** Check if an app is running */
  isRunning(appName) {
    return `do shell script "pgrep -x '${appName}' > /dev/null && echo true || echo false"`;
  },

  /** Get list of running applications */
  listRunningApps() {
    return `do shell script "osascript -e 'tell application \\"System Events\\" to get name of every process whose background only is false'"`;
  },

  /** Get frontmost application name */
  getFrontApp() {
    return `tell application "System Events" to get name of first application process whose frontmost is true`;
  },

  /** Bring all app windows to front */
  bringAllWindowsToFront(appName) {
    return `tell application "${appName}" to reopen`;
  },

  /** Hide an app */
  hide(appName) {
    return `tell application "${appName}" to set visible of every window to false`;
  },

  /** Unhide (show) an app */
  unhide(appName) {
    return `tell application "${appName}" to set visible of every window to true`;
  },

  /** Minimize all windows of an app */
  minimizeAll(appName) {
    return [
      `tell application "System Events"`,
      `\ttell process "${appName}"`,
      `\t\trepeat with w in windows`,
      `\t\t\tset value of attribute "AXMinimized" of w to true`,
      `\t\tend repeat`,
      `\tend tell`,
      `end tell`
    ].join("\n");
  },

  /** Close all app windows */
  closeAllWindows(appName) {
    return `tell application "${appName}" to close every window`;
  },

  /** Resize frontmost window of app */
  resizeWindow(appName, width = 800, height = 600) {
    return [
      `tell application "System Events"`,
      `\ttell process "${appName}"`,
      `\t\tset size of front window to {${width}, ${height}}`,
      `\tend tell`,
      `end tell`
    ].join("\n");
  },

  /** Move frontmost window to coordinates */
  moveWindow(appName, x = 100, y = 100) {
    return [
      `tell application "System Events"`,
      `\ttell process "${appName}"`,
      `\t\tset position of front window to {${x}, ${y}}`,
      `\tend tell`,
      `end tell`
    ].join("\n");
  },

  /** Toggle fullscreen mode for app window */
  toggleFullscreen(appName) {
    return [
      `tell application "System Events"`,
      `\ttell process "${appName}"`,
      `\t\ttell front window to set value of attribute "AXFullScreen" to not (value of attribute "AXFullScreen")`,
      `\tend tell`,
      `end tell`
    ].join("\n");
  },

  /** Center window on screen (approximation) */
  centerWindow(appName) {
    return [
      `tell application "System Events"`,
      `\ttell process "${appName}"`,
      `\t\tset win to front window`,
      `\t\tset position of win to {200, 100}`,
      `\tend tell`,
      `end tell`
    ].join("\n");
  },

  /** Switch to next app (Command + Tab) */
  nextApp() {
    return `tell application "System Events" to key code 48 using {command down}`;
  },

  // ───────────────────────────────
  // 🔹 APP-SPECIFIC CONTROLS
  // ───────────────────────────────

  safari: {
    /** Open URL in Safari */
    openURL(url) {
      return [
        `tell application "Safari"`,
        `\tactivate`,
        `\tset URL of front document to "${url}"`,
        `end tell`
      ].join("\n");
    },
    /** Open new tab with URL */
    newTab(url) {
      return [
        `tell application "Safari"`,
        `\tmake new document with properties {URL:"${url}"}`,
        `end tell`
      ].join("\n");
    },
    /** Get tab titles */
    getTabs() {
      return `tell application "Safari" to get name of every tab of front window`;
    },
    /** Close all tabs */
    closeAllTabs() {
      return `tell application "Safari" to close every tab of front window`;
    },
    /** Refresh front tab */
    refresh() {
      return `tell application "Safari" to do JavaScript "location.reload()" in front document`;
    }
  },

  chrome: {
    /** Open URL in Chrome */
    openURL(url) {
      return [
        `tell application "Google Chrome"`,
        `\tactivate`,
        `\ttell window 1`,
        `\t\tset newTab to make new tab with properties {URL:"${url}"}`,
        `\tend tell`,
        `end tell`
      ].join("\n");
    },
    /** Get all tab titles */
    getTabs() {
      return `tell application "Google Chrome" to get title of every tab of front window`;
    },
    /** Close all except first tab */
    closeOtherTabs() {
      return [
        `tell application "Google Chrome"`,
        `\ttell window 1`,
        `\t\tclose (every tab whose index is not 1)`,
        `\tend tell`,
        `end tell`
      ].join("\n");
    },
    /** Reload current tab */
    reloadFrontTab() {
      return `tell application "Google Chrome" to reload active tab of front window`;
    }
  },

  finder: {
    /** Open Finder at path */
    open(path) {
      return `tell application "Finder" to open POSIX file "${path}"`;
    },
    /** Reveal file in Finder */
    reveal(path) {
      return `tell application "Finder" to reveal POSIX file "${path}"`;
    },
    /** Create new folder on Desktop */
    newFolder(name) {
      return `tell application "Finder" to make new folder at desktop with properties {name:"${name}"}`;
    },
    /** Open new Finder window on Desktop */
    showDesktop() {
      return `tell application "Finder" to make new Finder window to desktop`;
    }
  },

  terminal: {
    /** Run command in Terminal */
    runCommand(cmd) {
      return [
        `tell application "Terminal"`,
        `\tactivate`,
        `\tdo script "${cmd.replace(/"/g, '\\"')}" in front window`,
        `end tell`
      ].join("\n");
    },
    /** Open new tab optionally with command */
    newTab(cmd = null) {
      const base = [
        `tell application "Terminal"`,
        `\ttell window 1 to do script ""`,
        cmd ? `\tdo script "${cmd}" in selected tab of window 1` : ``,
        `end tell`
      ];
      return base.join("\n");
    },
    /** Clear terminal window */
    clear() {
      return `tell application "Terminal" to do script "clear" in front window`;
    }
  },

  mail: {
    /** Compose new mail */
    compose(to, subject, body) {
      return [
        `tell application "Mail"`,
        `\tset newMessage to make new outgoing message with properties {subject:"${subject}", content:"${body}", visible:true}`,
        `\ttell newMessage to make new to recipient at end of to recipients with properties {address:"${to}"}`,
        `end tell`
      ].join("\n");
    },
    /** Send all outgoing mail */
    sendAll() {
      return `tell application "Mail" to send every message of outbox`;
    },
    /** Check for new mail */
    checkMail() {
      return `tell application "Mail" to check for new mail`;
    }
  },

  notes: {
    /** Create new note */
    createNote(folder = "Notes", title, content) {
      return [
        `tell application "Notes"`,
        `\ttell folder "${folder}"`,
        `\t\tmake new note with properties {name:"${title}", body:"${content}"}`,
        `\tend tell`,
        `end tell`
      ].join("\n");
    },
    /** Show a specific note */
    showNote(title) {
      return `tell application "Notes" to show note "${title}"`;
    },
    /** List note names */
    listNotes() {
      return `tell application "Notes" to get name of every note`;
    }
  }
};

/**
 * DOM namespace — browser webpage control via JavaScript injection.
 * Works in Safari and Google Chrome using `do JavaScript` / `execute ... javascript`.
 * All strings are auto-escaped for osascript and AppleScript safety.
 */
static dom = {
  /**
   * Escapes JavaScript for safe embedding into AppleScript.
   * @private
   */
  _escape(jsCode) {
    return jsCode
      .replace(/\\/g, "\\\\")  // escape backslashes first
      .replace(/"/g, '\\"')    // escape double quotes
      .replace(/'/g, "\\'")    // escape single quotes (shell-safe)
      .replace(/\r?\n/g, " "); // flatten newlines
  },

  /**
   * Run arbitrary JavaScript in the frontmost tab of the given browser.
   * @param {string} jsCode - JavaScript to run
   * @param {"Safari"|"Google Chrome"} app
   */
  run(jsCode, app = "Google Chrome") {
    // Escape only what AppleScript actually needs escaped:
    const safeJS = jsCode
      .replace(/\\/g, "\\\\")   // backslashes first
      .replace(/"/g, '\\"')     // escape inner double quotes only
      .replace(/\r?\n/g, " ");  // flatten newlines inside JS
  
    if (app === "Safari") {
      return [
        `tell application "Safari"`,
        `\tdo JavaScript "${safeJS}" in front document`,
        `end tell`
      ].join("\n");
    } else {
      return [
        `tell application "Google Chrome"`,
        `\texecute front window's active tab javascript "${safeJS}"`,
        `end tell`
      ].join("\n");
    }
  }
  
,  

  /** Click an element by CSS selector */
  click(selector) {
    return this.run(`const el=document.querySelector("${selector}"); if(el) el.click();`);
  },

  /** Type text into an input field */
  type(selector, text) {
    return this.run(`
      const el=document.querySelector("${selector}");
      if(el){el.value="${text}";el.dispatchEvent(new Event('input',{bubbles:true}));}
    `);
  },

  /** Set element innerText or innerHTML */
  setContent(selector, content, html = false) {
    return this.run(`
      const el=document.querySelector("${selector}");
      if(el) el.${html ? "innerHTML" : "innerText"}="${content}";
    `);
  },

  /** Get text from an element (Safari supports returning values) */
  getText(selector) {
    return [
      `tell application "Safari"`,
      `do JavaScript "document.querySelector('${selector}').innerText" in front document`,
      `end tell`
    ].join(" ");
  },

  /** Scroll the page by an offset */
  scrollBy(x = 0, y = 500) {
    return this.run(`window.scrollBy(${x},${y});`);
  },

  /** Scroll to top or bottom of the page */
  scrollTo(position = "bottom") {
    if (position === "top") {
      return this.run(`window.scrollTo(0,0);`);
    } else {
      return this.run(`window.scrollTo(0,document.body.scrollHeight);`);
    }
  },

  /** Fill multiple fields with values */
  fillForm(fields = {}) {
    const lines = Object.entries(fields)
      .map(([sel, val]) => `if(document.querySelector("${sel}"))document.querySelector("${sel}").value="${val}";`)
      .join(" ");
    return this.run(lines);
  },

  /** Click button by text content */
  clickButtonByText(text) {
    return this.run(`
      const btns=[...document.querySelectorAll('button,input[type=button],input[type=submit]')];
      const b=btns.find(b=>(b.innerText||b.value||'').toLowerCase().includes("${text.toLowerCase()}"));
      if(b) b.click();
    `);
  },

  /** Highlight an element visually */
  highlight(selector) {
    return this.run(`
      const el=document.querySelector("${selector}");
      if(el){el.style.outline='3px solid magenta';el.scrollIntoView({behavior:'smooth',block:'center'});}
    `);
  },

  /** Simulate typing into the active element */
  simulateTyping(text, delaySeconds = 0.05) {
    return this.run(`
      let i=0;const t="${text}";
      const interval=setInterval(()=>{
        const el=document.activeElement;
        if(!el)return;
        el.value+=t[i];
        i++;
        if(i>=t.length)clearInterval(interval);
      },${delaySeconds * 1000});
    `);
  },

  /** Inject external JS file */
  injectScript(url) {
    return this.run(`
      const s=document.createElement('script');
      s.src="${url}";
      document.head.appendChild(s);
    `);
  },

  /** Inject CSS rules */
  injectCSS(css) {
    return this.run(`
      const st=document.createElement('style');
      st.innerText="${css}";
      document.head.appendChild(st);
    `);
  },

  /** Show alert in page context */
  alert(message) {
    return this.run(`alert("${message}");`);
  },

  /** Log to browser console */
  log(message) {
    return this.run(`console.log("${message}");`);
  },

  /** Get page title (Safari only) */
  getTitle() {
    return [
      `tell application "Safari"`,
      `do JavaScript "document.title" in front document`,
      `end tell`
    ].join(" ");
  },

  /** Get current page URL (Safari only) */
  getURL() {
    return [
      `tell application "Safari"`,
      `do JavaScript "window.location.href" in front document`,
      `end tell`
    ].join(" ");
  }
};









}

module.exports = { AppleScript }