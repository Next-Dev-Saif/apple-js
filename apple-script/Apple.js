
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
        `\t\tset active tab index to (index of newTab)`,
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

  


}

module.exports={AppleScript}