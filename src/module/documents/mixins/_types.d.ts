import {
  TeriockAbility,
  TeriockAttunement,
  TeriockCondition,
  TeriockConsequence,
  TeriockEquipment,
  TeriockFluency,
  TeriockMechanic,
  TeriockPower,
  TeriockProperty,
  TeriockRank,
  TeriockResource
} from "../_documents.mjs";
import type TeriockEffect from "../effect.mjs";

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
  mechanic?: TeriockMechanic[];
};

/** The names of each {@link TeriockEffect} this contains, in camel case, keyed by type. */
export type ParentEffectKeys = {
  ability?: Set<string>;
  attunement?: Set<string>;
  base?: Set<string>;
  condition?: Set<string>;
  consequence?: Set<string>;
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
  consequence?: TeriockConsequence[];
  fluency?: TeriockFluency[];
  property?: TeriockProperty[];
  resource?: TeriockResource[];
};

/** Each {@link TeriockEffect} this contains, keyed by type, in multiple formats. */
export type BuiltEffectTypes = {
  effectTypes: ParentEffectTypes;
  effectKeys: ParentEffectKeys;
};
