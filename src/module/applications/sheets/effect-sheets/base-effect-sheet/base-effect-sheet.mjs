import { documentOptions } from "../../../../helpers/constants/document-options.mjs";
import * as createEffects from "../../../../helpers/create-effects.mjs";
import { selectAbilityDialog } from "../../../dialogs/select-dialog.mjs";
import { SheetMixin } from "../../mixins/_module.mjs";

const { ActiveEffectConfig } = foundry.applications.sheets;

/**
 * Base effect sheet for Teriock system active effects.
 * Provides common functionality for all effect sheets including change management,
 * context preparation, and effect state handling.
 *
 * @extends ActiveEffectConfig
 * @property {TeriockEffect} document
 */
export default class TeriockBaseEffectSheet extends SheetMixin(
  ActiveEffectConfig,
) {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = {
    classes: ["effect"],
    window: {
      icon: `fa-solid fa-${documentOptions.effect.icon}`,
    },
    actions: {
      addChange: this._addChange,
      deleteChange: this._deleteChange,
      toggleDisabledThis: this._toggledDisabledThis,
      createAbility: this._createAbility,
    },
  };

  /**
   * Adds a new change to an effect application.
   *
   * @param {Event} _event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when change is added.
   * @static
   */
  static async _addChange(_event, target) {
    const application = target.dataset.application;
    const updateString = `system.applies.${application}.changes`;
    const changes = this.document.system.applies[application].changes;
    const newChange = {
      key: "",
      mode: 0,
      value: "",
      priority: 0,
    };
    changes.push(newChange);
    await this.document.update({ [updateString]: changes });
  }

  /** @inheritDoc */
  static async _createAbility(_event, _target) {
    const abilityKey = await selectAbilityDialog();
    let abilityName = "New Ability";
    console.log(abilityKey);
    if (abilityKey && abilityKey !== "other") {
      abilityName = CONFIG.TERIOCK.abilities[abilityKey];
      const ability = await game.teriock.api.utils.importAbility(
        this.document.parent,
        abilityName,
      );
      await this.document.addSub(ability);
    } else {
      await createEffects.createAbility(this.document, abilityName);
    }
  }

  /**
   * Deletes a change from an effect application.
   *
   * @param {Event} _event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when change is deleted.
   * @static
   */
  static async _deleteChange(_event, target) {
    const index = parseInt(target.dataset.index, 10);
    const application = target.dataset.application;
    const updateString = `system.applies.${application}.changes`;
    const changes = this.document.system.applies[application].changes;
    if (index >= 0 && index < changes.length) {
      changes.splice(index, 1);
      await this.document.update({ [updateString]: changes });
    }
  }

  /**
   * Toggles the disabled state of the current effect.
   * @returns {Promise<void>} Promise that resolves when disabled state is toggled.
   * @static
   */
  static async _toggledDisabledThis() {
    await this.document.update({ disabled: !this.document.disabled });
  }

  /** @inheritDoc */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.disabled = this.document.disabled;
    context.isSuppressed = this.document.isSuppressed;
    context.transfer = this.document.transfer;
    const system = this.document.system;
    context.enrichedDescription = await this._editor(system.description);
    context.isProficient = this.document.isProficient;
    context.isFluent = this.document.isFluent;
    return context;
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
  }
}
