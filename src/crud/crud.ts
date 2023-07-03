import * as http from "http";
import { Users } from "../users/users";

export class Crud {
  server: http.Server;
  users: Users;

  constructor(public port: number) {
    this.users = new Users();
    this.server = http.createServer((req, res) => {
      console.table(this.server.address());
      console.log(req.url, "request!");

      if (req.url?.startsWith("/api/users")) {
        this.users.handleRequest(req, res);
        return;
      }
      res.writeHead(404);
      res.end("not found");
    });
    this.server.listen(port, () => {
      console.log("shashlik ya", process.pid, this.port, this.server.address());
    });
  }
}
