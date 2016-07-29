import { app, BrowserWindow, Menu, crashReporter, shell, ipcMain, dialog } from "electron";
import fs from "fs";

let menu;
let template;
let mainWindow = null;
let presWindow = null;
let pdfWindow = null;
let screencapWindow = null;

app.commandLine.appendSwitch("--ignore-certificate-errors");

const handleSocialAuth = (socialUrl) => {
  const socialLoginWindow = new BrowserWindow({
    show: true,
    width: 1000,
    height: 700,
    // This is required for FB OAuth
    webPreferences: {
      // fails without this because of CommonJS script detection
      nodeIntegration: false,
      // required for Facebook active ping thingy
      webSecurity: false,
      plugins: true
    }
  });

  // socialLoginWindow.openDevTools();
  socialLoginWindow.loadURL(socialUrl);

  socialLoginWindow.on("close", () => {
    mainWindow.webContents.session.cookies.get({
      // name: "csrftoken",
      domain: "plot.ly"
    }, (err, cookies) => {
      // TODO: For some reason, this is always set, even on fail, wtf?
      if (Array.isArray(cookies) && cookies[0] && cookies[0].value) {
        mainWindow.webContents.send("social-login", cookies);
      }
    });
  });
};

crashReporter.start();

if (process.env.NODE_ENV === "development") {
  require("electron-debug")();
}


app.on("window-all-closed", () => {
  pdfWindow = null;
  screencapWindow = null;

  if (process.platform !== "darwin") app.quit();
});


app.on("ready", () => {
  screencapWindow = new BrowserWindow({
    show: false,
    width: 250,
    height: 175,
    enableLargerThanScreen: true,
    webPreferences: {
      partition: "screenCap"
    }
  });

  screencapWindow.loadURL(`file://${__dirname}/app/slide-preview.html#/?export`);

  ipcMain.on("ready-to-screencap", (event, data) => {
    const { currentSlideIndex, numberOfSlides } = data;

    screencapWindow.setSize(250, numberOfSlides * 175, false);

    screencapWindow.capturePage({
      x: 0,
      y: 175 * currentSlideIndex,
      width: 250,
      height: 175
    }, (image) => {
      mainWindow.webContents.send("slide-preview-image", {
        image: new Buffer(image.toPng()).toString("base64"),
        slideIndex: currentSlideIndex
      });
    });
  });

  pdfWindow = new BrowserWindow({
    show: false,
    width: 1000,
    height: 700,
    webPreferences: {
      partition: "pdf"
    }
  });

  pdfWindow.loadURL(`file://${__dirname}/app/presentation.html#/?export`);

  mainWindow = new BrowserWindow({
    show: false,
    width: 1600,
    height: 1000
  });

  mainWindow.loadURL(`file://${__dirname}/app/app.html`);

  mainWindow.webContents.on("did-finish-load", () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
    presWindow = null;
  });

  if (process.env.NODE_ENV === "development") {
    mainWindow.openDevTools();
  }

  ipcMain.on("encode-image", (event, imagePath) => {
    fs.readFile(imagePath, (err, imageData) => {
      if (err) {
        mainWindow.webContents.send("image-encoded", null);

        return;
      }

      mainWindow.webContents.send("image-encoded", new Buffer(imageData).toString("base64"));
    });
  });

  ipcMain.on("current-element", (event, isCurrentElement) => {
    menu.items.forEach((item, i) => {
      if (item.label === "Edit") {
        item.submenu.items.forEach((option, k) => {
          if (
            option.label === "Move Forward" ||
            option.label === "Move Backward" ||
            option.label === "Move To Front" ||
            option.label === "Move To Back" ||
            option.label === "Delete Element"
          ) {
            menu.items[i].submenu.items[k].enabled = isCurrentElement;
          }
        });
      }
    });
    // console.log(menu.items[2].submenu.items);
  });

  ipcMain.on("social-login", (event, socialUrl) => {
    mainWindow.webContents.session.clearStorageData(() => {});
    // Reset the csrftoken cookie if there is one
    mainWindow.webContents.session.cookies.remove("https://plot.ly", "csrftoken", () => {
      handleSocialAuth(socialUrl);
    });
  });

  ipcMain.on("open-external", (event, url) => {
    shell.openExternal(url);
  });

  ipcMain.on("update-presentation", (event, data) => {
    screencapWindow.webContents.send("update", data);
    pdfWindow.webContents.send("update", data);

    if (presWindow) {
      presWindow.webContents.send("update", data);
    }
  });

  if (process.platform === "darwin") {
    template = [{
      label: "Electron",
      submenu: [{
        label: "About ElectronReact",
        selector: "orderFrontStandardAboutPanel:"
      }, {
        type: "separator"
      }, {
        label: "Services",
        submenu: []
      }, {
        type: "separator"
      }, {
        label: "Hide ElectronReact",
        accelerator: "Command+H",
        selector: "hide:"
      }, {
        label: "Hide Others",
        accelerator: "Command+Shift+H",
        selector: "hideOtherApplications:"
      }, {
        label: "Show All",
        selector: "unhideAllApplications:"
      }, {
        type: "separator"
      }, {
        label: "Quit",
        accelerator: "Command+Q",
        click() {
          app.quit();
        }
      }]
    }, {
      label: "File",
      submenu: [{
        label: "Save",
        accelerator: "Command+S",
        click() {
          mainWindow.webContents.send("file", "save");
        }
      }, {
        label: "Open",
        accelerator: "Command+O",
        click() {
          mainWindow.webContents.send("file", "open");
        }
      }, {
        label: "Export to PDF",
        accelerator: "Command+P",
        click() {
          pdfWindow.webContents.printToPDF({
            landscape: true,
            printBackground: true,
            marginsType: 1
          }, (err, data) => {
            if (err) {
              console.log(err);

              return;
            }

            dialog.showSaveDialog({
              filters: [{
                name: "pdf",
                extensions: ["pdf"]
              }]
            }, (fileName) => {
              if (!fileName) {
                return;
              }

              const normalizedName = fileName.substr(-4) === ".pdf" ? fileName : `${fileName}.pdf`;

              fs.writeFile(normalizedName, data, (fileErr) => {
                if (fileErr) {
                  console.log(fileErr);
                }
              });
            });
          });
        }
      }]
    }, {
      label: "Edit",
      submenu: [{
        label: "Undo",
        accelerator: "Command+Z",
        selector: "undo:",
        click() {
          mainWindow.webContents.send("edit", "undo");
        }
      }, {
        label: "Redo",
        accelerator: "Command+Shift+Z",
        selector: "redo:",
        click() {
          mainWindow.webContents.send("edit", "redo");
        }
      }, {
        type: "separator"
      },
      {
        label: "Move Forward",
        accelerator: "CMD+[",
        selector: "forward:",
        click() {
          mainWindow.webContents.send("edit", "forward");
        }
      },
      {
        label: "Move Backward",
        accelerator: "CMD+]",
        selector: "backward:",
        click() {
          mainWindow.webContents.send("edit", "backward");
        }
      },
      {
        label: "Move To Front",
        accelerator: "shift+CMD+[",
        selector: "front:",
        click() {
          mainWindow.webContents.send("edit", "front");
        }
      },
      {
        label: "Move To Back",
        accelerator: "shift+CMD+]",
        selector: "back:",
        click() {
          mainWindow.webContents.send("edit", "back");
        }
      },
      {
        label: "Delete Element",
        accelerator: "CMD+D",
        selector: "delete:",
        click() {
          mainWindow.webContents.send("edit", "delete");
        }
      }]
    }, {
      label: "View",
      submenu: (process.env.NODE_ENV === "development") ? [{
        label: "Reload",
        accelerator: "Command+R",
        click() {
          mainWindow.restart();
        }
      }, {
        label: "Toggle Full Screen",
        accelerator: "Ctrl+Command+F",
        click() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
      }, {
        label: "Toggle Developer Tools",
        accelerator: "Alt+Command+I",
        click() {
          mainWindow.toggleDevTools();
        }
      }] : [{
        label: "Toggle Full Screen",
        accelerator: "Ctrl+Command+F",
        click() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
      }]
    }, {
      label: "Play",
      submenu: [{
        label: "Slide Show",
        accelerator: "Command+L",
        click() {
          if (presWindow) {
            presWindow.focus();

            return;
          }

          presWindow = new BrowserWindow({
            show: false,
            width: 1000,
            height: 700
          });

          presWindow.loadURL(`file://${__dirname}/app/presentation.html`);

          presWindow.webContents.on("did-finish-load", () => {
            mainWindow.webContents.send("trigger-update");
            presWindow.show();
            presWindow.focus();
          });

          presWindow.on("closed", () => {
            presWindow = null;
          });
        }
      }]
    }, {
      label: "Window",
      submenu: [{
        label: "Minimize",
        accelerator: "Command+M",
        selector: "performMiniaturize:"
      }, {
        label: "Close",
        accelerator: "Command+W",
        selector: "performClose:"
      }, {
        type: "separator"
      }, {
        label: "Bring All to Front",
        selector: "arrangeInFront:"
      }]
    }, {
      label: "Help",
      submenu: [{
        label: "Learn More",
        click() {
          shell.openExternal("http://electron.atom.io");
        }
      }, {
        label: "Documentation",
        click() {
          shell.openExternal("https://github.com/atom/electron/tree/master/docs#readme");
        }
      }, {
        label: "Community Discussions",
        click() {
          shell.openExternal("https://discuss.atom.io/c/electron");
        }
      }, {
        label: "Search Issues",
        click() {
          shell.openExternal("https://github.com/atom/electron/issues");
        }
      }]
    }];

    menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  } else {
    template = [{
      label: "&File",
      submenu: [{
        label: "&Open",
        accelerator: "Ctrl+O"
      },
      {
        label: "&Save",
        accelerator: "Ctrl+S"
      },
      {
        label: "&Save As...",
        accelerator: "Ctrl+Shift+S"
      },
      {
        label: "&Export To PDF",
        accelerator: ""
      },
      {
        label: "&Close",
        accelerator: "Ctrl+Q",
        click() {
          mainWindow.close();
        }
      }]
    }, {
      label: "&Edit",
      submenu: [{
        label: "&Undo",
        accelerator: "Ctrl+Z",
        click() {
          mainWindow.webContents.send("edit", "undo");
        }
      }, {
        label: "&Redo",
        accelerator: "Ctrl+Shift+Z",
        click() {
          mainWindow.webContents.send("edit", "redo");
        }
      },
      {
        type: "separator"
      },
      {
        label: "&Move Forward",
        accelerator: "Ctrl+[",
        click() {
          mainWindow.webContents.send("edit", "forward");
        }
      },
      {
        label: "&Move Backward",
        accelerator: "Ctrl+]",
        click() {
          mainWindow.webContents.send("edit", "backward");
        }
      },
      {
        label: "&Move To Front",
        accelerator: "shift+Ctrl+[",
        click() {
          mainWindow.webContents.send("edit", "front");
        }
      },
      {
        label: "&Move To Back",
        accelerator: "shift+Ctrl+]",
        click() {
          mainWindow.webContents.send("edit", "back");
        }
      },
      {
        label: "Delete Element",
        accelerator: "Ctrl+D",
        click() {
          mainWindow.webContents.send("edit", "delete");
        }
      }]
    },
    {
      label: "&View",
      submenu: (process.env.NODE_ENV === "development") ? [{
        label: "&Reload",
        accelerator: "Ctrl+R",
        click() {
          mainWindow.restart();
        }
      }, {
        label: "Toggle &Full Screen",
        accelerator: "F11",
        click() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
      },
      {
        label: "&Slideshow",
        accelerator: ""
      },
      {
        label: "Toggle &Developer Tools",
        accelerator: "Alt+Ctrl+I",
        click() {
          mainWindow.toggleDevTools();
        }
      }] : [{
        label: "Toggle &Full Screen",
        accelerator: "F11",
        click() {
          mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
      }]
    }, {
      label: "Help",
      submenu: [{
        label: "Learn More",
        click() {
          shell.openExternal("http://electron.atom.io");
        }
      }, {
        label: "Documentation",
        click() {
          shell.openExternal("https://github.com/atom/electron/tree/master/docs#readme");
        }
      }, {
        label: "Community Discussions",
        click() {
          shell.openExternal("https://discuss.atom.io/c/electron");
        }
      }, {
        label: "Search Issues",
        click() {
          shell.openExternal("https://github.com/atom/electron/issues");
        }
      }]
    }];
    menu = Menu.buildFromTemplate(template);
    mainWindow.setMenu(menu);
  }
});
