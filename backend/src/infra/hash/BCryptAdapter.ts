import * as bcrypt from "bcrypt";
import { PasswordHasher } from "./PasswordHasher";

export class BCryptAdapter implements PasswordHasher {
  async hash(password: string): Promise<string> {
    const salt: string = await bcrypt.genSalt(10);
    const hash: string = await bcrypt.hash(password, salt);
    return hash;
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
