export type TestEnvironment = {
  url: string;
  database_url: string;
};

export function setupEnvironmentVariables(): TestEnvironment {
  const port = process.env.API_PORT || 3100;
  const host = process.env.API_HOST || "localhost";
  const url = `http://${host}:${port}`;

  const database_url =
    process.env.DATABASE_URL ||
    "postgres://postgres:password@localhost:5432/postgres";

  return {
    url,
    database_url,
  };
}
