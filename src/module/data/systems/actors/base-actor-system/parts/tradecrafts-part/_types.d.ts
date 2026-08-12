import { TradecraftModel } from "../../../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface ActorTradecraftsPartData {
      tradecrafts: Record<Teriock.Keys.Tradecraft, TradecraftModel>;
    }
  }
}

export {};
