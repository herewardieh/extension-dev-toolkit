import { EventEmitter } from "eventemitter3";
import chokidar from "chokidar";
import express from "express";
import cors from "cors";
import { logger } from "./logger";

const event = new EventEmitter();

const DEFAULT_PORT = 3000;

const setWatcher = (targetPath: string[], callback: () => void) => {
  const watcher = chokidar.watch(targetPath, {
    persistent: true,
    ignoreInitial: true,
    depth: Number.MAX_SAFE_INTEGER,
  });
  watcher.on("change", () => {
    callback();
  });
};

export const enableHotReloadMode = (
  buildProject: () => void,
  watchPaths: string[],
) => {
  try {
    const app = express();
    app.use(cors());
    app.get("/sse", (req, res) => {
      event.addListener("refresh", () => {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.write("data: reload\n\n");
      });
      req.on("close", res.end);
    });
    app.listen(DEFAULT_PORT, () => {
      logger.success("hot reload enable!!!");
      setWatcher(watchPaths, () => {
        buildProject();
        event.emit("refresh");
      });
    });
  } catch (e) {
    logger.error(`error: ${String(e)}`);
  }
};
