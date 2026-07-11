import { ExecutionEditor } from "../../applications/dialogs/_module.mjs";
import { BaseDataModel } from "../../data/abstract/_module.mjs";
import { FormulaField } from "../../data/fields/_module.mjs";
import * as dataMixins from "../../data/mixins/_module.mjs";
import { CompetenceModel } from "../../data/models/_module.mjs";
import { BaseRoll } from "../../dice/rolls/_module.mjs";
import { TeriockChatMessage } from "../../documents/_module.mjs";
import { TypeCollection } from "../../documents/collections/_module.mjs";
import { addFormula, formulaExists } from "../../helpers/formula.mjs";

const { fields } = foundry.data;

/**
 * Executions are ephemeral classes that resolve some sort of roll, activity, document usage, etc. They show an
 * {@link ExecutionEditor} dialog for the user to interact with and configure.
 * @mixes AutomatedData
 * @extends {BaseDataModel}
 */
export default class BaseExecution extends dataMixins.AutomatedDataMixin(BaseDataModel) {
  /**
   * Create an execution and immediately execute it.
   * @param {object} [data] - Initial schema data.
   * @param {Partial<Teriock.Execution.ExecutionOptions>} [options] - Construction context.
   * @returns {Promise<InstanceType<this>>}
   */
  static async create(data = {}, options = {}) {
    const execution = new this(data, options);
    await execution.execute();
    return execution;
  }

  /** @inheritDoc */
  static defineSchema() {
    return {
      competence: new fields.EmbeddedDataField(CompetenceModel),
      formula: new FormulaField({ deterministic: false, initial: "" }),
    };
  }

  /**
   * Construct an execution.
   * @param {object} [data] - Initial schema data, handled by default {@link DataModel} construction.
   * @param {Partial<Teriock.Execution.ExecutionOptions>} [options] - Construction context.
   */
  constructor(data = {}, options = {}) {
    super(data);
    this.options = options;
    this.#source = options.source;
    this._showDialog = options.showDialog ?? game.settings.get("teriock", "showRollDialogs");
    this._actor = options.actor ?? game.actors.default;
    this._boosts = options.boosts ?? {};
    this._rollData = options.rollData ?? {};
    this._rollOptions = options.rollOptions ?? {};
    this._messageMode = options.messageMode ?? game.settings.get("core", "messageMode");
    this._determineCompetence(options);
  }

  /** @type {TeriockJournalEntryPage} */
  #journalEntryPage;

  /**
   * The source this execution comes from.
   * @type {AnyCommonDocument|BaseModifierModel}
   */
  #source;

  /** @type {AnyActor|null} */
  _actor;

  /** @type {Teriock.Automations.Any[]} */
  _automations = [];

  /** @type {Record<Teriock.Keys.Impact, Teriock.System.FormulaString>} */
  _boosts;

  /** @type {Record<Teriock.Keys.Impact, number>} */
  _boostsResolved;

  /** @type {Teriock.Messages.Mode} */
  _messageMode;

  /** @type {object} */
  _rollData;

  /** @type {object} */
  _rollOptions = {};

  /** @type {boolean} */
  _showDialog = false;

  /** @type {Teriock.Activations.Any[]} */
  activations = [];

  /** @type {TeriockChatMessage|undefined} */
  message;

  /** @type {Teriock.Panels.PanelParts[]} */
  panels = [];

  /** @type {BaseRoll[]} */
  rolls = [];

  /** @type {string[]} */
  tags = [];

  /** @type {object} */
  updates = {};

  /**
   * Buttons displayed in this execution's input dialog.
   * @returns {Teriock.Execution.ExecutionDialogButton[]}
   */
  get _dialogButtons() {
    return [{
      action: "confirm",
      default: true,
      icon: TERIOCK.display.icons.ui.enable,
      label: "COMMON.Confirm",
      name: "ok",
    }];
  }

  /**
   * Documents displayed alongside this execution's input dialog.
   * @returns {Teriock.Execution.ExecutionDialogDocument[]}
   */
  get _dialogDocuments() {
    const docs = [];
    if (this.journalEntryPage) {
      docs.push({
        document: this.journalEntryPage,
        label: _loc(`TYPES.JournalEntryPage.${this.journalEntryPage.type}`),
      });
    }
    return docs;
  }

  /**
   * A class to use for roll construction.
   * @returns {typeof BaseRoll}
   */
  get _RollClass() {
    return BaseRoll;
  }

  /** @inheritDoc */
  get activeAutomations() {
    return this.automations.contents.filter(a =>
      a.competencies.has(this.competence.raw) && a.checkIfQualified(this.getRollData())
    );
  }

  /** @returns {AnyActor|null} */
  get actor() {
    if (this._actor) { return this._actor; }
    return game.actors.default;
  }

  /** @param {AnyActor|null} actor */
  set actor(actor) {
    this._actor = actor;
  }

  /** @returns {TypeCollection<ID<Teriock.Automations.Any>, Teriock.Automations.Any>} */
  get automations() {
    return new TypeCollection(this._automations.map(a => [a.id, a]));
  }

  /** @param {TypeCollection | Teriock.Automations.Any[]} automations */
  set automations(automations) {
    if (Array.isArray(automations)) { this._automations = automations; }
    if (automations instanceof TypeCollection) { this._automations = automations.contents; }
  }

  /**
   * Whether this has content to populate an input dialog.
   * @returns {boolean}
   */
  get canShowDialog() {
    return Boolean(this._formPaths.length) || Boolean(this._dialogDocuments.length);
  }

  /**
   * Data for the chat message this execution creates.
   * @returns {Partial<Teriock.Data.ChatMessageData>}
   */
  get chatData() {
    return {
      rolls: this.rolls,
      speaker: TeriockChatMessage.getSpeaker({ actor: this.actor }),
      system: {
        activations: teriock.data.pseudoDocuments.abstract.BasePseudoDocument.toCollectionObject(this.activations),
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
    return formulaExists(this.formula);
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
   * An icon for this execution to show in its input dialog.
   * @returns {string}
   */
  get icon() {
    return undefined;
  }

  /**
   * A set journal entry page.
   * @returns {TeriockJournalEntryPage|null}
   */
  get journalEntryPage() {
    return this.#journalEntryPage;
  }

  /**
   * An identifier for a journal entry page to display.
   * @returns {TypedIdentifier|null}
   */
  get journalEntryPageIdentifier() {
    return null;
  }

  /**
   * A name for this execution to show in its input dialog.
   * @returns {string}
   */
  get name() {
    return "";
  }

  /**
   * Roll options used by this execution.
   * @returns {object}
   */
  get rollOptions() {
    return foundry.utils.mergeObject({ flavor: this.flavor }, this._rollOptions);
  }

  /**
   * Whether to show an input dialog before this execution resolves.
   * @returns {boolean}
   */
  get showDialog() {
    return this._showDialog && this.canShowDialog;
  }

  /**
   * Source of this execution.
   * @returns {AnyChildDocument|BaseModifierModel}
   */
  get source() {
    return this.#source;
  }

  /**
   * Build activations to attach to this execution's chat message.
   * @returns {Promise<false|void>}
   */
  async _buildActivations() {}

  /**
   * Build panels displayed in this execution's chat message.
   * @returns {Promise<false|void>}
   */
  async _buildPanels() {}

  /**
   * Build rolls used in this execution.
   * @returns {Promise<false|void>}
   */
  async _buildRolls() {
    if (formulaExists(this.formula)) {
      this.rolls.push(new this._RollClass(this.formula, this.getRollData(), this.rollOptions));
    }
  }

  /**
   * Build tags displayed in this execution's chat message.
   * @returns {Promise<false|void>}
   */
  async _buildTags() {}

  /**
   * Create a chat message from this execution.
   * @param {object} [options]
   * @param {Teriock.Messages.Mode} [options.mode]
   * @returns {Promise<false|void>}
   */
  async _createChatMessage(options = {}) {
    const { mode = this._messageMode } = options;
    const chatData = this.chatData;
    TeriockChatMessage.applyMode(chatData, mode);
    this.message = await TeriockChatMessage.create(chatData, { chatBubble: false });
  }

  /**
   * Determine this execution's competence.
   * @param {Teriock.Execution.ExecutionOptions} options
   */
  _determineCompetence(options) {
    let competence = 0;
    if (foundry.utils.hasProperty(this.source, "system.competence.raw")) {
      competence = foundry.utils.getProperty(this.source, "system.competence.value");
    }
    if (foundry.utils.hasProperty(this.source, "competence.raw")) {
      competence = foundry.utils.getProperty(this.source, "competence.value");
    }
    if (foundry.utils.hasProperty(options, "competence")) { competence = options.competence; }
    this.updateSource({ "competence.raw": competence });
  }

  /**
   * Evaluate all rolls.
   * @returns {Promise<false|void>}
   */
  async _evaluateRolls() {
    const rollPromises = [];
    for (const roll of this.rolls) { rollPromises.push(roll.evaluate()); }
    await Promise.all(rollPromises);
  }

  /**
   * Fetch any data that needs to be got asynchronously before other steps.
   * @returns {Promise<false|void>}
   */
  async _fetchData() {
    this.#journalEntryPage = await teriock.fromIdentifier(this.journalEntryPageIdentifier);
  }

  /**
   * Propagate a trigger through the connected actor.
   * @param {Teriock.System.Trigger} trigger
   * @param {Partial<Teriock.System.TriggerScope>} [scope]
   * @returns {Promise<false|void>}
   */
  async _fireActorTrigger(trigger, scope = {}) {
    return this.actor?.hookCall(trigger, { scope: this.getScope({ ...scope, trigger }) });
  }

  /**
   * Propagate a trigger through all connected automations.
   * @param {Teriock.System.Trigger} trigger
   * @param {Partial<Teriock.System.TriggerScope>} [scope]
   * @param {object} [options]
   * @param {Teriock.Automations.Any[]} [options.automations]
   * @returns {Promise<false|void>}
   */
  async _fireAutomationsTrigger(trigger, scope = {}, options = {}) {
    const automations = options.automations ?? this.activeAutomations;
    await Promise.all(automations.map(a => a.fireTrigger(trigger, this.getScope({ ...scope, trigger }))));
  }

  /**
   * Get any user input that is relevant for staging this execution.
   * @returns {Promise<false|void>}
   */
  async _getInput() {
    if (this.showDialog && (await this._showInputDialog()) === false) { return false; }
  }

  /**
   * Improve the formula used in this execution.
   * @returns {Promise<false|void>}
   */
  async _improveFormula() {
    if (this.competenceImprovesFormula) {
      if (this.competence.fluent) { this.formula = addFormula(this.formula, "@f"); }
      else if (this.competence.proficient) { this.formula = addFormula(this.formula, "@p"); }
    }
  }

  /**
   * The end of the execution.
   * @returns {Promise<false|void>}
   */
  async _postExecute() {
    this._fireAutomationsTrigger("execute");
    this.executionNames.map(n => this.fireTrigger(`execute${n}`));
  }

  /**
   * Handle cleanup after conducting all user input.
   * @returns {Promise<false|void>}
   */
  async _postInput() {
    await this._fireAutomationsTrigger("executeInput", { awaitFire: true });
    const results = await Promise.all(
      this.executionNames.map(n => this.fireTrigger(`executeInput${n}`, { awaitFire: true })),
    );
    if (results.includes(false)) { return false; }
  }

  /**
   * The start of the execution.
   * @returns {Promise<false|void>}
   */
  async _preExecute() {
    await this._fireAutomationsTrigger("preExecute", { awaitFire: true });
    const results = await Promise.all(
      this.executionNames.map(n => this.fireTrigger(`preExecute${n}`, { awaitFire: true })),
    );
    if (results.includes(false)) { return false; }
  }

  /**
   * Prepare the primary formula used in this execution.
   * @returns {Promise<false|void>}
   */
  async _prepareFormula() {
    await this._improveFormula();
  }

  /**
   * Prepare updates that will be applied to the actor.
   * @returns {Promise<false|void>}
   */
  async _prepareUpdates() {}

  /**
   * Show an input dialog to configure this execution before it resolves.
   * @returns {Promise<false|void>}
   */
  async _showInputDialog() {
    if (!this.showDialog) { return; }
    const result = await ExecutionEditor.prompt(this);
    if (result === null) { return false; }
  }

  /**
   * Update the actor with any costs or other changes as a result of this execution.
   * @returns {Promise<false|void>}
   */
  async _updateActor() {
    if (this.actor && Object.keys(this.updates).length > 0) { await this.actor.update(this.updates); }
  }

  /**
   * Asynchronous handling of this execution.
   * @returns {Promise<false|void>}
   */
  async execute() {
    if ((await this._fetchData()) === false) { return false; }
    if ((await this._getInput()) === false) { return false; }
    if ((await this._postInput()) === false) { return false; }
    if ((await this._prepareFormula()) === false) { return false; }
    if ((await this._buildRolls()) === false) { return false; }
    if ((await this._evaluateRolls()) === false) { return false; }
    if ((await this._buildPanels()) === false) { return false; }
    if ((await this._buildActivations()) === false) { return false; }
    if ((await this._buildTags()) === false) { return false; }
    if ((await this._preExecute()) === false) { return false; }
    if ((await this._createChatMessage()) === false) { return false; }
    if ((await this._prepareUpdates()) === false) { return false; }
    if ((await this._updateActor()) === false) { return false; }
    if ((await this._postExecute()) === false) { return false; }
  }

  /**
   * Propagate a trigger event.
   * @param {Teriock.System.Trigger} trigger
   * @param {Partial<Teriock.System.TriggerScope>} [scope]
   * @returns {Promise<void|false>}
   */
  async fireTrigger(trigger, scope) {
    const automations = this.activeAutomations.filter(a => a.actor !== this.actor);
    await this._fireAutomationsTrigger(trigger, scope, { automations });
    return this._fireActorTrigger(trigger, scope);
  }

  /**
   * Roll data used by this execution.
   * @returns {object}
   */
  getRollData() {
    return Object.assign(this.actor?.getRollData() || {}, foundry.utils.deepClone(this._rollData));
  }

  /**
   * A scope that can be used when executing macros from a fired trigger event.
   * @param {Teriock.System.TriggerScope} [scope]
   * @returns {Teriock.System.TriggerScope}
   */
  getScope(scope = {}) {
    return Object.assign({ actor: this.actor, execution: this }, scope);
  }
}
