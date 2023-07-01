import { server } from "./app";
import * as cluster from "cluster";
import * as os from "os";
const cpus = os.availableParallelism();

import * as dotenv from "dotenv";

dotenv.config();

server.listen(process.env.PORT, () => {
  console.log(`server is listening on http://localhost:${process.env.PORT}`);
});
