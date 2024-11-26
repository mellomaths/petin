import jwt from "jsonwebtoken";
import { AuthTokenGenerator } from "./AuthTokenGenerator";
import { Inject } from "../di/DependencyInjection";
import { Settings } from "../settings/Settings";
import { TokenPayload } from "../../application/account/TokenPayload";

export class JwtGenerator implements AuthTokenGenerator {
  @Inject("Settings")
  settings: Settings;

  generate(payload: TokenPayload, expirationTimeInSeconds: number): string {
    return jwt.sign(payload, this.settings.jwtSecret, {
      expiresIn: expirationTimeInSeconds,
    });
  }

  verify(token: string): TokenPayload {
    return jwt.verify(token, this.settings.jwtSecret) as TokenPayload;
  }
}
