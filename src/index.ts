import { server } from "./app";

import * as dotenv from "dotenv";

dotenv.config();

server.listen(process.env.PORT);
