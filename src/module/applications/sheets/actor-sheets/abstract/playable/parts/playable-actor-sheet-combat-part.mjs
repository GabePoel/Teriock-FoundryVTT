import { DocumentSelector } from "../../../../../dialogs/_module.mjs";
import { TeriockContextMenu } from "../../../../../ux/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 * @import { ContextMenuEntry } from "@client/applications/ux/context-menu.mjs";
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
        if (this.document.system.cover < 3) { await this.document.system.increaseCover(); }
        else { await this.document.system.decreaseCover(3); }
      } else if (event.button === 2) {
        if (this.document.system.cover > 0) { await this.document.system.decreaseCover(); }
        else { await this.document.system.increaseCover(3); }
      }
    }

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
     * Reset attack penalty to zero.
     * @returns {Promise<void>}
     */
    static async #onResetAttackPenalty() {
      const combatant = this.document.defaultCombatant;
      if (!combatant || !game.teriock.checkEditable(this)) { return; }
      await combatant.update({ "system.attackPenalty": 0 });
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
        [...this.document.previewedTypes.equipment.filter(e => e.system.equipped), ...this.document.previewedTypes.body]
          .filter(a => a.active),
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
        [...this.document.previewedTypes.equipment.filter(e => e.system.equipped), ...this.document.previewedTypes.body]
          .filter(a => a.active),
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
      const combatant = this.document.defaultCombatant;
      if (!combatant || !game.teriock.checkEditable(this)) { return; }
      await combatant.update({ "system.reactions": combatant.system.reactions ? 0 : 1 });
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
        increaseCover: { buttons: [0, 2], handler: this.#onIncreaseCover },
        openPrimaryAttacker: this.#onOpenPrimaryAttacker,
        openPrimaryBlocker: this.#onOpenPrimaryBlocker,
        resetAttackPenalty: { buttons: [2], handler: this.#onResetAttackPenalty },
        selectAttacker: { buttons: [0, 2], handler: this.#onSelectAttacker },
        selectBlocker: { buttons: [0, 2], handler: this.#onSelectBlocker },
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
      await this.render();
    }

    /**
     * Creates a context menu for selecting piercing type.
     * Provides options for none, AV0, and UB piercing types.
     * @returns {ContextMenuEntry[]}
     */
    #piercingContextMenu() {
      return TeriockContextMenu.makeUpdateEntries(
        this.actor,
        Object.entries(TERIOCK.config.piercing.levels).map(([k, v]) => {
          return { icon: v.icon, label: v.label, value: k };
        }),
        { path: "system.offense.piercing.raw" },
      );
    }

    /** @inheritDoc */
    async _onRender(context, options) {
      await super._onRender(context, options);
      this._createContextMenu(this.#piercingContextMenu, ".actor-piercing-box", { eventName: "click" });
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
