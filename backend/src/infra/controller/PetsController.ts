import { CreatePet } from "../../application/pet/usecase/CreatePet";
import { ListPets } from "../../application/pet/usecase/ListPets";
import { Inject } from "../di/DependencyInjection";
import { HttpServer } from "../http/HttpServer";

export class PetsController {
  @Inject("HttpServer")
  httpServer: HttpServer;

  @Inject("CreatePet")
  createPet: CreatePet;

  @Inject("ListPets")
  listPets: ListPets;

  constructor() {
    this.httpServer.register(
      "post",
      "/pets",
      async (params: any, body: any, file: any, headers: any) => {
        const input = body;
        const token = this.httpServer.getAuthToken(headers);
        const output = await this.createPet.execute(token, input);
        return output;
      }
    );
    this.httpServer.register(
      "get",
      "/pets",
      async (params: any, body: any, file: any, headers: any) => {
        const token = this.httpServer.getAuthToken(headers);
        const latitude = params.latitude;
        const longitude = params.longitude;
        const radius = params.radius;
        const output = await this.listPets.execute(
          token,
          latitude,
          longitude,
          radius
        );
        return output;
      }
    );
  }
}
