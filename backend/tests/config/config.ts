export type TestEnvironment = {
  url: string;
};

export function setupEnvironmentVariables(): TestEnvironment {
  const port = process.env.API_PORT || 3100;
  const host = process.env.API_HOST || "localhost";
  const url = `http://${host}:${port}`;

  return {
    url,
  };
}
