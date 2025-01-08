import { HealthCheck } from "../../application/health/usecase/HealthCheck";
import { Inject } from "../di/DependencyInjection";
import { HttpServer } from "../http/HttpServer";

export class HealthCheckController {
  @Inject("HttpServer")
  httpServer: HttpServer;

  @Inject("HealthCheck")
  healthCheck: HealthCheck;

  constructor() {
    this.httpServer.register("get", "/health", async () => {
      const output = await this.healthCheck.execute();
      return output;
    });
  }
}
