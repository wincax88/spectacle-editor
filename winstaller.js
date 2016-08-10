const electronInstaller = require("electron-winstaller");
const path = require("path");

electronInstaller
  .createWindowsInstaller({
    appDirectory: path.join(__dirname, "release", "win32-ia32", "Spectacle Editor-win32-ia32"),
    outputDirectory: path.join(__dirname, "release", "installers"),
    setupIcon: path.join(__dirname, "app", "app.ico"),
    iconUrl: path.join(__dirname, "app", "app.ico"),
    authors: "Plotly",
    exe: "Spectacle Editor.exe",
    setupExe: "Spectacle Editorx86.exe",
    title: "Spectacle Editor",
    loadingGif: false
  })
  .then(
    () => {
      console.log("winstaller build complete");
    },
    err => {
      console.log(`winstaller failed: ${err.message}`);
    });
