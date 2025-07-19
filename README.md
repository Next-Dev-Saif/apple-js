
# 🍎 apple-js

> Automate macOS using AppleScript — in JavaScript.

**apple-js** lets you control macOS with AppleScript using clean, familiar JavaScript syntax. It wraps common AppleScript tasks like app automation, Finder control, system events, and shell scripts — all in a persistent subprocess for fast execution.

---

## 📦 Installation

```bash
npm install apple-js-stable
```

Or run directly via:

```bash
npx apple-js-stable
```

---

## 🧠 Overview

`apple-js` exposes a single main interface: the `Osascript` class.

You can import and use it to execute AppleScript code dynamically from JavaScript.

```js
// index.js (main entry point of package)
import { Osascript } from "apple-js"; // This is the main class you interact with

const script = new Osascript(); // creates a persistent osascript runner
```

> ✅ `Osascript` is exported from `index.js` — the central module that contains all AppleScript functionality.

---

## ✨ Example Usage

```js
import { Osascript } from "apple-js";
const script = new Osascript();

async function run() {
  await script.executeScript([
    script.appleCommands.speak("Hello from Apple.js"),
    script.appleCommands.activateApp("Safari"),
    script.appleCommands.awaitAppIsFrontmost("Safari"),
    script.appleCommands.browser.openInSafari("https://www.apple.com")
  ]);

  await script.executeScript([
    script.appleCommands.systemControl.setVolume(30),
    script.appleCommands.systemControl.toggleMute(false),
    script.appleCommands.systemControl.screenshotToDesktop()
  ]);

  script.close();
}

run();
```

---

## 🔧 API Highlights

### 📜 Core AppleScript

| Method                        | Description                            |
|------------------------------|----------------------------------------|
| `display(msg)`               | Shows a dialog                         |
| `speak(text, voice?)`        | Speaks text out loud                   |
| `activateApp(appName)`       | Brings app to front                    |
| `awaitAppIsFrontmost(app)`   | Waits until app is active              |
| `set(varName, value)`        | Assigns AppleScript variable           |
| `shell(command)`             | Runs a shell command                   |

---

### 🧩 Helper Modules

All available through `script.appleCommands`.

#### 🖥 systemControl

| Function                      | Description                             |
|------------------------------|-----------------------------------------|
| `setVolume(50)`              | Sets output volume to 50%               |
| `toggleMute(true)`           | Mutes system audio                      |
| `shutdown()`                 | Shuts down with confirmation dialog     |
| `lockScreen()`               | Locks screen with confirmation          |
| `screenshotToDesktop()`      | Saves a screenshot on desktop           |
| `toggleDarkMode()`           | Switches dark/light appearance          |

#### 📁 finder

| Function                        | Description                        |
|--------------------------------|------------------------------------|
| `openFolder(path)`             | Opens folder in Finder             |
| `revealInFinder(path)`         | Reveals file/folder in Finder      |
| `setDesktopWallpaper(image)`   | Changes desktop wallpaper          |

#### 🌐 browser

| Function                           | Description                        |
|-----------------------------------|------------------------------------|
| `openInSafari(url)`               | Opens URL in Safari                |
| `openInChrome(url)`               | Opens URL in Chrome                |

#### 🧠 systemEvents

| Function                            | Description                        |
|------------------------------------|------------------------------------|
| `dispatchSystemEvent("swipe-left")`| Simulates Control+Arrow gestures   |
| `dispatchSystemEvent("lock-screen")`| Locks the screen                   |

---

## 🔀 Background Thread

The `Osascript` class runs AppleScript in a **persistent child process**, which:

- Keeps execution fast (no per-call spawn cost)
- Communicates via stdin/stdout for structured output
- Can be closed or restarted as needed

```js
script.close();      // Closes child process
script.restart();    // Restarts subprocess
```

---

## 🛠 Requirements

- macOS (tested on Monterey, Ventura)
- Node.js 18+
- For brightness control:  
  ```bash
  brew install brightness
  ```

---

## 📁 File Structure (Simplified)

```
apple-js/
├── index.js              # Exports Osascript & AppleScript
├── apple-script/
│   └── Apple.js          # AppleScript builder methods
├── workers/
│   └── index.js          # Worker for persistent command handling
├── README.md
```

---

## 🧪 Development / Testing

To test manually:
```bash
node test.js
```



---

## ✅ License

MIT © 2025 – Next-Dev-Saif

---

## 🤝 Contributing

Feel free to file issues, request features, or open PRs — macOS automation deserves modern DX 🚀
