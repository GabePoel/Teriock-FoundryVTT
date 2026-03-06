import { TradecraftModel } from "../../../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type ActorTradecraftsPartInterface = {
      tradecrafts: Record<
        Teriock.Parameters.Fluency.Tradecraft,
        TradecraftModel
      >;
    };
  }
}

export {};
