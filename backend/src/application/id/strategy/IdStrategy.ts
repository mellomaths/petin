export interface IdStrategy {
  generate(): string;
}

export enum IdStrategyType {
  UUIDv7 = "UUIDv7",
}
