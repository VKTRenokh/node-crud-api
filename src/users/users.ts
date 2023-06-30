import { User } from "../types/User";
import { isUser } from "../utils/isUser";
import * as crypto from "crypto";
import * as http from "http";

export class Users {
  users: User[];

  constructor() {
    this.users = [];
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

    if (!userIndex) {
      res.writeHead(404);
      res.end("user was not found");
      return;
    }

    this.users.slice(userIndex, 1);
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
    this.printUsers();
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
    this.printUsers();
  }

  printUsers() {
    console.table(this.users);
  }

  handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    if (req.method === "POST") {
      req.on("data", (chunk) => {
        this.push(res, JSON.parse(chunk));
      });
      return;
    }

    if (req.method === "GET") {
      res.writeHead(200);
      res.end(this.getJson());
    }

    if (req.method === "PUT") {
    }
  }
}
