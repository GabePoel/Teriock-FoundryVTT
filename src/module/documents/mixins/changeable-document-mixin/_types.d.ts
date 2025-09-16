import type { TeriockEffect } from "../../_module.mjs";

export interface ChangeableDocumentMixinInterface {
  /**
   * What field is used to extract changes from effects.
   * @type {string}
   */
  changesField: string;
  /**
   * An object that tracks which tracks the changes to the data model which were applied by active effects
   * @type {object}
   */
  overrides: object;

  /**
   * If it's okay to prepare.
   * @returns {boolean}
   */
  _checkPreparation(): boolean;

  /**
   * Get all ActiveEffects that may apply to this document.
   * @yields {TeriockEffect}
   * @returns {Generator<TeriockEffect, void, void>}
   */
  allApplicableEffects(): Generator<TeriockEffect, void, void>;

  /**
   * Apply any transformation to the Document data which are caused by ActiveEffects.
   */
  applyActiveEffects(): void;
}