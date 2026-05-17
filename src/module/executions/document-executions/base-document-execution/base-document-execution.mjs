import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import BaseExecution from "../../base-execution/base-execution.mjs";

export default class BaseDocumentExecution extends BaseExecution {
  /**
   * @param {Teriock.Execution.DocumentExecutionOptions} options
   */
  constructor(options = {}) {
    super(options);
    this._source = options.source;
    this._actor = options.actor ?? this.source.actor ?? game.actors.default;
    this._automations = this.source.system.automations.contents || [];
    this._boosts = options.boosts ?? this.source.system.boosts ?? this._boosts;
  }

  /** @type {AnyChildDocument} */
  _source;

  /** @inheritDoc */
  get chatData() {
    return foundry.utils.mergeObject(super.chatData, {
      system: { _src: this.source.uuid },
    });
  }

  /**
   * Roll data used by this execution.
   * @returns {object}
   */
  get rollData() {
    return Object.assign(this.source.system.getSystemRollData() || {}, super.rollData);
  }

  /**
   * Source document.
   * @returns {AnyChildDocument}
   */
  get source() {
    return this._source;
  }

  /** @inheritDoc */
  async _buildActivations() {
    const activationLists = await Promise.all(
      this.activeAutomations.map(a => a.getActivations({ execution: this, rollData: this.rollData })),
    );
    for (const activations of activationLists) {
      this.activations.push(...activations);
    }
    for (const a of this.activations) {
      if (a.type === "roll" && this._boostsResolved[a.impact]) {
        const boosts = this._boostsResolved[a.impact];
        a.updateSource({ boosts: boosts });
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
          _loc(`TERIOCK.SYSTEMS.Child.EXECUTION.tags.boost${v === 1 ? "" : "s"}`, {
            formula: v,
            impact: k,
          }),
        );
      }
    }
  }

  /** @inheritDoc */
  async _buildPanels() {
    this.panels.length = 0;
    const panel = await this._buildSourcePanel();
    this.panels.push(panel);
  }

  /**
   * Makes a panel representing the source document.
   * @returns {Promise<Teriock.Messages.MessagePanel>}
   */
  async _buildSourcePanel() {
    return this.source.toPanel();
  }

  /** @inheritDoc */
  async _buildTags() {
    this._buildBoostTags();
  }

  /**
   * @inheritDoc
   * @param {Teriock.Execution.DocumentExecutionOptions} options
   */
  _determineCompetence(options) {
    this.competence.raw = options.source?.system.competence.value || 0;
    super._determineCompetence(options);
  }

  /**
   * Evaluate boosts.
   * @returns {Promise<void>}
   */
  async _evaluateBoosts() {
    const boostPromises = Object.entries(this._boosts).map(async ([k, v]) => [
      k,
      await BaseRoll.getValue(v || "0", this.rollData),
    ]);
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
  async execute() {
    if (!this.source) {
      console.error("Document executions must have a source document.");
      return;
    }
    await this._evaluateBoosts();
    await super.execute();
  }

  /** @inheritDoc*/
  getScope(scope = {}) {
    return Object.assign(this.source?.getScope(scope) || {}, super.getScope(scope));
  }
}
