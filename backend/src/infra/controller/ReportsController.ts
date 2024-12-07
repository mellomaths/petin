import { CreateReport } from "../../application/report/usecase/CreateReport";
import { Inject } from "../di/DependencyInjection";
import { HttpServer } from "../http/HttpServer";

export class ReportsController {
  @Inject("HttpServer")
  httpServer: HttpServer;

  @Inject("CreateReport")
  createReport: CreateReport;

  constructor() {
    this.httpServer.register(
      "post",
      "/reports",
      async (params: any, body: any, file: any, headers: any) => {
        const input = body;
        const token = this.httpServer.getAuthToken(headers);
        const output = await this.createReport.execute(token, input);
        return output;
      }
    );
  }
}
