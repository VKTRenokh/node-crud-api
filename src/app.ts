import { Worker } from "worker_threads";
import * as os from "os";
import { server } from "./crud/crud";
import * as path from "path";
import * as cluster from "cluster";
import * as url from "url";
import * as http from "http";
import * as process from "process";

export class App {
  serverIndex: number;

  constructor() {
    const port = process.env.PORT || "8080";

    const cpus = os.availableParallelism();
    const workers: { worker: cluster.Worker; port: number }[] = [];

    this.serverIndex = 0;

    if (cluster.default.isPrimary) {
      for (let i = 0; i < cpus; i++) {
        const PORT = parseInt(port) + (i + 1);
        const fork = cluster.default.fork({ PORT });
        workers.push({ port: PORT, worker: fork });
      }

      const server = http.createServer((req, res) => {
        const serverUrl = `http://localhost:${workers[this.serverIndex].port}`;
        const parsedUrl = url.parse(serverUrl);

        if (
          !parsedUrl.protocol ||
          !parsedUrl.port ||
          !parsedUrl.hostname ||
          !parsedUrl.pathname
        ) {
          return;
        }

        console.log("balancer url", req.url);

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

        this.serverIndex = (this.serverIndex + 1) % workers.length;
      });

      server.listen(8080, () => {
        console.log("balancer is listening");
      });
    } else {
      if (!process.env.PORT) {
        return;
      }
      server.listen(parseInt(process.env.PORT), () => {
        console.log(
          `dolbaniy shashlik is listening with pid ${process.pid} with port ${process.env.PORT}`
        );
      });
    }
  }
}
