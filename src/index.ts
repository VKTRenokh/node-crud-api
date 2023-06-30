import * as http from "http";
import * as dotenv from "dotenv";
import { Users } from "./users/users";

dotenv.config();

const users = new Users();

const server = http.createServer((req, res) => {
  if (req.url?.startsWith("/api/users")) {
    users.handleRequest(req, res);
    return;
  }
  res.writeHead(404);
  res.end("not found");
});

server.listen(process.env.PORT);
