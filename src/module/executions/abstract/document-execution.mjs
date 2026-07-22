import { BaseRoll } from "../../dice/rolls/_module.mjs";
import BaseExecution from "./base-execution.mjs";

const { fields } = foundry.data;

/**
 * @property {Teriock.Execution.ExecutionOptions} options
 * @property {boolean} consumeUses
 */
export default class DocumentExecution extends BaseExecution {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.EXECUTIONS.Document"];

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { consumeUses: new fields.BooleanField({ initial: true }) });
  }

  /**
   * @param {object} [data]
   * @param {Teriock.Execution.ExecutionOptions} [options]
   */
  constructor(data = {}, options = {}) {
    data.consumeUses ??= options.source?.system?.settings?.getSetting("consumeOnUse");
    super(data, options);
    this._actor = options.actor ?? this.source?.actor ?? game.actors.default;
    this._automations = this.source.system?.automations?.contents ?? [];
    this._boosts = options.boosts ?? this.source.system?.boosts ?? this._boosts;
    if (game.settings.get("teriock", "secretDocuments").has(this.source?.typedIdentifier)) {
      this._messageMode = options.messageMode ?? "blind";
    }
  }

  /** @inheritDoc */
  get _dialogButtons() {
    return [{
      action: "confirm",
      default: true,
      icon: TERIOCK.display.icons.ui.enable,
      label: "TERIOCK.DIALOGS.ThresholdExecutionOptions.use",
      name: "ok",
    }];
  }

  /** @inheritDoc */
  get _dialogDocuments() {
    return [
      { document: this.source, label: _loc(`TYPES.${this.source.documentName}.${this.source.type}`) },
      ...super._dialogDocuments,
    ];
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = super._formPaths;
    if (this.source?.system.consumable) { paths.push("consumeUses"); }
    return paths;
  }

  /** @inheritDoc */
  get chatData() {
    return foundry.utils.mergeObject(super.chatData, { system: { _src: this.source.uuid } });
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.config.document[this.source.type]?.icon ?? super.icon;
  }

  /** @inheritDoc */
  get name() {
    return this.source.system.fullName ?? this.source.name;
  }

  /** @inheritDoc */
  async _buildActivations() {
    const activationLists = await Promise.all(
      this.activeAutomations.map(a => a.getActivations({ execution: this, rollData: this.getRollData() })),
    );
    for (const activations of activationLists) { this.activations.push(...activations); }
    for (const a of this.activations) {
      if (a?.type === "roll" && this._boostsResolved[a.impact]) {
        const boosts = this._boostsResolved[a.impact];
        a?.updateSource({ boosts });
      }
    }
  }

  /**
   * Build tags to remind about boosts applied to this.
   */
  _buildBoostTags() {
    for (const [k, v] of Object.entries(this._boostsResolved)) {
      if (this._hasBoostForImpact(k)) {
        this.tags.push(
          _loc(`TERIOCK.SYSTEMS.Child.EXECUTION.tags.boost${v === 1 ? "" : "s"}`, { formula: v, impact: k }),
        );
      }
    }
  }

  /** @inheritDoc */
  async _buildPanels() {
    this.panels.length = 0;
    const panel = await this._buildSourcePanel();
    if (panel) { this.panels.push(panel); }
  }

  /**
   * Makes a panel representing the source document.
   * @returns {Promise<Teriock.Panels.PanelParts|false>}
   */
  async _buildSourcePanel() {
    return this.source.toPanel?.() ?? false;
  }

  /** @inheritDoc */
  async _buildTags() {
    await super._buildTags();
    this._buildBoostTags();
  }

  /**
   * Evaluate boosts.
   * @returns {Promise<void>}
   */
  async _evaluateBoosts() {
    const boostPromises = Object.entries(this._boosts).map(async (
      [k, v],
    ) => [k, await BaseRoll.getValue(v || "0", this.getRollData())]);
    this._boostsResolved = Object.fromEntries(await Promise.all(boostPromises));
  }

  /**
   * Whether this has boosts for a given impact.
   * @param {Teriock.Keys.Impact} impact
   * @returns {boolean}
   */
  _hasBoostForImpact(impact) {
    return this._boostsResolved[impact] && this.activations.some(a => a.type === "roll" && a.impact === impact);
  }

  /** @inheritDoc */
  async _prepareUpdates() {
    const yes = await super._prepareUpdates();
    if (yes === false) { return false; }

    if (this.source.system?.consumable && this.consumeUses) {
      this.operations.push({
        action: "update",
        documentName: this.source.documentName,
        parent: this.source.parent,
        updates: [{
          _id: this.source.id,
          system: { quantity: Math.max(0, this.source.system.quantity - this.source.system.consumptionAmount) },
        }],
      });
    }
  }

  /** @inheritDoc */
  async execute() {
    if (!this.source) {
      console.error("Document executions must have a source document.");
      return;
    }
    await this._evaluateBoosts();
    await super.execute();
  }

  /**
   * Roll data used by this execution.
   * @returns {object}
   */
  getRollData() {
    return Object.assign(this.source.system?.getSystemRollData?.() ?? {}, super.getRollData());
  }

  /** @inheritDoc*/
  getScope(scope = {}) {
    return Object.assign(this.source?.getScope(scope) || {}, super.getScope(scope));
  }
}
