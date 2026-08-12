import { BaseCardsSystem, StoneSystem } from "./_module.mjs";

declare global {
  export interface CardSystemMap {
    card: BaseCardsSystem;
    stone: StoneSystem;
  }

  export type CardType = TypeMapKey<CardSystemMap>;
}
