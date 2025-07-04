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
import type TeriockCharacterSheet from "../sheets/actor-sheets/character-sheet/character-sheet.mjs";
import type TeriockAbilitySheet from "../sheets/effect-sheets/ability-sheet/ability-sheet.mjs";
import type TeriockFluencySheet from "../sheets/effect-sheets/fluency-sheet/fluency-sheet.mjs";
import type TeriockPropertySheet from "../sheets/effect-sheets/property-sheet/property-sheet.mjs";
import type TeriockResourceSheet from "../sheets/effect-sheets/resource-sheet/resource-sheet.mjs";
import type TeriockEquipmentSheet from "../sheets/item-sheets/equipment-sheet/equipment-sheet.mjs";
import type TeriockPowerSheet from "../sheets/item-sheets/power-sheet/power-sheet.mjs";
import type TeriockRankSheet from "../sheets/item-sheets/rank-sheet/rank-sheet.mjs";

// Actors
export interface TeriockCharacter extends TeriockActor {
  system: TeriockCharacterData;
  sheet: TeriockCharacterSheet;
}

// Effects
export interface TeriockAbility extends TeriockEffect {
  system: TeriockAbilityData;
  sheet: TeriockAbilitySheet;
}

export interface TeriockAttunement extends TeriockEffect {
  system: TeriockAttunementData;
}

export interface TeriockCondition extends TeriockEffect {
  system: TeriockConditionData;
}

export interface TeriockFluency extends TeriockEffect {
  system: TeriockFluencyData;
  sheet: TeriockFluencySheet;
}

export interface TeriockProperty extends TeriockEffect {
  system: TeriockPropertyData;
  sheet: TeriockPropertySheet;
}

export interface TeriockResource extends TeriockEffect {
  system: TeriockResourceData;
  sheet: TeriockResourceSheet;
}

// Items
export interface TeriockEquipment extends TeriockItem {
  system: TeriockEquipmentData;
  sheet: TeriockEquipmentSheet;
}

export interface TeriockPower extends TeriockItem {
  system: TeriockPowerData;
  sheet: TeriockPowerSheet;
}

export interface TeriockRank extends TeriockEffect {
  system: TeriockRankData;
  sheet: TeriockRankSheet;
}
