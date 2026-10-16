/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function PlayableActorSheetSidebarPart(Base) {
  /** @mixin */
  class PlayableActorSheetSidebarPart extends Base {
    /**
     * Reset attack penalty to zero.
     * @returns {Promise<void>}
     */
    static async #onResetAttackPenalty() {
      if (!game.teriock.checkEditable(this)) { return; }
      await this.document.update({ "system.combat.attackPenalty": 0 });
    }

    /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
    static DEFAULT_OPTIONS = { actions: { resetAttackPenalty: { buttons: [2], handler: this.#onResetAttackPenalty } } };

    /** @inheritDoc */
    async _prepareContext(options = {}) {
      return Object.assign(await super._prepareContext(options), { takeStatButtons: true });
    }
  }

  return PlayableActorSheetSidebarPart;
}
