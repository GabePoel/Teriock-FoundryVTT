import BaseExecution from "../../base-execution/base-execution.mjs";

export default class BaseDocumentExecution extends BaseExecution {
  /**
   * @param {Teriock.Execution.DocumentExecutionOptions} options
   */
  constructor(options = {}) {
    super(options);
    this._source = options.source;
    if (options.actor === undefined) {
      this._actor = options.source.actor || null;
    }
    if (options.proficient === undefined) {
      this.proficient = options.source.system.competence.proficient;
    }
    if (options.fluent === undefined) {
      this.fluent = options.source.system.competence.fluent;
    }
  }

  /** @type {GenericChild} */
  _source;

  /**
   * Source document.
   * @returns {GenericChild}
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
    const rollData = this.source.system.getSystemRollData();
    Object.assign(rollData, super.rollData);
    return rollData;
  }

  /** @inheritDoc */
  async _buildPanels() {
    this.panels.length = 0;
    const panel = await this._buildSourcePanel();
    this.panels.push(panel);
  }

  /**
   * Makes a panel representing the source document.
   * @returns {Promise<Teriock.MessageData.MessagePanel>}
   */
  async _buildSourcePanel() {
    return this.source.toPanel();
  }
}
