import { StartedGenericContainer } from "testcontainers/build/generic-container/started-generic-container";
import { setupTestContainers } from "./setup";
import { GenericContainer, StartedTestContainer } from "testcontainers";
import { startPostgresContainer } from "./postgres";
import { startRabbitMQContainer } from "./rabbitmq";
import { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { StartedRabbitMQContainer } from "@testcontainers/rabbitmq";
import path from "path";

export type BackendContainers = {
  postgres: StartedPostgreSqlContainer;
  backend: StartedTestContainer;
  rabbitmq: StartedRabbitMQContainer;
};

export async function startBackendContainers(): Promise<BackendContainers> {
  setupTestContainers();
  const postgres = await startPostgresContainer();
  const rabbitmq = await startRabbitMQContainer();
  const dockerfileContext = path.resolve(__dirname, "../../../");
  const container = await GenericContainer.fromDockerfile(dockerfileContext)
    .withBuildArgs({
      PORT: "3100",
      DATABASE_URL: postgres.getConnectionUri(),
      DATABASE_NAME: postgres.getDatabase(),
      AUTH_TOKEN_SECRET:
        "a87a8411da267ddb131c5ba79a0f82f10532e106656886f739f09f35dc045e335da9838fac1965cf7b0f6ac8153ae7c2ebc8bddf6bb8cd582aba54128a063d7368a3a9863438c6b914821d2e3d128f0a7d2c07b1b0d41376ec7bb744ab9401a333618a498b4fe70bd9c8ff37efbeeb8d161599c2c590d2bc86e19426f098de5277bd3ff252eb6816da188e4a7581bf6e75c6dbba0a8a2707debb73c7dc85307a24d2514c55624b780315712770fba682098b37e29f5865e7dfb7faa050c0197657b7dcd6eaa6dcbba79765b8b7ce8191eecb8704d9a68a05e24ef0632a1a58fd36fd5f5b6c7abdf8b27d7cf8d2581d3f4757a6b2827b68f841c202ef02b96af6",
      MESSAGE_BROKER_URL: rabbitmq.getAmqpUrl(),
    })
    .build();
  if (!container) {
    throw new Error("Backend container not built");
  }
  const backend = await container.start();
  if (!backend) {
    throw new Error("Backend container not started");
  }
  return {
    postgres,
    backend,
    rabbitmq,
  };
}

export async function stopBackendContainers(containers: BackendContainers) {
  await containers.backend.stop();
  await containers.postgres.stop();
  await containers.rabbitmq.stop();
}
