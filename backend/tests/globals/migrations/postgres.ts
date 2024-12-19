import { PostgresMigration } from "../../../src/infra/database/PostgresMigration";
import { setupEnvironmentVariables } from "../../config/config";

export async function upPostgresMigration() {
  const migration = new PostgresMigration(
    setupEnvironmentVariables().database_url
  );
  await migration.createSchema();
  await migration.create();
  await migration.close();
}

export async function downPostgresMigration() {
  const migration = new PostgresMigration(
    setupEnvironmentVariables().database_url
  );
  await migration.drop();
  await migration.close();
}
