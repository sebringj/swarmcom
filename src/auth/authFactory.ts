import { AuthStrategy } from "./authStrategy";
import { SharedSecretStrategy } from "./sharedSecretStrategy";
import { Ed25519Strategy } from "./ed25519Strategy";
import { JwtStrategy } from "./jwtStrategy";

export type AuthMode = "shared_secret" | "ed25519" | "jwt";

export class AuthFactory {
  static create(mode: AuthMode): AuthStrategy {
    switch (mode) {
      case "shared_secret":
        return new SharedSecretStrategy();
      case "ed25519":
        return new Ed25519Strategy();
      case "jwt":
        return new JwtStrategy();
      default:
        throw new Error(`Unsupported auth mode: ${mode}`);
    }
  }
}
