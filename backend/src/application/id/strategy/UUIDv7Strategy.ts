import { IdStrategy } from "./IdStrategy";
import { v7 as UUIDv7 } from "uuid";

export class UUIDv7Strategy implements IdStrategy {
  generate(): string {
    return UUIDv7();
  }
}
