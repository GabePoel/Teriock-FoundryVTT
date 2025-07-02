import type TeriockActor from "../documents/actor.mjs";
import type TeriockEffect from "../documents/effect.mjs";
import type TeriockItem from "../documents/item.mjs";
import type TeriockCharacterData from "../data/actor-data/character-data/character-data.mjs";
import type TeriockAbilityData from "../data/effect-data/ability-data/ability-data.mjs";
import type TeriockAttunementData from "../data/effect-data/attunement-data/attunement-data.mjs";
import type TeriockConditionData from "../data/effect-data/condition-data/condition-data.mjs";
import type TeriockFluencyData from "../data/effect-data/fluency-data/fluency-data.mjs";
import type TeriockPropertyData from "../data/effect-data/property-data/property-data.mjs";
import type TeriockResourceData from "../data/effect-data/resource-data/resource-data.mjs";
import type TeriockEquipmentData from "../data/item-data/equipment-data/equipment-data.mjs";
import type TeriockPowerData from "../data/item-data/equipment-data/equipment-data.mjs";
import type TeriockRankData from "../data/item-data/rank-data/rank-data.mjs";

// Actors
export interface TeriockCharacter extends TeriockActor {
  system: TeriockCharacterData;
}

// Effects
export interface TeriockAbility extends TeriockEffect {
  system: TeriockAbilityData;
}
export interface TeriockAttunement extends TeriockEffect {
  system: TeriockAttunementData;
}
export interface TeriockCondition extends TeriockEffect {
  system: TeriockConditionData;
}
export interface TeriockFluency extends TeriockEffect {
  system: TeriockFluencyData;
}
export interface TeriockProperty extends TeriockEffect {
  system: TeriockPropertyData;
}
export interface TeriockResource extends TeriockEffect {
  system: TeriockResourceData;
}

// Items
export interface TeriockEquipment extends TeriockItem {
  system: TeriockEquipmentData;
}
export interface TeriockPower extends TeriockItem {
  system: TeriockPowerData;
}
export interface TeriockRank extends TeriockEffect {
  system: TeriockRankData;
}
