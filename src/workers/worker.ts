import { workerData, parentPort } from "worker_threads";
import { server } from "../crud/crud";
import * as http from "http";

console.log(workerData);

server.listen(workerData.PORT, () => {
  console.log(
    `slave with port is listening on http://localhost:${workerData.PORT}`
  );
});
