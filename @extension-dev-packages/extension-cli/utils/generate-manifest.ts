import { IManifest } from "@extension-dev-packages/types-extension-manifest";
import { Extension } from "../src/type";
import { writeFileSync } from "fs";
import { resolve } from "path";

export const generateManifest = (
  application_manifest: IManifest,
  pageUi: Extension.TPageUI,
  targetPath: string,
) => {
  let manifest: IManifest = {
    ...application_manifest,
    manifest_version: 3,
    background: {
      service_worker: "background.js",
      type: "module",
    },
    content_scripts: undefined,
  };
  if (pageUi.popup) {
    manifest = {
      ...manifest,
      action: {
        ...manifest.action,
        default_popup: "popup.html",
      },
    };
  }
  if (pageUi.sidePanel) {
    manifest = {
      ...manifest,
      side_panel: {
        default_path: "sidePanel.html",
      },
    };
  }
  if (pageUi.options) {
    manifest = {
      ...manifest,
      options_page: "options.html",
      options_ui: {
        ...manifest?.options_ui,
        page: "options.html",
      },
    };
  }
  writeFileSync(
    resolve(targetPath, "manifest.json"),
    JSON.stringify(manifest, null, "\t"),
  );
};
