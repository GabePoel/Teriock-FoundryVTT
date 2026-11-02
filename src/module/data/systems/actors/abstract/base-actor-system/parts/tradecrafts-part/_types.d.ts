import { TradecraftModifierModel } from "../../../../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface ActorTradecraftsPartData {
      tradecrafts: Record<Teriock.Keys.Tradecraft, TradecraftModifierModel>;
    }
  }
}

export {};
