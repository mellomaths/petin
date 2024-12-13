export type TestEnvironment = {
  url: string;
};

export function setupEnvironmentVariables(): TestEnvironment {
  const port = process.env.API_PORT || 3100;
  const host = process.env.API_HOST || "127.0.0.1";
  const url = `http://${host}:${port}`;

  return {
    url,
  };
}
