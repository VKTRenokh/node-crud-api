import * as http from "http";
import * as crypto from "crypto";
import { User, UserServer } from "./types/User";

const users: UserServer[] = [];

const server = http.createServer((req, res) => {
  res.end(crypto.randomUUID({ disableEntropyCache: true }));
});

server.listen(8080);
