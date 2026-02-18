import TeriockChatMessage from "../../../documents/chat-message/chat-message.mjs";
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
    this.automations = this.source.system.automations.contents;
  }

  /** @type {BaseAutomation[]} */
  automations;

  /**
   * Data to include in macro execution scopes.
   * @returns {object}
   */
  get _macroExecutionScope() {
    return {
      actor: this.actor,
      speaker: TeriockChatMessage.getSpeaker({
        actor: this.actor,
      }),
      args: [this],
      execution: this,
      useData: this,
      source: this.source,
      system: this.source.system,
      chatData: this.chatData,
      data: { execution: this },
    };
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

    // Apply boosts from the source document
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

  /** @inheritDoc */
  async _createChatMessage() {
    await this._executePseudoHookMacros("preExecution");
    await super._createChatMessage();
  }

  /**
   * @inheritDoc
   * @param {Teriock.Execution.DocumentExecutionOptions} options
   */
  _determineCompetence(options) {
    if (options.proficient === undefined) {
      this.proficient = options.source.system.competence.proficient;
    }
    if (options.fluent === undefined) {
      this.fluent = options.source.system.competence.fluent;
    }
  }

  /**
   * Execute all connected macros that match a given pseudo-hook.
   * @param {string} pseudoHook
   * @returns {Promise<void>}
   */
  async _executePseudoHookMacros(pseudoHook) {
    const macroAutomations =
      /** @type {MacroAutomation[]} */ this.activeAutomations.filter(
        (a) => a.constructor.metadata.macro,
      );
    const correctMacroAutomations = macroAutomations.filter(
      (a) => a.pseudoHook === pseudoHook && a.hasMacro,
    );
    await Promise.all(
      correctMacroAutomations.map(async (a) => {
        const macro = await fromUuid(a.macro);
        await macro.execute(this._macroExecutionScope);
      }),
    );
  }

  /** @inheritDoc */
  async _postExecute() {
    await this._executePseudoHookMacros("execution");
    await super._postExecute();
  }
}
