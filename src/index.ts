import * as http from "http";
import { Users } from "./users/users";

const users = new Users();

const server = http.createServer((req, res) => {
  if (req.url?.startsWith("/api/users")) {
    users.handleRequest(req, res);
    return;
  }
  res.writeHead(404);
  res.end("not found");
});

server.listen(8080);
