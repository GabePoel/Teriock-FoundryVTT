import { ExecutionEditor } from "../../../applications/dialogs/_module.mjs";
import { BaseDataModel } from "../../../data/abstract/_module.mjs";
import { rollableFormulaField } from "../../../data/fields/tools/builders.mjs";
import { CompetenceModel } from "../../../data/models/_module.mjs";
import { AddDocumentsActivation } from "../../../data/pseudo-documents/activations/_module.mjs";
import { BaseAutomation } from "../../../data/pseudo-documents/automations/abstract/_module.mjs";
import { ExecutionPseudoCollection } from "../../../data/pseudo-documents/collections/_module.mjs";
import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import { TeriockChatMessage } from "../../../documents/_module.mjs";
import { addFormula, formulaExists } from "../../../helpers/formula.mjs";

const { fields } = foundry.data;

/**
 * @import { DatabaseWriteOperation } from "@common/abstract/_types.mjs";
 */

/**
 * Executions are ephemeral classes that resolve some sort of roll, activity, document usage, etc. They show an
 * {@link ExecutionEditor} dialog for the user to interact with and configure.
 */
export default class BaseExecution extends BaseDataModel {
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
      formula: rollableFormulaField(),
      makeCritEffect: new fields.BooleanField(),
      makeEffect: new fields.BooleanField(),
      targetsActor: new fields.BooleanField(),
      targetsArmament: new fields.BooleanField(),
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
    this.automations = new ExecutionPseudoCollection("automations", this, [], { documentClass: BaseAutomation });
  }

  /** @type {TeriockJournalEntryPage} */
  #journalEntryPage;

  /** @type {TeriockActiveEffect|TeriockActor|TeriockItem|BaseModifierModel} */
  #source;

  /** @type {TeriockActor|null} */
  _actor;

  /** @type {Record<Teriock.Keys.Impact, Teriock.System.FormulaString>} */
  _boosts;

  /** @type {Record<Teriock.Keys.Impact, number>} */
  _boostsResolved = {};

  /** @type {Teriock.Messages.Mode} */
  _messageMode;

  /** @type {object} */
  _rollData;

  /** @type {object} */
  _rollOptions = {};

  /** @type {boolean} */
  _showDialog = false;

  /** @type {Activation[]} */
  activations = [];

  /** @type {object} */
  actorUpdates = {};

  /** @type {ExecutionPseudoCollection<Automation>} */
  automations;

  /** @type {TeriockChatMessage|undefined} */
  message;

  /** @type {DatabaseWriteOperation[]} */
  operations = [];

  /** @type {Teriock.Panels.PanelParts[]} */
  panels = [];

  /** @type {BaseRoll[]} */
  rolls = [];

  /** @type {string[]} */
  tags = [];

  /**
   * Buttons displayed in this execution's input dialog.
   * @returns {Teriock.Execution.ExecutionDialogButtonEntry[]}
   */
  get _dialogButtons() {
    return [{
      action: "confirm",
      default: true,
      icon: TERIOCK.display.icons.manifest.ui.enable,
      label: "COMMON.Confirm",
      name: "ok",
    }];
  }

  /**
   * Documents displayed alongside this execution's input dialog.
   * @returns {Teriock.Execution.ExecutionDialogDocumentEntry[]}
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
   * Active automations in priority order.
   * @returns {Automation[]}
   */
  get _orderedAutomations() {
    return this.automations.active.sort((a, b) => a._executionPriority - b._executionPriority);
  }

  /**
   * A class to use for roll construction.
   * @returns {typeof BaseRoll}
   */
  get _RollClass() {
    return BaseRoll;
  }

  /** @returns {TeriockActor} */
  get actor() {
    if (this._actor) { return this._actor; }
    return game.actors.default;
  }

  /** @param {TeriockActor|null} actor */
  set actor(actor) {
    this._actor = actor;
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
        panels: teriock.data.pseudoDocuments.abstract.BasePseudoDocument.toCollectionObject(
          this.panels.filter(Boolean).map(p => new teriock.data.pseudoDocuments.Panel(p)),
        ),
        tags: this.tags,
      },
      type: "interactive",
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
   * @returns {TeriockActiveEffect|TeriockItem|BaseModifierModel}
   */
  get source() {
    return this.#source;
  }

  /**
   * Copy construction nodes contributed by automations, hanging their roots off a generated effect's node.
   * @param {object[]} nodes
   * @param {ID<ConstructionNode>} parentId
   * @returns {object[]}
   */
  _attachEffectNodes(nodes, parentId) {
    const ids = new Map(nodes.map(n => [n._id, foundry.utils.randomID()]));
    return nodes.map(n =>
      Object.assign(foundry.utils.deepClone(n), { _id: ids.get(n._id), parentId: ids.get(n.parentId) ?? parentId })
    );
  }

  /**
   * Build activations to attach to this execution's chat message.
   * @returns {Promise<false|void>}
   */
  async _buildActivations() {
    if ((this.targetsActor || this.targetsArmament) && this.makeEffect) { await this._buildEffectActivations(); }
    const rollData = this.getRollData();
    const fetched = await Promise.all(
      this.automations.active.map(a => a.getActivations({ execution: this, rollData })),
    );
    this.activations.push(...fetched.flat());
    for (const a of this.activations) {
      const boosts = this._boostsResolved[a?.impact];
      if (a?.type === "roll" && boosts) {
        a.updateSource({ boosts });
      }
    }
  }

  /**
   * Build the effect activations to attach to this execution's chat message.
   * @returns {Promise<void>}
   */
  async _buildEffectActivations() {
    await this._callAutomations(a => a.interactOnExecutionEffectData(this));
    const variants = [{
      crit: 0,
      data: await this._getNormalEffectData(),
      name: _loc("TERIOCK.EXECUTIONS.Base.DATA.normal"),
      nodes: [],
    }];
    if (this.makeCritEffect) {
      variants.push({
        crit: 1,
        data: await this._getCriticalEffectData(),
        name: _loc("TERIOCK.EXECUTIONS.Base.DATA.crit"),
        nodes: [],
      });
    }
    for (const v of variants) {
      for (const automation of this._orderedAutomations.filter(a => a.crit?.has(v.crit) ?? true)) {
        await automation.modifyExecutionEffectData(this, v.data);
        await automation.modifyExecutionEffectNodes(this, v.nodes);
      }
    }
    const makeNodes = type =>
      variants.flatMap(v => {
        const data = foundry.utils.mergeObject(v.data, this._getEffectTypeData(type), { inplace: false });
        const rootNode = {
          _id: foundry.utils.randomID(),
          competence: { raw: foundry.utils.getProperty(data, "system.competence.raw") ?? 0 },
          data,
          name: v.name,
          overrideData: true,
          parentId: null,
          setCompetence: "override",
        };
        return [rootNode, ...this._attachEffectNodes(v.nodes, rootNode._id)];
      });
    const addActivation = async (target, type, namedLabel, label) => {
      const nodes = makeNodes(type);
      const name = nodes[0]?.data?.name;
      const activation = new AddDocumentsActivation({
        all: false,
        auto: true,
        constructionNodes: AddDocumentsActivation.toCollectionObject(nodes, { keepId: true }),
        display: { label: name ? _loc(namedLabel, { name }) : _loc(label) },
        multi: false,
        target,
      });
      await this._callAutomations(a => a.modifyExecutionEffectActivation(this, activation));
      this.activations.push(activation);
    };
    const labels = "TERIOCK.COMMANDS.ApplyEffect";
    if (this.targetsActor) {
      await addActivation("actor", "consequence", `${labels}.applyNamed`, `${labels}.label`);
    }
    if (this.targetsArmament) {
      await addActivation("armament", "imbuement", `${labels}.applyArmamentNamed`, `${labels}.armament`);
    }
  }

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
  async _buildTags() {
    if (this.competence.proficient) { this.tags.push(this.competence.label); }
    for (const [k, v] of Object.entries(this._boostsResolved)) {
      if (this._hasBoostForImpact(k)) {
        this.tags.push(
          _loc(`TERIOCK.SYSTEMS.Child.EXECUTION.tags.boost${v === 1 ? "" : "s"}`, { formula: v, impact: k }),
        );
      }
    }
  }

  /**
   * Call a function on all the automations.
   * @param {(Automation) => Promise<false|void>} fn
   * @returns {Promise<boolean|void>}
   */
  async _callAutomations(fn) {
    const calls = [];
    for (const automation of this._orderedAutomations) { calls.push(await fn(automation)); }
    if (calls.includes(false)) { return false; }
  }

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
    if (typeof options.competence === "number") { competence = options.competence; }
    this.updateSource({ "competence.raw": competence });
  }

  /**
   * Evaluate boosts.
   * @returns {Promise<false|void>}
   */
  async _evaluateBoosts() {
    const boostPromises = Object.entries(this._boosts).map(async (
      [k, v],
    ) => [k, await BaseRoll.getValue(v || "0", this.getRollData())]);
    this._boostsResolved = Object.fromEntries(await Promise.all(boostPromises));
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
    if (await this._callAutomations(a => a.modifyExecutionConstruction(this)) === false) { return false; }
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
   * Get the initial data for critical effects generated by this execution.
   * @returns {Promise<object>}
   */
  async _getCriticalEffectData() {
    return {};
  }

  /**
   * Get the data that depends on the type of effect generated by this execution.
   * @param {"consequence"|"imbuement"} type
   * @returns {object}
   */
  _getEffectTypeData(type) {
    return { type };
  }

  /**
   * Get any user input that is relevant for staging this execution.
   * @returns {Promise<false|void>}
   */
  async _getInput() {
    if (this.showDialog && (await this._showInputDialog()) === false) { return false; }
  }

  /**
   * Get the initial data for normal effects generated by this execution.
   * @returns {Promise<object>}
   */
  async _getNormalEffectData() {
    return {};
  }

  /**
   * Whether this has boosts for a given impact.
   * @param {Teriock.Keys.Impact} impact
   * @returns {boolean}
   */
  _hasBoostForImpact(impact) {
    return this._boostsResolved[impact] && this.activations.some(a => a.type === "roll" && a.impact === impact);
  }

  /**
   * Improve the formula used in this execution.
   * @returns {Promise<false|void>}
   */
  async _improveFormula() {
    if (this.competenceImprovesFormula) {
      this.updateSource({ formula: addFormula(this.formula, this.competence.formula) });
    }
  }

  /**
   * Perform all staged update operations.
   * @returns {Promise<false|void>}
   */
  async _performUpdates() {
    if (this.operations.length) { await foundry.documents.modifyBatch(this.operations); }
  }

  /**
   * The end of the execution.
   * @returns {Promise<false|void>}
   */
  async _postExecute() {
    if (await this._callAutomations(a => a.interactOnExecutionCompletion(this)) === false) { return false; }

    this.executionNames.map(n => this.fireTrigger(`execute${n}`));
  }

  /**
   * Handle cleanup after conducting all user input.
   * @returns {Promise<false|void>}
   */
  async _postInput() {
    if (await this._callAutomations(a => a.interactOnExecutionInput(this)) === false) { return false; }
    if (await this._callAutomations(a => a.modifyExecution(this)) === false) { return false; }
  }

  /**
   * Prepare the primary formula used in this execution.
   * @returns {Promise<false|void>}
   */
  async _prepareFormula() {
    await this._improveFormula();
  }

  /**
   * Prepare updates that will be applied.
   * @returns {Promise<false|void>}
   */
  async _prepareUpdates() {
    if (this.actor && Object.keys(this.actorUpdates).length && this.actor.isOwner && !this.actor.inCompendium) {
      this.operations.push({
        action: "update",
        documentName: "Actor",
        pack: this.actor?.pack,
        parent: this.actor?.parent,
        updates: [{ _id: this.actor.id, ...this.actorUpdates }],
      });
    }
  }

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
   * Asynchronous handling of this execution.
   * @returns {Promise<false|void>}
   */
  async execute() {
    if ((await this._fetchData()) === false) { return false; }
    if ((await this._evaluateBoosts()) === false) { return false; }
    if ((await this._getInput()) === false) { return false; }
    if ((await this._postInput()) === false) { return false; }
    if ((await this._prepareFormula()) === false) { return false; }
    if ((await this._buildRolls()) === false) { return false; }
    if ((await this._evaluateRolls()) === false) { return false; }
    if ((await this._buildPanels()) === false) { return false; }
    if ((await this._buildActivations()) === false) { return false; }
    if ((await this._buildTags()) === false) { return false; }
    if ((await this._createChatMessage()) === false) { return false; }
    if ((await this._prepareUpdates()) === false) { return false; }
    if ((await this._performUpdates()) === false) { return false; }
    if ((await this._postExecute()) === false) { return false; }
  }

  /**
   * Propagate a trigger event.
   * @param {Teriock.System.Trigger} trigger
   * @param {Partial<Teriock.System.TriggerScope>} [scope]
   * @returns {Promise<void|false>}
   */
  async fireTrigger(trigger, scope) {
    return this._fireActorTrigger(trigger, scope);
  }

  /**
   * Roll data used by this execution.
   * @returns {object}
   */
  getRollData() {
    return Object.assign(this.actor?.getRollData() || {}, foundry.utils.deepClone(this._rollData), {
      c: this.competence.fluent
        ? (this.actor?.system.scaling.f ?? 0)
        : (this.competence.proficient ? (this.actor?.system.scaling.p ?? 0) : 0),
    });
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
