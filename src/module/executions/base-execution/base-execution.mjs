import { CompetenceModel } from "../../data/models/_module.mjs";
import { BaseRoll } from "../../dice/rolls/_module.mjs";
import { TeriockChatMessage } from "../../documents/_module.mjs";
import { AutomationCollection } from "../../documents/collections/_module.mjs";
import { addFormula, formulaExists } from "../../helpers/formula.mjs";

export default class BaseExecution {
  /**
   * Construct an execution.
   * @param {Teriock.Execution.BaseExecutionOptions} options
   */
  constructor(options = {}) {
    this.options = options;
    this._actor = options.actor ?? game.actors.default;
    this._formula = options.formula ?? "";
    this._rollData = options.rollData ?? {};
    this._rollOptions = options.rollOptions ?? {};
    this._determineCompetence(options);
    options.competence = this.competence.raw;
  }

  /** @type {Teriock.UI.HTMLButtonConfig[]} */
  buttons = [];

  /** @type {CompetenceModel} */
  competence = new CompetenceModel();

  /** @type {TeriockChatMessage|undefined} */
  message;

  /** @type {Teriock.MessageData.MessagePanel[]} */
  panels = [];

  /** @type {BaseRoll[]} */
  rolls = [];

  /** @type {string[]} */
  tags = [];

  /** @type {object} */
  updates = {};

  /**
   * A class to use for roll construction.
   * @returns {typeof BaseRoll}
   */
  get _RollClass() {
    return BaseRoll;
  }

  /** @type {AnyActor|null} */
  _actor;

  /** @returns {AnyActor|null} */
  get actor() {
    if (this._actor) return this._actor;
    return game.actors.default;
  }

  /** @param {AnyActor|null} actor */
  set actor(actor) {
    this._actor = actor;
  }

  /** @type {BaseAutomation[]} */
  _automations = [];

  /** @returns {AutomationCollection} */
  get automations() {
    return new AutomationCollection(this._automations.map((a) => [a.id, a]));
  }

  /** @param {AutomationCollection | BaseAutomation[]} automations */
  set automations(automations) {
    if (Array.isArray(automations)) this._automations = automations;
    if (automations instanceof AutomationCollection) {
      this._automations = automations.contents;
    }
  }

  /** @type {Teriock.System.FormulaString} */
  _formula;

  /** @returns {Teriock.System.FormulaString} */
  get formula() {
    return this._formula;
  }

  /** @param {Teriock.System.FormulaString} formula */
  set formula(formula) {
    this._formula = formula;
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
   * The automations that are active.
   * @returns {BaseAutomation[]}
   */
  get activeAutomations() {
    return this.automations.contents.filter((a) =>
      a.competencies.has(this.competence.raw),
    );
  }

  /**
   * Data for the chat message this execution creates.
   * @returns {Partial<Teriock.Data.ChatMessageData>}
   */
  get chatData() {
    return {
      speaker: TeriockChatMessage.getSpeaker({ actor: this.actor }),
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
   * Whether competence improves the formula.
   * @return {boolean}
   */
  get competenceImprovesFormula() {
    return true;
  }

  /** @returns {string[]} */
  get executionNames() {
    return [];
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
        new this._RollClass(this.formula, this.rollData, this.rollOptions),
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
   * Determine this execution's competence.
   * @param {Teriock.Execution.BaseExecutionOptions} options
   */
  _determineCompetence(options) {
    if (options.competence !== undefined) {
      this.competence.raw = options.competence;
    }
  }

  /**
   * Evaluate all rolls.
   * @returns {Promise<void>}
   */
  async _evaluateRolls() {
    const rollPromises = [];
    for (const roll of this.rolls) rollPromises.push(roll.evaluate());
    await Promise.all(rollPromises);
  }

  /**
   * Propagate a trigger through the connected actor.
   * @param {Teriock.System.Trigger} trigger
   * @param {Partial<Teriock.System.TriggerScope>} [scope]
   * @returns {Promise<void|false>}
   */
  async _fireActorTrigger(trigger, scope = {}) {
    return await this.actor?.hookCall(trigger, {
      scope: this.getScope({ ...scope, trigger }),
    });
  }

  /**
   * Propagate a trigger through all connected automations.
   * @param {Teriock.System.Trigger} trigger
   * @param {Partial<Teriock.System.TriggerScope>} [scope]
   * @param {object} [options]
   * @param {BaseAutomation[]} [options.automations]
   * @returns {Promise<void>}
   */
  async _fireAutomationsTrigger(trigger, scope = {}, options = {}) {
    const automations = options.automations ?? this.activeAutomations;
    await Promise.all(
      automations.map((a) =>
        a.fireTrigger(trigger, this.getScope({ ...scope, trigger })),
      ),
    );
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
    if (this.competenceImprovesFormula) {
      if (this.competence.fluent) {
        this.formula = addFormula(this.formula, "@f");
      } else if (this.competence.proficient) {
        this.formula = addFormula(this.formula, "@p");
      }
    }
  }

  /**
   * The end of the execution.
   * @returns {Promise<void>}
   */
  async _postExecute() {
    await this._fireAutomationsTrigger("execute");
    await Promise.all(
      this.executionNames.map((n) => this.fireTrigger(`execute${n}`)),
    );
  }

  /**
   * The start of the execution.
   * @returns {Promise<void|false>}
   */
  async _preExecute() {
    await this._fireAutomationsTrigger("preExecute", { awaitFire: true });
    const results = await Promise.all(
      this.executionNames.map((n) =>
        this.fireTrigger(`preExecute${n}`, { awaitFire: true }),
      ),
    );
    if (results.includes(false)) return false;
  }

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
    await this._getInput();
    await this._prepareFormula();
    await this._buildRolls();
    await this._evaluateRolls();
    await this._buildPanels();
    await this._buildButtons();
    await this._buildTags();
    const yes = await this._preExecute();
    if (yes === false) return;
    await this._createChatMessage();
    await this._prepareUpdates();
    await this._updateActor();
    await this._postExecute();
  }

  /**
   * Propagate trigger.
   * @param {Teriock.System.Trigger} trigger
   * @param {Partial<Teriock.System.TriggerScope>} [scope]
   * @returns {Promise<void|false>}
   */
  async fireTrigger(trigger, scope) {
    const automations = this.activeAutomations.filter(
      (a) => a.actor !== this.actor,
    );
    await this._fireAutomationsTrigger(trigger, scope, { automations });
    return await this._fireActorTrigger(trigger, scope);
  }

  /**
   * A scope that can be used when executing macros from a fired trigger.
   * @returns {Teriock.System.TriggerScope}
   */
  getScope(scope = {}) {
    return Object.assign(
      {
        execution: this,
        actor: this.actor || undefined,
      },
      scope,
    );
  }
}
