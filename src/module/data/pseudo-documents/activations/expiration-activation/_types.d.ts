import { BaseExpiration } from "../../expirations/abstract/_module.mjs";

declare module "./expiration-activation.mjs" {
  export default interface ExpirationActivation {
    expiration: UUID<BaseExpiration>;
  }
}

export {};
