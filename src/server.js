import http from 'http';
import {createApp}  from "./app.js";
import mongoose from "mongoose";
import {env} from "./lib/config/env.js";
import {logger} from "./pkg/logger/logger.js";

const app = createApp();
const server = http.createServer(app);
server.listen(3000, ()=> {
    logger.info(`Server started on 3000`);
})


async function shutdown () {
  server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
  });
}

process.on('SIGINT', shutdown);   // لو انا اللي وقفت السيرفر

process.on('SIGTERM', shutdown);   // لو السيرفر وقف لوحدو