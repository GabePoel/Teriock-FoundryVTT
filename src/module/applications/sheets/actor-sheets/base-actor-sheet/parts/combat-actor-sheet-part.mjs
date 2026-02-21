import { selectDocumentDialog } from "../../../../dialogs/select-document-dialog.mjs";

//noinspection JSClosureCompilerSyntax
/**
 * @param {typeof BaseActorSheet} Base
 */
export default (Base) =>
  /**
   * @extends {BaseActorSheet}
   * @mixin
   */
  class CombatActorSheetPart extends Base {
    static DEFAULT_OPTIONS = {
      actions: {
        useAbility: this._onUseAbility,
        openPrimaryAttacker: this.#onOpenPrimaryAttacker,
        openPrimaryBlocker: this.#onOpenPrimaryBlocker,
        selectAttacker: this.#onSelectAttacker,
        selectBlocker: this.#onSelectBlocker,
        toggleReaction: this.#onToggleReaction,
        toggleSb: this.#onToggleSb,
      },
    };

    /**
     * Opens the primary attacker's sheet.
     * @param {PointerEvent} event - The event object.
     * @returns {Promise<void>}
     */
    static async #onOpenPrimaryAttacker(event) {
      event.stopPropagation();
      await this.document.system.primaryAttacker?.sheet.render(true);
    }

    /**
     * Opens the primary blocker's sheet.
     * @param {PointerEvent} event - The event object.
     * @returns {Promise<void>}
     */
    static async #onOpenPrimaryBlocker(event) {
      event.stopPropagation();
      await this.document.system.primaryBlocker?.sheet.render(true);
    }

    /**
     * Select a primary attacker.
     * @returns {Promise<void>}
     */
    static async #onSelectAttacker() {
      const attacker = await selectDocumentDialog(
        [
          ...this.document.equipment.filter((e) => e.system.equipped),
          ...this.document.bodyParts,
        ],
        {
          hint: game.i18n.localize(
            "TERIOCK.SHEETS.Actor.ACTIONS.SelectAttacker.hint",
          ),
          label: game.i18n.localize(
            "TERIOCK.SHEETS.Actor.ACTIONS.SelectAttacker.label",
          ),
          openable: true,
          textKey: "system.summarizedAttack",
          checked: this.document.system.primaryAttacker?.uuid,
        },
      );
      if (attacker) {
        await this.document.update({
          "system.wielding.attacker": attacker.id,
        });
      }
    }

    /**
     * Select a primary blocker.
     * @returns {Promise<void>}
     */
    static async #onSelectBlocker() {
      const attacker = await selectDocumentDialog(
        this.document.activeArmaments,
        {
          hint: game.i18n.localize(
            "TERIOCK.SHEETS.Actor.ACTIONS.SelectBlocker.hint",
          ),
          label: game.i18n.localize(
            "TERIOCK.SHEETS.Actor.ACTIONS.SelectBlocker.label",
          ),
          openable: true,
          textKey: "system.summarizedBlock",
          checked: this.document.system.primaryBlocker?.uuid,
        },
      );
      if (attacker) {
        await this.document.update({
          "system.wielding.blocker": attacker.id,
        });
      }
    }

    /**
     * Toggles if the character still has a reaction.
     * @returns {Promise<void>}
     */
    static async #onToggleReaction() {
      await this.document.update({
        "system.combat.hasReaction": !this.document.system.combat.hasReaction,
      });
    }

    /**
     * Toggles the style bonus (sb) state.
     * @returns {Promise<void>}
     */
    static async #onToggleSb() {
      await this.document.update({
        "system.offense.sb": !this.document.system.offense.sb,
      });
    }

    /**
     * Use the specified ability.
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     * @this CombatActorSheetPart
     */
    static async _onUseAbility(event, target) {
      await this.#onUseAbility(
        event,
        target,
        game.settings.get("teriock", "showRollDialogs"),
      );
    }

    /**
     * Use the specified ability.
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @param {boolean} showDialog - Whether to show a dialog.
     * @returns {Promise<void>}
     */
    async #onUseAbility(event, target, showDialog) {
      await this.document.useAbility(target.dataset.ability, {
        event,
        showDialog,
      });
    }

    /** @inheritDoc */
    async _onRender(context, options) {
      await super._onRender(context, options);
      this.element
        .querySelectorAll("[data-action=useAbility]")
        .forEach((el) => {
          el.addEventListener("contextmenu", async (ev) => {
            await this.#onUseAbility(
              ev,
              el,
              !game.settings.get("teriock", "showRollDialogs"),
            );
          });
        });
    }
  };
