import { DatabaseConnection } from "../../../infra/database/DatabaseConnection";
import { Inject } from "../../../infra/di/DependencyInjection";
import { ApplicationException } from "../../../infra/exception/ApplicationException";
import { MessageBroker } from "../../../infra/queue/MessageBroker";
import { Health } from "../HealthCheck";

export class HealthCheck {
  @Inject("Database")
  database: DatabaseConnection;

  @Inject("MessageBroker")
  messageBroker: MessageBroker;

  async execute(): Promise<Health> {
    const databaseUp = await this.database.healthCheck();
    const messageBrokerUp = await this.messageBroker.healthCheck();
    const ok = databaseUp && messageBrokerUp;
    const message = ok ? "Server running" : "Some of the services are down";
    const health: Health = {
      ok,
      message,
      status: {
        database: {
          up: databaseUp,
        },
        messageBroker: {
          up: messageBrokerUp,
        },
      },
    };
    if (!ok) {
      throw new ApplicationException(
        503,
        health,
        "Some of the services are down"
      );
    }
    return health;
  }
}
