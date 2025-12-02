import { TeriockEffect } from "../../_module.mjs";

declare global {
  namespace Teriock.Parent {
    /** The names of each {@link TeriockItem} this contains, in camel case, keyed by type. */
    export type ParentItemKeys = Record<
      Teriock.Documents.ItemType,
      Set<string>
    >;

    /** Each {@link TeriockItem} this contains, keyed by type. */
    export type ParentItemTypes = {
      equipment?: TeriockEquipment[];
      power?: TeriockPower[];
      rank?: TeriockRank[];
      species?: TeriockSpecies[];
      body?: TeriockBody[];
      mount?: TeriockMount[];
    };

    /** The names of each {@link TeriockEffect} this contains, in camel case, keyed by type. */
    export type ParentEffectKeys = Record<
      Teriock.Documents.EffectType,
      Set<string>
    >;

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
  }
}
