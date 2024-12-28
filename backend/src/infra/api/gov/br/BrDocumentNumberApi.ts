import {
  DocumentNumberCheck,
  DocumentNumberCheckResponse,
} from "../../../../application/account/DocumentNumberCheck";
import { DocumentNumberApi } from "../../../../application/account/usecase/CheckDocumentNumber";

export class BrDocumentNumberApi implements DocumentNumberApi {
  async validate(
    payload: DocumentNumberCheck
  ): Promise<DocumentNumberCheckResponse> {
    // TODO: Implement validation for Brazilian document number
    return { valid: true };
  }
}
