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
    this.automations = this.source.system.automations.contents;
  }

  /** @type {BaseAutomation[]} */
  automations;

  /** @type {GenericChild} */
  _source;

  /**
   * Source document.
   * @returns {GenericChild}
   */
  get source() {
    return this._source;
  }

  /**
   * The automations that are active.
   * @returns {BaseAutomation[]}
   */
  get activeAutomations() {
    return this.automations.filter(
      (a) =>
        a.competencies.has(0) ||
        (a.competencies.has(1) && this.proficient) ||
        (a.competencies.has(2) && this.fluent),
    );
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
  async _buildButtons() {
    this.activeAutomations.forEach((a) => this.buttons.push(...a.buttons));
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
