import {
  DockerComposeEnvironment,
  StartedDockerComposeEnvironment,
  Wait,
} from "testcontainers";
import path from "path";
import { PostgresMigration } from "../../../src/infra/database/PostgresMigration";
import { setupTestContainers } from "./setup";

function newPostgresMigration() {
  return new PostgresMigration(
    "postgres://postgres:password@localhost:5432/petin"
  );
}

export async function startDockerCompose(): Promise<StartedDockerComposeEnvironment> {
  setupTestContainers();
  const composeFilePath = path.resolve(__dirname, "../../../");
  const composeFile = "docker-compose.yml";
  const environment = await new DockerComposeEnvironment(
    composeFilePath,
    composeFile
  )
    .withBuild()
    .withWaitStrategy("postgres-1", Wait.forHealthCheck())
    .withWaitStrategy("backend-1", Wait.forHealthCheck())
    .up();
  // process.env["DATABASE_NAME"] = postgresContainer.getDatabase();
  // process.env["DATABASE_URL"] = postgresContainer.getConnectionUri();
  const migration = newPostgresMigration();
  await migration.createSchema();
  await migration.create();
  return environment;
}

export async function stopDockerCompose(
  environment: StartedDockerComposeEnvironment
): Promise<void> {
  setupTestContainers();
  const migration = newPostgresMigration();
  await migration.drop();
  await environment.down();
}
