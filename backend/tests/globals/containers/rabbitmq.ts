import {
  RabbitMQContainer,
  StartedRabbitMQContainer,
} from "@testcontainers/rabbitmq";
import { setupTestContainers } from "./setup";

export async function startRabbitMQContainer(): Promise<StartedRabbitMQContainer> {
  setupTestContainers();
  const container = await new RabbitMQContainer().start();
  if (!container) {
    throw new Error("RabbitMQ container not started");
  }
  return container;
}
