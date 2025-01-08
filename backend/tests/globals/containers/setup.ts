export function setupTestContainers() {
  process.env["TESTCONTAINERS_HOST_OVERRIDE"] = "127.0.0.1";
}
