import { CreateOwner } from "../../application/owner/CreateOwner";
import { Inject } from "../di/DependencyInjection";
import { HttpServer } from "../http/HttpServer";

export class OwnersController {
  @Inject("HttpServer")
  httpServer: HttpServer;

  @Inject("CreateOwner")
  createOwner: CreateOwner;

  constructor() {
    this.httpServer.register(
      "post",
      "/owners",
      async (params: any, body: any) => {
        const input = body;
        const output = await this.createOwner.execute(input);
        return output;
      }
    );
  }
}
