import { CreatePet } from "../../application/pet/usecase/CreatePet";
import { Inject } from "../di/DependencyInjection";
import { HttpServer } from "../http/HttpServer";

export class PetsController {
  @Inject("HttpServer")
  httpServer: HttpServer;

  @Inject("CreatePet")
  createPet: CreatePet;

  constructor() {
    this.httpServer.register(
      "post",
      "/pets",
      async (params: any, body: any) => {
        const input = body;
        const output = await this.createPet.execute(input);
        return output;
      }
    );
  }
}
