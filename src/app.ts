import { Balancer } from "./balancer/balancer";
import { Crud } from "./crud/crud";

export class App {
  server: Balancer | Crud | null = null;

  constructor() {
    const args = process.argv.slice(2);
    if (!process.env.PORT) {
      return;
    }
    const port = parseInt(process.env.PORT);
    if (!args.includes("--multi")) {
      this.server = new Crud(port);
      return;
    }
    this.server = new Balancer(port);
  }
}
