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

/**
 * Character-specific actor interface.
 *
 * Relevant wiki pages:
 * - [Attributes](https://wiki.teriock.com/index.php/Core:Attributes)
 * - [Leveling Up](https://wiki.teriock.com/index.php/Core:Leveling_Up)
 * - [Size](https://wiki.teriock.com/index.php/Core:Size)
 */
export interface TeriockCharacter extends TeriockActor, ParentDocumentMixinInterface, MinimalGenericData {
  system: TeriockCharacterData;
}

/**
 * Ability-specific effect interface.
 *
 * Relevant wiki pages:
 * - [Ability Rules](https://wiki.teriock.com/index.php/Category:Ability_rules)
 */
export interface TeriockAbility extends TeriockEffect, MinimalGenericData {
  system: TeriockAbilityData;
}

/**
 * Attunement-specific effect interface.
 *
 * Relevant wiki pages:
 * - [Presence](https://wiki.teriock.com/index.php/Core:Presence)
 */
export interface TeriockAttunement extends TeriockEffect, MinimalGenericData {
  system: TeriockAttunementData;
}

/**
 * Condition-specific effect interface.
 *
 * Relevant wiki pages:
 * - [Conditions](https://wiki.teriock.com/index.php/Category:Conditions)
 */
export interface TeriockCondition extends TeriockEffect, MinimalGenericData {
  system: TeriockConditionData;
}

/**
 * Fluency-specific effect interface.
 *
 * Relevant wiki pages:
 * - [Tradecraft Fluencies](https://wiki.teriock.com/index.php/Core:Tradecraft_Fluencies)
 */
export interface TeriockFluency extends TeriockEffect, MinimalGenericData {
  system: TeriockFluencyData;
}

/**
 * Property-specific effect interface.
 *
 * Relevant wiki pages:
 * - [Properties](https://wiki.teriock.com/index.php/Category:Properties)
 */
export interface TeriockProperty extends TeriockEffect, MinimalGenericData {
  system: TeriockPropertyData;
}

/**
 * Resource-specific effect interface.
 */
export interface TeriockResource extends TeriockEffect, MinimalGenericData {
  system: TeriockResourceData;
}

/**
 * Equipment-specific item interface.
 *
 * Relevant wiki pages:
 * - [Equipment](https://wiki.teriock.com/index.php/Category:Equipment)
 */
export interface TeriockEquipment extends TeriockItem, ParentDocumentMixinInterface, MinimalGenericData {
  system: TeriockEquipmentData;
}

/**
 * Power-specific item interface.
 */
export interface TeriockPower extends TeriockItem, ParentDocumentMixinInterface, MinimalGenericData {
  system: TeriockPowerData;
}

/**
 * Rank-specific item interface.
 *
 * Relevant wiki pages:
 * - [Classes](https://wiki.teriock.com/index.php/Category:Classes)
 */
export interface TeriockRank extends TeriockItem, ParentDocumentMixinInterface, MinimalGenericData {
  system: TeriockRankData;
}
