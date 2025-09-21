
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
 *   AppleScript.speak("Hello world", "Alex")
 * ].join("\n");
 *
 * // Output:
 * // set greeting to "Hello world"
 * // display dialog greeting
 * // say "Hello world" using "Alex"
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

    static AppleCodeBlock(...statements){
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
static announce(message, voice = "Alex") {
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
static countdown(startFrom = 5, voice = "Alex") {
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
      AppleScript.speak(`System will shut down in ${countdownSeconds} seconds.`, "Alex"),
      AppleScript.bigAlert(`Shutting down in ${countdownSeconds}s`, "System Alert")
  ];
  for (let i = countdownSeconds - 1; i > 0; i--) {
      lines.push(AppleScript.speak(i.toString(), "Alex"));
      lines.push(AppleScript.delay(1));
  }
  lines.push(AppleScript.speak("Goodbye.", "Alex"));
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
static announceTimeEveryMinute(minutes = 5, voice = "Alex") {
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


}

module.exports={AppleScript}