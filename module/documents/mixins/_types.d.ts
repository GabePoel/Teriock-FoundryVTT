import { TeriockEffect } from "../_module.mjs";
import {
  TeriockAbility,
  TeriockCondition,
  TeriockEquipment,
  TeriockFluency,
  TeriockPower,
  TeriockProperty,
  TeriockRank,
  TeriockResource,
} from "../../types/documents";

/** The names of each {@link TeriockItem} this contains, in camel case, keyed by type. */
export type ParentItemKeys = {
  equipment?: Set<string>;
  power?: Set<string>;
  rank?: Set<string>;
};

/** Each {@link TeriockItem} this contains, keyed by type. */
export type ParentItemTypes = {
  equipment?: TeriockEquipment[];
  power?: TeriockPower[];
  rank?: TeriockRank[];
};

/** The names of each {@link TeriockEffect} this contains, in camel case, keyed by type. */
export type ParentEffectKeys = {
  ability?: Set<string>;
  attunement?: Set<string>;
  base?: Set<string>;
  condition?: Set<string>;
  effect?: Set<string>;
  fluency?: Set<string>;
  property?: Set<string>;
  resource?: Set<string>;
};

/** Each {@link TeriockEffect} this contains, keyed by type. */
export type ParentEffectTypes = {
  ability?: TeriockAbility[];
  attunement?: TeriockAttunement[];
  base?: TeriockEffect[];
  condition?: TeriockCondition[];
  effect?: TeriockEffect[];
  fluency?: TeriockFluency[];
  property?: TeriockProperty[];
  resource?: TeriockResource[];
};

/** Each {@link TeriockEffect} this contains, keyed by type, in multiple formats. */
export type BuiltEffectTypes = {
  effectTypes: ParentEffectTypes;
  effectKeys: ParentEffectKeys;
};

interface ParentDocumentMixinInterface {
  /** Each {@link TeriockEffect} this contains. */
  validEffects: TeriockEffect[];
  /** The names of each {@link TeriockItem} this contains, in camel case, keyed by type. */
  itemKeys: ParentItemKeys;
  /** Each {@link TeriockItem} this contains, keyed by type. */
  itemTypes: ParentItemTypes;
  /** The names of each {@link TeriockEffect} this contains, in camel case, keyed by type. */
  effectKeys: ParentEffectKeys;
  /** Each {@link TeriockEffect} this contains, keyed by type. */
  effectTypes: ParentEffectTypes;
}
