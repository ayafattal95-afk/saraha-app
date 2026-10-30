import mongoose from "mongoose";
import {config} from "dotenv";
import dns from 'node:dns';
import {env} from "../config/env.js";


dns.setServers(["8.8.8.8", "8.8.4.4"]);

mongoose.connect(env.db.url);

