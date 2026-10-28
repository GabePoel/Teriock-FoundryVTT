import { DocumentSelector } from "../../../../../dialogs/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function PlayableActorSheetCombatPart(Base) {
  /** @mixin */
  class PlayableActorSheetCombatPart extends Base {
    /**
     * Increases cover by a step.
     * @param {PointerEvent} event
     * @returns {Promise<void>}
     */
    static async #onIncreaseCover(event) {
      if (!game.teriock.checkEditable(this)) { return; }
      if (event.button === 0) {
        if (this.document.system.cover < 3) { await this.document.take("cover"); }
        else { await this.document.take("uncover", { amount: 3 }); }
      } else if (event.button === 2) {
        if (this.document.system.cover > 0) { await this.document.take("uncover"); }
        else { await this.document.take("cover", { amount: 3 }); }
      }
    }

    /**
     * Opens the sheet of some `data-wielding` armament.
     * @param {PointerEvent} _event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     */
    static async #onOpenWielder(_event, target) {
      await this.document.system.wielding[target.dataset.wielding]?.sheet.render(true);
    }

    /**
     * Reset attack penalty to zero.
     * @returns {Promise<void>}
     */
    static async #onResetAttackPenalty() {
      const combatant = this.document.defaultCombatant;
      if (!combatant || !game.teriock.checkEditable(this)) { return; }
      await combatant.update({ "system.attackPenalty": 0 });
    }

    /**
     * Select some `data-wielding` armament.
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     */
    static async #onSelectWielder(event, target) {
      const role = target.dataset.wielding;
      const current = this.document.system.wielding[role];
      if (event.button === 2 || !this.isEditable) {
        await current?.sheet.render(true);
        return;
      }
      const selected = await DocumentSelector.selectSingle(
        [...this.document.previewedTypes.equipment.filter(e => e.system.equipped), ...this.document.previewedTypes.body]
          .filter(a => a.active),
        {
          checked: current?.uuid,
          hint: _loc(`TERIOCK.SHEETS.Actor.ACTIONS.Select${role.capitalize()}.hint`),
          openable: true,
          textKey: role === "attacker" ? "system.summarizedAttack" : "system.summarizedBlock",
        },
      );
      if (selected) { await this.document.update({ [`system.wielding.${role}`]: selected.id }); }
    }

    /**
     * Toggles if the character still has a reaction.
     * @returns {Promise<void>}
     */
    static async #onToggleReaction() {
      const combatant = this.document.defaultCombatant;
      if (!combatant || !game.teriock.checkEditable(this)) { return; }
      await combatant.update({
        "system.reactions": combatant.system.reactions ? 0 : TERIOCK.CONFIG.combat.maxReactions,
      });
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
      await this.document.useDocument(target.dataset.ability, { event });
    }

    /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
    static DEFAULT_OPTIONS = {
      actions: {
        increaseCover: { buttons: [0, 2], handler: this.#onIncreaseCover },
        openWielder: this.#onOpenWielder,
        resetAttackPenalty: { buttons: [2], handler: this.#onResetAttackPenalty },
        selectWielder: { buttons: [0, 2], handler: this.#onSelectWielder },
        toggleReaction: this.#onToggleReaction,
        toggleSb: this.#onToggleSb,
        useAbility: { buttons: [0, 2], handler: this.#onUseAbility },
      },
    };

    /**
     * Update the default combatant from an input without submitting the actor form.
     * @param {Event} event
     * @returns {Promise<void>}
     */
    async #onChangeCombatantInput(event) {
      event.stopPropagation();
      const combatant = this.document.defaultCombatant;
      if (!combatant || !game.teriock.checkEditable(this)) { return; }
      const input = /** @type {HTMLInputElement} */ (event.currentTarget);
      await combatant.update({ [input.dataset.name]: Number(input.value) });
    }

    /** @inheritDoc */
    async _onRender(context, options) {
      await super._onRender(context, options);
      for (const input of this.element.querySelectorAll(".actor-combatant-input")) {
        input.addEventListener("change", this.#onChangeCombatantInput.bind(this));
      }
    }

    /** @inheritDoc */
    async _prepareContext(options = {}) {
      const context = await super._prepareContext(options);
      const combatant = this.document.defaultCombatant;
      context.inCombat = Boolean(combatant);
      if (context.inCombat) {
        Object.assign(context, {
          actions: combatant.system.actions,
          attackPenalty: combatant.system.attackPenalty,
          combatantFields: combatant.system.schema.fields,
          reactions: combatant.system.reactions,
        });
      }
      return context;
    }
  }

  return PlayableActorSheetCombatPart;
}
