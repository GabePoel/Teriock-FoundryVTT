import {
  addFormula,
  boostFormula,
  formulaExists,
} from "../../../helpers/formula.mjs";
import { RollRollableTakeHandler } from "../../../helpers/interaction/button-handlers/rollable-takes-handlers.mjs";
import { objectMap } from "../../../helpers/utils.mjs";
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

    // Get all buttons that need to be merged
    const buttonsToMerge = this.buttons.filter(
      (b) =>
        b.dataset.action === RollRollableTakeHandler.ACTION && b.dataset.merge,
    );

    // Filter buttons to be merged out of the main button array
    this.buttons = this.buttons.filter(
      (b) =>
        b.dataset.action !== RollRollableTakeHandler.ACTION || !b.dataset.merge,
    );

    // Create aggregate formulas from the merged buttons
    const buttonsByRollType =
      /** @type {Record<Teriock.Parameters.Consequence.RollConsequenceKey, Teriock.UI.HTMLButtonConfig[]>} */ {};
    for (const button of buttonsToMerge) {
      const rollType = button.dataset.type;
      if (!Object.keys(buttonsByRollType).includes(rollType)) {
        buttonsByRollType[rollType] = [button];
      } else {
        buttonsByRollType[rollType].push(button);
      }
    }
    const formulasByRollType = objectMap(buttonsByRollType, (buttons) =>
      buttons.reduce((a, b) => addFormula(a, b.dataset.formula), ""),
    );

    // Convert aggregate formulas back into buttons
    Object.entries(formulasByRollType).forEach(([rollType, formula]) => {
      const boostAmount = this.source.system.boosts[rollType];
      if (formulaExists(boostAmount)) {
        formula = boostFormula(formula, boostAmount);
      }
      formulasByRollType[rollType] = formula;
    });

    // Apply boosts from source document
    this.buttons.push(
      ...Object.entries(formulasByRollType).map(([rollType, formula]) =>
        RollRollableTakeHandler.buildButton(rollType, formula),
      ),
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
   * @returns {Promise<Teriock.MessageData.MessagePanel>}
   */
  async _buildSourcePanel() {
    return this.source.toPanel();
  }
}
