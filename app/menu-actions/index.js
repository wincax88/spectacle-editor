import { remote } from "electron";
import fs from "fs";

import notificationSystem from "../notifications";
import { verifyFileContent } from "../utils";

const dialog = remote.require("dialog");

const getFileContent = (slidesStore) => JSON.stringify({
  content: {
    presentation: {
      slides: slidesStore.serialize()
    }
  }
});

const saveFile = (fileName, fileContent, fileStore) => {
  fs.writeFile(fileName, fileContent, (err) => {
    if (err) {
      notificationSystem.addNotification({
        message: "Error saving presentation",
        level: "error"
      });

      return;
    }

    notificationSystem.addNotification({
      message: "Save successful",
      level: "success"
    });

    fileStore.setFileName(fileName);
    fileStore.setIsDirty(false);
  });
};

export const fileActions = {
  save: (slidesStore, fileStore) => {
    if (fileStore.fileName) {
      saveFile(fileStore.fileName, getFileContent(slidesStore), fileStore);

      return;
    }

    dialog.showSaveDialog({
      filters: [{
        name: "json",
        extensions: ["json"]
      }]
    }, (fileName) => {
      if (fileName === undefined) {
        return;
      }

      const normalizedName = fileName.substr(-5) === ".json" ? fileName : `${fileName}.json`;

      saveFile(normalizedName, getFileContent(slidesStore), fileStore);
    });
  },
  open: (slidesStore, fileStore) => {
    dialog.showOpenDialog({
      filters: [{
        name: "json",
        extensions: ["json"]
      }]
    }, (fileNames) => {
      if (fileNames === undefined) return;
      const fileName = fileNames[0];

      // TODO: error handling
      fs.readFile(fileName, "utf-8", (err, data) => {
        if (err) {
          console.log(err);
          notificationSystem.addNotification({
            message: "Error opening presentation",
            level: "error"
          });
        }

        let fileContents;

        try {
          fileContents = JSON.parse(data);
        } catch (e) {
          console.log(e);
          notificationSystem.addNotification({
            message: "Error opening presentation",
            level: "error"
          });
        }

        verifyFileContent(fileContents, (schemaError) => {
          if (schemaError) {
            console.log(schemaError);
            notificationSystem.addNotification({
              message: "Error opening presentation",
              level: "error"
            });

            return;
          }

          slidesStore.deserialize(fileContents.content.presentation.slides);

          fileStore.setFileName(fileName);
          fileStore.setIsDirty(false);
        });
      });
    });
  }
};

export const editActions = {
  undo: (slidesStore) => {
    slidesStore.undo();
  },
  redo: (slidesStore) => {
    slidesStore.redo();
  }
};
