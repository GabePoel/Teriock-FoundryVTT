import { HackStatMixin } from "../shared/mixins/_module.mjs";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

// noinspection JSClosureCompilerSyntax
/**
 * @extends {ApplicationV2}
 * @mixes HandlebarsApplicationMixin
 * @mixes HackStatApplication
 * @property {TeriockActor} actor
 * @property {TeriockActor} document
 */
export default class TeriockStatManager extends HackStatMixin(
  HandlebarsApplicationMixin(ApplicationV2),
) {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["teriock", "dialog"],
    actions: {
      ok: this._done,
    },
    position: {
      width: 425,
    },
  };

  /**
   * Creates a new stat manager instance.
   * @param {TeriockActor} actor
   * @param {Teriock.Dialog.StatDialogOptions} [options]
   * @param {object} [applicationOptions]
   */
  constructor(actor, options, applicationOptions = {}) {
    const { forHarm = false, consumeStatDice = true, title = "" } = options;
    if (title.length > 0) {
      applicationOptions.title = title;
    }
    super(applicationOptions);
    this._forHarm = forHarm;
    this._consumeStatDice = consumeStatDice;
    this.actor = actor;
  }

  /**
   * Close the manager.
   * @param {MouseEvent} event
   * @returns {Promise<void>}
   * @private
   */
  static async _done(event) {
    event.preventDefault();
    await this.close();
  }

  /** @inheritDoc */
  _initializeApplicationOptions(options = {}) {
    const applicationOptions = super._initializeApplicationOptions(options);
    if (options.title) {
      applicationOptions.window.title = options.title;
    }
    return applicationOptions;
  }

  /** @inheritDoc */
  _onClose(options = {}) {
    super._onClose(options);
    foundry.helpers.Hooks.off("updateActor", this._actorHook);
    foundry.helpers.Hooks.off("updateItem", this._itemHook);
  }

  /** @inheritDoc */
  async _onFirstRender(context, options) {
    await super._onFirstRender(context, options);
    this._actorHook = foundry.helpers.Hooks.on(
      "updateActor",
      async (document) => {
        if (document.uuid === this.actor.uuid) {
          await this.render();
        }
      },
    );
    this._itemHook = foundry.helpers.Hooks.on(
      "updateItem",
      async (document) => {
        if (document.actor && document.actor.uuid === this.actor.uuid) {
          await this.render();
        }
      },
    );
  }

  /** @inheritDoc */
  async _onRender(context, options) {
    await super._onRender(context, options);
    /** @type {HTMLInputElement} */
    const forHarmCheckbox = this.element.querySelector("[name='for-harm']");
    if (forHarmCheckbox) {
      forHarmCheckbox.addEventListener("change", () => {
        this._forHarm = forHarmCheckbox.checked;
      });
    }
    /** @type {HTMLInputElement} */
    const consumeDiceCheckbox = this.element.querySelector(
      "[name='consume-dice']",
    );
    if (consumeDiceCheckbox) {
      consumeDiceCheckbox.addEventListener("change", () => {
        this._consumeStatDice = consumeDiceCheckbox.checked;
      });
    }
  }

  /** @inheritDoc */
  async _prepareContext(options = {}) {
    const context = await super._prepareContext(options);
    context.forHarm = this._forHarm;
    context.forHarmField = this._forHarmField;
    context.consumeStatDice = this._consumeStatDice;
    context.consumeStatDiceField = this._consumeStatDiceField;
    context.system = this.actor.system;
    context.uuid = this.actor.uuid;
    return context;
  }
}
