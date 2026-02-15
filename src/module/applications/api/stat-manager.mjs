import { HackStatMixin } from "../shared/mixins/_module.mjs";
import { TeriockDocumentSheet } from "../sheets/utility-sheets/_module.mjs";

// noinspection JSClosureCompilerSyntax
/**
 * @extends {TeriockDocumentSheet}
 * @mixes HackStatApplication
 * @property {boolean} _consumeStatDice
 * @property {boolean} _forHarm
 */
export default class TeriockStatManager extends HackStatMixin(
  TeriockDocumentSheet,
) {
  /**
   * @inheritDoc
   * @type {Partial<ApplicationConfiguration>}
   */
  static DEFAULT_OPTIONS = {
    classes: ["dialog"],
    actions: {
      ok: this._onDone,
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
    Object.assign(applicationOptions, {
      document: actor,
      sheetConfig: false,
    });
    super(applicationOptions);
    this._forHarm = forHarm;
    this._consumeStatDice = consumeStatDice;
  }

  /**
   * Close the manager.
   * @param {PointerEvent} event
   * @returns {Promise<void>}
   */
  static async _onDone(event) {
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
    return Object.assign(context, {
      forHarm: this._forHarm,
      forHarmField: this._forHarmField,
      consumeStatDice: this._consumeStatDice,
      consumeStatDiceField: this._consumeStatDiceField,
    });
  }
}
