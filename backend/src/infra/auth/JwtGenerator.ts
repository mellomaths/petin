import jwt from "jsonwebtoken";
import { AuthTokenGenerator } from "./AuthTokenGenerator";
import { Inject } from "../di/DependencyInjection";
import { Settings } from "../settings/Settings";

export class JwtGenerator implements AuthTokenGenerator {
  @Inject("Settings")
  settings: Settings;

  generate(payload: any, expirationTimeInSeconds: number): string {
    return jwt.sign(payload, this.settings.jwtSecret, {
      expiresIn: expirationTimeInSeconds,
    });
  }
}
