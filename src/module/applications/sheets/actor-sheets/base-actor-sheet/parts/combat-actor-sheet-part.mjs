import { selectDocumentDialog } from "../../../../dialogs/select-document-dialog.mjs";

export default (Base) =>
  class CombatActorSheetPart extends Base {
    static DEFAULT_OPTIONS = {
      actions: {
        attack: this._attack,
        openPrimaryAttacker: this._openPrimaryAttacker,
        openPrimaryBlocker: this._openPrimaryBlocker,
        selectAttacker: this._selectAttacker,
        selectBlocker: this._selectBlocker,
        toggleReaction: this._toggleReaction,
        toggleSb: this._toggleSb,
      },
    };

    /**
     * Performs a basic attack with optional advantage/disadvantage.
     * @param {MouseEvent} event - The event object.
     * @returns {Promise<void>} Promise that resolves when attack is performed.
     * @static
     */
    static async _attack(event) {
      event.stopPropagation();
      /** @type {Teriock.RollOptions.CommonRoll} */
      const options = {
        advantage: Boolean(event.altKey),
        disadvantage: Boolean(event.shiftKey),
      };
      await this.actor.useAbility("Basic Attack", options);
    }

    /**
     * Opens the primary attacker's sheet.
     * @param {MouseEvent} event - The event object.
     * @returns {Promise<void>} Promise that resolves when the sheet is opened.
     * @static
     */
    static async _openPrimaryAttacker(event) {
      event.stopPropagation();
      await this.document.system.primaryAttacker?.sheet.render(true);
    }

    /**
     * Opens the primary blocker's sheet.
     * @param {MouseEvent} event - The event object.
     * @returns {Promise<void>} Promise that resolves when the sheet is opened.
     * @static
     */
    static async _openPrimaryBlocker(event) {
      event.stopPropagation();
      await this.document.system.primaryBlocker?.sheet.render(true);
    }

    /**
     * Select a primary attacker.
     * @returns {Promise<void>}
     * @private
     */
    static async _selectAttacker() {
      const attacker = await selectDocumentDialog(
        [
          ...this.document.equipment.filter((e) => e.system.isEquipped),
          ...this.document.bodyParts,
        ],
        {
          hint: "Select the default equipment you attack with.",
          label: "Select Primary Attacker",
          openable: true,
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
     * @private
     */
    static async _selectBlocker() {
      const attacker = await selectDocumentDialog(
        this.document.activeArmaments,
        {
          hint: "Select the default equipment you block with.",
          label: "Select Primary Blocker",
          openable: true,
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
     * @returns {Promise<void>} Promise that resolves when sb is toggled.
     * @static
     */
    static async _toggleReaction() {
      await this.document.update({
        "system.combat.hasReaction": !this.document.system.combat.hasReaction,
      });
    }

    /**
     * Toggles the style bonus (sb) state.
     * @returns {Promise<void>} Promise that resolves when sb is toggled.
     * @static
     */
    static async _toggleSb() {
      await this.document.update({
        "system.offense.sb": !this.document.system.offense.sb,
      });
    }
  };
