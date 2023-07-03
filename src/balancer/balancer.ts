import { Worker } from "worker_threads";
import * as os from "os";
import { Crud } from "../crud/crud";
import * as path from "path";
import * as cluster from "cluster";
import { URL } from "url";
import * as http from "http";
import { User } from "@/types/User";

export class Balancer {
  serverIndex: number;
  workers: { worker: cluster.Worker; port: number }[];

  constructor(port: number) {
    const cpus = os.availableParallelism();
    this.workers = [];

    this.serverIndex = 0;

    if (cluster.default.isPrimary) {
      for (let i = 0; i < cpus; i++) {
        const PORT = port + (i + 1);
        const fork = cluster.default.fork({ PORT });
        this.workers.push({ port: PORT, worker: fork });
        fork.on("message", (message) => {
          if (!("users" in message) || !("pid" in message)) {
            return;
          }

          this.workers.map(({ worker }) => {
            if (worker.id === message.pid) {
              return;
            }
            worker.send({ users: message.users });
          });
        });
      }

      const server = http.createServer((req, res) => {
        const serverUrl = `http://localhost:${
          this.workers[this.serverIndex].port
        }`;
        const parsedUrl = new URL(serverUrl);

        if (
          !parsedUrl.protocol ||
          !parsedUrl.port ||
          !parsedUrl.hostname ||
          !parsedUrl.pathname
        ) {
          return;
        }

        const proxyReq = http.request(
          {
            protocol: parsedUrl.protocol,
            port: parsedUrl.port,
            host: parsedUrl.hostname,
            path: req.url,
            method: req.method,
          },
          (proxyRes) => {
            if (!proxyRes.statusCode) {
              return;
            }
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res);
          }
        );

        req.pipe(proxyReq);

        this.serverIndex = (this.serverIndex + 1) % this.workers.length;
      });

      server.listen(8080, () => {
        console.log("balancer is listening");
      });
    } else {
      if (!process.env.PORT) {
        return;
      }
      const crud = new Crud(parseInt(process.env.PORT));

      process.on("message", (message) => {
        const msg = message as { users: User[] };
        if (!msg.users) {
          return;
        }
        crud.users = msg.users;
      });

      crud.onUserUpdate = (users) => {
        if (!process.send) {
          return;
        }
        process.send({ users, pid: process.pid });
      };
    }
  }
}
