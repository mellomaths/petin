import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { PostgresMigration } from "../../../src/infra/database/PostgresMigration";
import { setupTestContainers } from "./setup";

export async function startPostgresContainer(): Promise<StartedPostgreSqlContainer> {
  setupTestContainers();
  const container = await new PostgreSqlContainer().start();
  if (!container) {
    throw new Error("Postgres container not started");
  }
  process.env["DATABASE_NAME"] = container.getDatabase();
  process.env["DATABASE_URL"] = container.getConnectionUri();
  const migration = new PostgresMigration(container.getConnectionUri());
  await migration.create();
  await migration.close();
  return container;
}

export async function stopPostgresContainer(
  container: StartedPostgreSqlContainer
): Promise<void> {
  setupTestContainers();
  const migration = new PostgresMigration(container.getConnectionUri());
  await migration.drop();
  await container.stop();
}
