import { CheckDocumentNumber } from "../../application/account/usecase/CheckDocumentNumber";
import { CheckZipCode } from "../../application/account/usecase/CheckZipCode";
import { Inject } from "../di/DependencyInjection";
import { HttpServer } from "../http/HttpServer";

export class ValidatorController {
  @Inject("HttpServer")
  httpServer: HttpServer;

  @Inject("CheckZipCode")
  checkZipCode: CheckZipCode;

  @Inject("CheckDocumentNumber")
  checkDocumentNumber: CheckDocumentNumber;

  constructor() {
    this.httpServer.register(
      "post",
      "/validator/zip-code",
      async (params: any, body: any) => {
        const output = await this.checkZipCode.execute(body);
        return output;
      }
    );
    this.httpServer.register(
      "post",
      "/validator/document-number",
      async (params: any, body: any) => {
        const output = await this.checkDocumentNumber.execute(body);
        return output;
      }
    );
  }
}
