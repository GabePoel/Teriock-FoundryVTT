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
  }

  /** @type {AnyChildDocument} */
  _source;

  /**
   * Source document.
   * @returns {AnyChildDocument}
   */
  get source() {
    return this._source;
  }

  /** @inheritDoc */
  get chatData() {
    const chatData = super.chatData;
    chatData.system.source = this.source.uuid;
    return chatData;
  }

  /**
   * Roll data used by this execution.
   * @returns {object}
   */
  get rollData() {
    return Object.assign(
      this.source.system.getSystemRollData() || {},
      super.rollData,
    );
  }

  /** @inheritDoc */
  async _buildActivations() {
    const activationLists = await Promise.all(
      this.activeAutomations.map((a) =>
        a.getActivations({ rollData: this.rollData, execution: this }),
      ),
    );
    for (const activations of activationLists) {
      this.activations.push(...activations);
    }
    this.activations =
      teriock.data.pseudoDocuments.activations.RollActivation.mergeRolls(
        this.activations,
      );
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

  /**
   * @inheritDoc
   * @param {Teriock.Execution.DocumentExecutionOptions} options
   */
  _determineCompetence(options) {
    this.competence.raw = options.source?.system.competence.value || 0;
    super._determineCompetence(options);
  }

  /** @inheritDoc */
  async execute() {
    if (!this.source) {
      console.error("Document executions must have a source document.");
      return;
    }
    await super.execute();
  }

  /** @inheritDoc*/
  getScope(scope = {}) {
    return Object.assign(
      this.source?.getScope(scope) || {},
      super.getScope(scope),
    );
  }
}
