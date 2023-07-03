import * as http from "http";
import { User } from "@/types/User";
import { isUser } from "../utils/isUser";

export class Crud {
  server: http.Server;
  onUserUpdate: ((users: User[]) => void) | null = null;
  users: User[];

  constructor(public port: number) {
    this.users = [];
    this.server = http.createServer((req, res) => {
      if (req.url?.startsWith("/api/users")) {
        this.handleRequest(req, res);
        return;
      }
      res.writeHead(404);
      res.end("not found");
    });
    this.server.listen(port, () => {
      console.log(
        "server is listening",
        process.pid,
        this.port,
        this.server.address()
      );
    });
  }

  getUUIDFromPath(path: string) {
    return path.slice(path.lastIndexOf("/") + 1);
  }

  isUUIDValid(str: string) {
    const uuidRegex =
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

    return uuidRegex.test(str);
  }

  getJson() {
    return JSON.stringify(this.users);
  }

  delete(res: http.ServerResponse, uuid: string) {
    if (!this.isUUIDValid(uuid)) {
      res.writeHead(400);
      res.end("uuid isn't valid");
      return;
    }

    const userIndex = this.users.findIndex((user) => user.id === uuid);

    if (userIndex === -1) {
      res.writeHead(404);
      res.end("user was not found");
      return;
    }

    this.users.slice(userIndex, 1);
    res.writeHead(204);
    res.end();

    if (!this.onUserUpdate) {
      return;
    }

    this.onUserUpdate(this.users);
  }

  push(res: http.ServerResponse, user: User) {
    if (!isUser(user)) {
      res.writeHead(400);
      res.end("body doesn't contain required fields");
      return;
    }

    user.id = crypto.randomUUID();

    this.users.push(user);

    res.writeHead(201);
    res.end(JSON.stringify(user));

    if (!this.onUserUpdate) {
      return;
    }

    this.onUserUpdate(this.users);
  }

  update(res: http.ServerResponse, uuid: string, obj: User) {
    if (!this.isUUIDValid(uuid)) {
      res.writeHead(400);
      res.end("uuid isn't valid");
      return;
    }

    const userIndex = this.users.findIndex((user) => user.id === uuid);

    if (!userIndex) {
      res.writeHead(404);
      res.end("user was not found");
      return;
    }

    obj.id = this.users[userIndex].id;

    this.users[userIndex] = obj;

    if (!this.onUserUpdate) {
      return;
    }

    this.onUserUpdate(this.users);
  }

  handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    if (req.method === "POST") {
      const chunks: Uint8Array[] = [];

      req.on("data", (chunk) => {
        chunks.push(chunk);
      });
      req.on("end", () => {
        this.push(res, JSON.parse(Buffer.concat(chunks).toString()));
      });
      // return;
    }

    if (req.method === "GET") {
      res.writeHead(200);
      res.end(this.getJson());
    }

    if (req.method === "PUT") {
      const chunks: Uint8Array[] = [];

      req.on("data", (chunk) => {
        chunks.push(chunk);
      });

      req.on("end", () => {
        if (!req.url) {
          return;
        }
        this.update(
          res,
          this.getUUIDFromPath(req.url),
          JSON.parse(Buffer.concat(chunks).toString())
        );
      });
    }

    if (req.method === "DELETE") {
      if (!req.url) {
        return;
      }
      this.delete(res, this.getUUIDFromPath(req.url));
    }
  }
}
