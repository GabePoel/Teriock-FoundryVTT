import TeriockActor from "../documents/actor.mjs";
import TeriockEffect from "../documents/effect.mjs";
import TeriockItem from "../documents/item.mjs";
import type TeriockAttunementData from "../data/effect-data/attunement-data/attunement-data.mjs";
import type TeriockAbilityData from "../data/effect-data/ability-data/ability-data.mjs";
import type TeriockConditionData from "../data/effect-data/condition-data/condition-data.mjs";
import type TeriockFluencyData from "../data/effect-data/fluency-data/fluency-data.mjs";
import type TeriockPropertyData from "../data/effect-data/property-data/property-data.mjs";
import type TeriockResourceData from "../data/effect-data/resource-data/resource-data.mjs";
import type TeriockEquipmentData from "../data/item-data/equipment-data/equipment-data.mjs";
import type TeriockPowerData from "../data/item-data/equipment-data/equipment-data.mjs";
import type TeriockRankData from "../data/item-data/rank-data/rank-data.mjs";
import type TeriockCharacterData from "../data/actor-data/character-data/character-data.mjs";
import { ParentDocumentMixinInterface } from "../documents/mixins/_types";

export interface MinimalGenericData {
  _id: string;
  img: string;
  name: string;
}

// Actors
export interface TeriockCharacter extends TeriockActor, ParentDocumentMixinInterface, MinimalGenericData {
  system: TeriockCharacterData;
}

// Effects
export interface TeriockAbility extends TeriockEffect, MinimalGenericData {
  system: TeriockAbilityData;
}

export interface TeriockAttunement extends TeriockEffect, MinimalGenericData {
  system: TeriockAttunementData;
}

export interface TeriockCondition extends TeriockEffect, MinimalGenericData {
  system: TeriockConditionData;
}

export interface TeriockFluency extends TeriockEffect, MinimalGenericData {
  system: TeriockFluencyData;
}

export interface TeriockProperty extends TeriockEffect, MinimalGenericData {
  system: TeriockPropertyData;
}

export interface TeriockResource extends TeriockEffect, MinimalGenericData {
  system: TeriockResourceData;
}

// Items
export interface TeriockEquipment extends TeriockItem, ParentDocumentMixinInterface, MinimalGenericData {
  system: TeriockEquipmentData;
}

export interface TeriockPower extends TeriockItem, ParentDocumentMixinInterface, MinimalGenericData {
  system: TeriockPowerData;
}

export interface TeriockRank extends TeriockItem, ParentDocumentMixinInterface, MinimalGenericData {
  system: TeriockRankData;
}
