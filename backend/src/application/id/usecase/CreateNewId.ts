import { IdStrategy, IdStrategyType } from "../strategy/IdStrategy";

export class CreateNewId {
  private readonly strategy: IdStrategy;

  constructor(strategy: IdStrategy) {
    this.strategy = strategy;
  }

  async execute(): Promise<string> {
    return this.strategy.generate();
  }
}
