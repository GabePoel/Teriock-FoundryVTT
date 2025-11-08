import type {
  TeriockAbility,
  TeriockAttunement,
  TeriockBody,
  TeriockCondition,
  TeriockConsequence,
  TeriockEquipment,
  TeriockFluency,
  TeriockMount,
  TeriockPower,
  TeriockProperty,
  TeriockRank,
  TeriockResource,
  TeriockSpecies,
} from "../../_documents.mjs";
import type { TeriockEffect } from "../../_module.mjs";

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

export interface ParentDocumentMixinInterface {
  /**
   * Gets all ability effects.
   * @returns Array of ability effects
   */
  get abilities(): TeriockAbility[];

  /**
   * Gets all attunement effects.
   * @returns Array of attunement effects
   */
  get attunements(): TeriockAttunement[];

  /**
   * Gets all condition effects.
   * @returns Array of condition effects
   */
  get conditions(): TeriockCondition[];

  /**
   * Gets all consequence effects.
   * @returns Array of consequence effects
   */
  get consequences(): TeriockConsequence[];

  /**
   * Gets all fluency effects.
   * @returns Array of fluency effects
   */
  get fluencies(): TeriockFluency[];

  /**
   * Get the body parts that are directly descendent from this.
   * @returns {TeriockBody[]}
   */
  getBodyParts(): TeriockBody[];

  /**
   * Get the equipment that are directly descendent from this.
   * @returns {TeriockEquipment[]}
   */
  getEquipment(): TeriockEquipment[];

  /**
   * Get the ranks that are directly descendent from this.
   * @returns {TeriockRank[]}
   */
  getRanks(): TeriockRank[];

  /**
   * Gets all property effects.
   * @returns Array of property effects
   */
  get properties(): TeriockProperty[];

  /**
   * Gets all resource effects.
   * @returns Array of resource effects
   */
  get resources(): TeriockResource[];

  /**
   * Gets the list of TeriockEffect documents associated with this document.
   * Helper method for prepareDerivedData() that can be called explicitly.
   * @returns Array of valid effects
   */
  get validEffects(): TeriockEffect[];
}
