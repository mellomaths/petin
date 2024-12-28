import { DocumentNumberApi } from "../../../../application/account/usecase/CheckDocumentNumber";

export class BrDocumentNumberApi implements DocumentNumberApi {
  async validate(documentNumber: string, type: string): Promise<boolean> {
    // TODO: Implement validation for Brazilian document number
    return true;
  }
}
