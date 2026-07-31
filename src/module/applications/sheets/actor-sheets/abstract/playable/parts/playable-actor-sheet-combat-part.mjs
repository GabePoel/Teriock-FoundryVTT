import { DocumentSelector } from "../../../../../dialogs/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * @template {Constructor<BaseActorSheet>} T
 * @param {T} Base
 */
export default function PlayableActorSheetCombatPart(Base) {
  return (
    /**
     * @extends {BaseActorSheet}
     * @mixin
     */
    class PlayableActorSheetCombatPart extends Base {
      /**
       * Opens the primary attacker's sheet.
       * @returns {Promise<void>}
       */
      static async #onOpenPrimaryAttacker() {
        await this.document.system.wielding.attacker?.sheet.render(true);
      }

      /**
       * Opens the primary blocker's sheet.
       * @returns {Promise<void>}
       */
      static async #onOpenPrimaryBlocker() {
        await this.document.system.wielding.blocker?.sheet.render(true);
      }

      /**
       * Select a primary attacker.
       * @param {PointerEvent} event
       * @returns {Promise<void>}
       */
      static async #onSelectAttacker(event) {
        if (event.button === 2) { await this.document.system.wielding.attacker?.sheet.render(true); }
        if (!game.teriock.checkEditable(this)) { return; }
        const attacker = await DocumentSelector.selectSingle(
          [...this.document.equipment.filter(e => e.system.equipped), ...this.document.bodyParts].filter(a => a.active),
          {
            checked: this.document.system.wielding.attacker?.uuid,
            hint: _loc("TERIOCK.SHEETS.Actor.ACTIONS.SelectAttacker.hint"),
            openable: true,
            textKey: "system.summarizedAttack",
          },
        );
        if (attacker) { await this.document.update({ "system.wielding.attacker": attacker.id }); }
      }

      /**
       * Select a primary blocker.
       * @param {PointerEvent} event
       * @returns {Promise<void>}
       */
      static async #onSelectBlocker(event) {
        if (event.button === 2 || !this.isEditable) { await this.document.system.wielding.blocker?.sheet.render(true); }
        if (!game.teriock.checkEditable(this)) { return; }
        const attacker = await DocumentSelector.selectSingle(
          [...this.document.equipment.filter(e => e.system.equipped), ...this.document.bodyParts].filter(a => a.active),
          {
            checked: this.document.system.wielding.blocker?.uuid,
            hint: _loc("TERIOCK.SHEETS.Actor.ACTIONS.SelectBlocker.hint"),
            openable: true,
            textKey: "system.summarizedBlock",
          },
        );
        if (attacker) { await this.document.update({ "system.wielding.blocker": attacker.id }); }
      }

      /**
       * Toggles if the character still has a reaction.
       * @returns {Promise<void>}
       */
      static async #onToggleReaction() {
        if (!game.teriock.checkEditable(this)) { return; }
        await this.document.update({ "system.combat.hasReaction": !this.document.system.combat.hasReaction });
      }

      /**
       * Toggles the style bonus (sb) state.
       * @returns {Promise<void>}
       */
      static async #onToggleSb() {
        if (!game.teriock.checkEditable(this)) { return; }
        await this.document.update({ "system.offense.sb": !this.document.system.offense.sb });
      }

      /**
       * Use the specified ability.
       * @param {PointerEvent} event
       * @param {HTMLElement} target
       * @returns {Promise<void>}
       */
      static async #onUseAbility(event, target) {
        await this.document.useDocument(target.dataset.ability, { event, type: "ability" });
      }

      /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          openPrimaryAttacker: this.#onOpenPrimaryAttacker,
          openPrimaryBlocker: this.#onOpenPrimaryBlocker,
          selectAttacker: { buttons: [0, 2], handler: this.#onSelectAttacker },
          selectBlocker: { buttons: [0, 2], handler: this.#onSelectBlocker },
          toggleReaction: this.#onToggleReaction,
          toggleSb: this.#onToggleSb,
          useAbility: { buttons: [0, 2], handler: this.#onUseAbility },
        },
      };
    }
  );
}
