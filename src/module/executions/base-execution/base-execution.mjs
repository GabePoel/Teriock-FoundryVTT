import { BaseRoll } from "../../dice/rolls/_module.mjs";
import { TeriockChatMessage } from "../../documents/_module.mjs";
import { addFormula, formulaExists } from "../../helpers/formula.mjs";

export default class BaseExecution {
  /**
   * Construct an execution.
   * @param {Teriock.Execution.BaseExecutionOptions} options
   */
  constructor(options = {}) {
    const {
      actor = null,
      proficient = false,
      fluent = false,
      formula = "",
      rollData = {},
      rollOptions = {},
    } = options;
    this.options = options;
    this._actor = actor;
    this.formula = formula;
    this.proficient = proficient;
    this.fluent = fluent;
    this._rollData = rollData;
    this._rollOptions = rollOptions;
  }

  /** @type {Teriock.UI.HTMLButtonConfig[]} */
  buttons = [];

  /** @type {boolean} */
  fluent = false;

  /** @type {string} */
  formula;

  /** @type {TeriockChatMessage|undefined} */
  message;

  /** @type {Teriock.MessageData.MessagePanel[]} */
  panels = [];

  /** @type {boolean} */
  proficient = false;

  /** @type {BaseRoll[]} */
  rolls = [];

  /** @type {string[]} */
  tags = [];

  /** @type {object} */
  updates = {};

  /** @type {TeriockActor|null} */
  _actor;

  /**
   * @returns {TeriockActor|null}
   */
  get actor() {
    if (this._actor) {
      return this._actor;
    } else {
      return game.actors.defaultActor;
    }
  }

  /**
   * @param {TeriockActor|null} actor
   */
  set actor(actor) {
    this._actor = actor;
  }

  /** @type {object} */
  _rollData;

  /**
   * Roll data used by this execution.
   * @returns {object}
   */
  get rollData() {
    const rollData = this.actor?.getRollData() || {};
    Object.assign(rollData, foundry.utils.deepClone(this._rollData));
    return rollData;
  }

  /** @type {object} */
  _rollOptions = {};

  /**
   * Roll options used by this execution.
   * @returns {Object}
   */
  get rollOptions() {
    return foundry.utils.mergeObject(
      {
        flavor: this.flavor,
      },
      this._rollOptions,
    );
  }

  /**
   * Data for the chat message this execution creates.
   * @returns {Partial<Teriock.Data.ChatMessageData>}
   */
  get chatData() {
    return {
      speaker:
        /** @type {Teriock.Foundry.ChatSpeakerData} */ TeriockChatMessage.getSpeaker(
          {
            actor: this.actor,
          },
        ),
      rolls: this.rolls,
      system: {
        avatar: this.actor?.img,
        buttons: this.buttons,
        panels: this.panels,
        tags: this.tags,
      },
    };
  }

  /**
   * Flavor text to display on each die roll.
   * @returns {string}
   */
  get flavor() {
    return "";
  }

  /**
   * Build buttons displayed in this execution's chat message.
   * @returns {Promise<void>}
   */
  async _buildButtons() {}

  /**
   * Build panels displayed in this execution's chat message.
   * @returns {Promise<void>}
   */
  async _buildPanels() {}

  /**
   * Build rolls used in this execution.
   * @returns {Promise<void>}
   */
  async _buildRolls() {
    if (formulaExists(this.formula)) {
      this.rolls.push(
        new BaseRoll(this.formula, this.rollData, this.rollOptions),
      );
    }
  }

  /**
   * Build tags displayed in this execution's chat message.
   * @returns {Promise<void>}
   */
  async _buildTags() {}

  /**
   * Create a chat message from this execution.
   * @param {object} [options]
   * @param {Teriock.Rolls.RollMode} [options.rollMode]
   * @returns {Promise<void>}
   */
  async _createChatMessage(options = {}) {
    const { rollMode = game.settings.get("core", "rollMode") } = options;
    const chatData = this.chatData;
    TeriockChatMessage.applyRollMode(chatData, rollMode);
    this.message = await TeriockChatMessage.create(chatData);
  }

  /**
   * Evaluate all rolls.
   * @returns {Promise<void>}
   */
  async _evaluateRolls() {
    const rollPromises = [];
    for (const roll of this.rolls) {
      rollPromises.push(roll.evaluate());
    }
    await Promise.all(rollPromises);
  }

  /**
   * Get any user input that is relevant for staging this execution.
   * @returns {Promise<void>}
   */
  async _getInput() {}

  /**
   * Improve the formula used in this execution.
   * @returns {Promise<void>}
   */
  async _improveFormula() {
    if (this.fluent) {
      this.formula = addFormula(this.formula, "@f");
    } else if (this.proficient) {
      this.formula = addFormula(this.formula, "@p");
    }
  }

  /**
   * The end of the execution.
   * @returns {Promise<void>}
   */
  async _postExecute() {}

  /**
   * The start of the execution.
   * @returns {Promise<void>}
   */
  async _preExecute() {}

  /**
   * Prepare the primary formula used in this execution.
   * @returns {Promise<void>}
   */
  async _prepareFormula() {
    await this._improveFormula();
  }

  /**
   * Prepare updates that will be applied to the actor.
   * @returns {Promise<void>}
   */
  async _prepareUpdates() {}

  /**
   * Update the actor with any costs or other changes as a result of this execution.
   * @returns {Promise<void>}
   */
  async _updateActor() {
    if (this.actor && Object.keys(this.updates).length > 0) {
      await this.actor.update(this.updates);
    }
  }

  /**
   * Asynchronous handling of this execution.
   * @returns {Promise<void>}
   */
  async execute() {
    await this._preExecute();
    await this._getInput();
    await this._prepareFormula();
    await this._buildRolls();
    await this._evaluateRolls();
    await this._buildPanels();
    await this._buildButtons();
    await this._buildTags();
    await this._createChatMessage();
    await this._prepareUpdates();
    await this._updateActor();
    await this._postExecute();
  }
}
