import { BaseEffectSheet } from "../../_base.mjs";
import { documentOptions } from "../../../helpers/constants/document-options.mjs";

/**
 * Base effect sheet for Teriock system active effects.
 * Provides common functionality for all effect sheets including change management,
 * context preparation, and effect state handling.
 */
export default class TeriockBaseEffectSheet extends BaseEffectSheet {
  /**
   * Default options for the base effect sheet.
   * @type {object}
   * @static
   */
  static DEFAULT_OPTIONS = {
    classes: ["effect"],
    window: {
      icon: `fa-solid fa-${documentOptions.effect.icon}`,
    },
    actions: {
      addChange: this._addChange,
      deleteChange: this._deleteChange,
      toggleDisabledThis: this._toggledDisabledThis,
    },
  };

  /** @inheritDoc */
  constructor(...args) {
    super(...args);
    this.effect = this.document;
  }

  /**
   * Adds a new change to an effect application.
   * @param {Event} event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when change is added.
   * @static
   */
  static async _addChange(event, target) {
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

  /**
   * Deletes a change from an effect application.
   * @param {Event} event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when change is deleted.
   * @static
   */
  static async _deleteChange(event, target) {
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
   * @param {Event} event - The event object.
   * @param {HTMLElement} target - The target element.
   * @returns {Promise<void>} Promise that resolves when disabled state is toggled.
   * @static
   */
  static async _toggledDisabledThis(event, target) {
    await this.document.toggleDisabled();
  }

  /**
   * Prepares the context data for template rendering.
   * Adds effect-specific data including disabled state, suppression, and enriched description.
   * @returns {Promise<object>} Promise that resolves to the context object.
   * @override
   */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.disabled = this.document.disabled;
    context.isSuppressed = this.document.isSuppressed;
    context.transfer = this.document.transfer;
    context.changes = this.document.system.applies;
    const system = this.document.system;
    context.enrichedDescription = await this._editor(system.description);
    context.isProficient = this.document.isProficient;
    context.isFluent = this.document.isFluent;
    return context;
  }

  /**
   * Handles the render event for the effect sheet.
   * Sets up change entry event listeners for dynamic updates.
   * @param {object} context - The render context.
   * @param {object} options - Render options.
   * @override
   */
  _onRender(context, options) {
    super._onRender(context, options);
  }
}
