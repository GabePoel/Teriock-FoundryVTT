import { TradecraftModel } from "../../../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type ActorTradecraftsPartData = { tradecrafts: Record<Teriock.Keys.Tradecraft, TradecraftModel> };
  }
}

export {};
