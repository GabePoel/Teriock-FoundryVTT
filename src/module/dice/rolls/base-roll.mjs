import { TeriockChatMessage } from "../../documents/_module.mjs";
import { makeIcon } from "../../helpers/icon.mjs";
import { systemPath } from "../../helpers/path.mjs";
import Booster from "../booster.mjs";
import { selectWeightedMaxFaceDie } from "../helpers.mjs";

const { Roll } = foundry.dice;

/**
 * @inheritDoc
 * @property {Teriock.Dice.BaseRollOptions} options
 */
export default class BaseRoll extends Roll {
  /**
   * Normalize a target into a plain, JSON serializable object. Already parsed targets pass through unchanged.
   * @param {Teriock.Dice.RawDieTarget} target
   * @returns {Teriock.Dice.DieTarget}
   */
  static #parseTarget(target) {
    let img = "";
    let name = "";
    /** @type {TeriockActor} */
    let actor;
    /** @type {TeriockTokenDocument} */
    let token;
    // Handling for token placeables
    if (target.document) {
      token = target.document;
      actor = target.actor;
    }
    // Handling for documents
    if (target.documentName === "TokenDocument") {
      token = target;
      actor ||= token.actor;
    } else if (target.documentName === "Actor") {
      token = target.token;
      actor ||= target;
    }
    // Prioritize name and image from the token over the actor
    if (actor) {
      img = actor.img;
      name = actor.name;
    }
    if (token) {
      img = token.img;
      name = token.name;
    }
    return {
      actorUuid: actor?.uuid || target.actorUuid,
      img: img || target?.img || systemPath("icons/documents/character.svg"),
      name: name || target?.name,
      tokenUuid: token?.uuid || target.tokenUuid,
    };
  }

  /** @inheritDoc */
  static CHAT_TEMPLATE = "teriock/ui/roll";

  /**
   * Default roll options.
   * @returns {Partial<Teriock.Dice.BaseRollOptions>}
   */
  static get defaultOptions() {
    return {
      comparison: "gte",
      hideRoll: false,
      styles: { dice: { classes: [], icon: "", tooltip: "" }, total: { classes: [], icon: "", tooltip: "" } },
      targets: [],
      threshold: null,
    };
  }

  /**
   * A value the formula evaluates to.
   * @param {string} formula
   * @param {object} data
   * @param {Partial<Teriock.Dice.BaseRollOptions>} options
   * @returns {Promise<number>}
   */
  static async getValue(formula, data, options = {}) {
    const roll = new BaseRoll(formula, data, options);
    try {
      await roll.evaluate({ allowStrings: true });
      return roll.total;
    } catch (err) {
      console.log("Roll was unable to evaluate", err);
      return 0;
    }
  }

  /**
   * Maximum value formula evaluates to.
   * @param {string} formula
   * @param {object} data
   * @param {Partial<Teriock.Dice.BaseRollOptions>} options
   * @returns {number}
   */
  static maxValue(formula, data = {}, options = {}) {
    const roll = new BaseRoll(`${formula} + 0`, data, options);
    return roll.evaluateSync({ allowStrings: true, maximize: true, strict: false }).total;
  }

  /**
   * Mean value formula evaluates to.
   * @param {string} formula
   * @param {object} data
   * @param {Partial<Teriock.Dice.BaseRollOptions>} options
   * @returns {number}
   */
  static meanValue(formula, data = {}, options = {}) {
    const maxValue = this.maxValue(formula, data, options);
    const minValue = this.minValue(formula, data, options);
    return (maxValue + minValue) / 2;
  }

  /**
   * Minimum value formula evaluates to.
   * @param {string} formula
   * @param {object} data
   * @param {Partial<Teriock.Dice.BaseRollOptions>} options
   * @returns {number}
   */
  static minValue(formula, data = {}, options = {}) {
    const roll = new BaseRoll(`${formula} + 0`, data, options);
    return roll.evaluateSync({ allowStrings: true, minimize: true, strict: false }).total;
  }

  /**
   * Parse an event into usable roll or execution options.
   * @param {PointerEvent} event
   * @returns {object}
   */
  static parseEvent(event) {
    return { showDialog: game.settings.get("teriock", "showRollDialogs") ? event.button !== 2 : event.button === 2 };
  }

  /**
   * Check if a formula evaluates to a truthy or falsy value.
   * @param {Teriock.System.FormulaString} formula
   * @param {object} data
   * @returns {boolean}
   */
  static qualify(formula, data = {}) {
    if (formula === "1") { return true; }
    if (formula === "0") { return false; }
    if (formula === "") { return false; }
    return Boolean(this.minValue(formula, data));
  }

  /**
   * Reset all rolls recursively.
   * @param {BaseRoll} roll
   */
  static resetFormulas(roll) {
    for (const term of roll.terms) {
      if (term?.rolls) { term.rolls.forEach(r => this.resetFormulas(r)); }
      if (term?.isBooster) { term.result = term.rolls[0].total; }
    }
    roll.resetFormula();
    roll._total = roll._evaluateTotal();
  }

  /**
   * @param {Teriock.System.FormulaString} formula
   * @param {object} data
   * @param {Partial<Teriock.Dice.BaseRollOptions>} options
   */
  constructor(formula, data, options = {}) {
    if (!formula) { formula = "0"; }
    options = foundry.utils.mergeObject(new.target.defaultOptions, options);
    options.targets = options.targets.map(t => BaseRoll.#parseTarget(t));
    super(formula, data, options);
    this.id = foundry.utils.randomID();
  }

  /** `
   * All terms.
   * @returns {RollTerm[]}
   */
  get _allTerms() {
    const terms = [...this.terms];
    for (const t of /** @type {(ParentheticalTerm|Booster)[]} */ this.terms) {
      if (t.roll && t.roll instanceof Roll) { terms.push(...t.roll.terms); }
      if (t.rolls) {
        for (const r of t.rolls) { if (r instanceof Roll) { terms.push(...r.terms); } }
      }
    }
    return terms;
  }

  /**
   * Whether this threshold has not been met.
   * @returns {boolean}
   */
  get failure() {
    return this.hasThreshold && !this.success;
  }

  /**
   * Whether this has a threshold.
   * @returns {boolean}
   */
  get hasThreshold() {
    return typeof this.threshold === "number";
  }

  /**
   * Whether this threshold has been met.
   * @returns {boolean}
   */
  get success() {
    if (this.hasThreshold) {
      const comparisonFormula = `${this.options.comparison}(${this.total}, ${this.threshold})`;
      const comparisonRoll = new BaseRoll(comparisonFormula, {});
      comparisonRoll.evaluateSync();
      return Boolean(comparisonRoll.total);
    }
    return false;
  }

  /** @returns {number|null} */
  get threshold() {
    if (["number", "string"].includes(typeof this.options.threshold)) {
      if (typeof this.options.threshold === "string" && !this.options.threshold) { return null; }
      const th = Number(this.options.threshold);
      if (Number.isNumeric(th)) { return th; }
    }
    return null;
  }

  /** @param {number} threshold */
  set threshold(threshold) {
    this.options.threshold = threshold;
  }

  /**
   * Apply additional options based on the damage type. This allows for styled Dice So Nice integration.
   */
  async _applyDiceStyles() {
    for (const die of this.dice) {
      for (const [type, stat] of Object.entries(TERIOCK.config.stat)) {
        if (stat?.style && die.flavor.includes(type)) { die.options.appearance = stat.style; }
      }
    }
  }

  /**
   * Context menu entries for the roll formula.
   * @param {Teriock.Dice.RollContextMenuConfig} [config]
   * @returns {ContextMenuEntry[]}
   */
  _getFormulaContextOptions(config = {}) {
    return [{
      icon: makeIcon(TERIOCK.display.icons.roll.reroll, "contextMenu"),
      label: "TERIOCK.ROLLS.Base.reroll",
      onClick: async () => {
        const newRoll = this.clone();
        await newRoll.evaluate();
        await newRoll.toMessage(config.messageData ?? { speaker: TeriockChatMessage.getSpeaker() });
      },
    }];
  }

  /**
   * Context menu entries for the roll total.
   * @param {Teriock.Dice.RollContextMenuConfig} [_config]
   * @returns {ContextMenuEntry[]}
   */
  _getTotalContextOptions(_config = {}) {
    return [];
  }

  /** @inheritDoc */
  async _prepareChatRenderContext(options = {}) {
    const context = await super._prepareChatRenderContext(options);
    Object.assign(context, {
      hasThreshold: this.hasThreshold,
      hideRoll: this.options.hideRoll,
      id: this.id,
      styles: foundry.utils.deepClone(this.options.styles),
      targets: this.options.targets,
      threshold: this.threshold,
    });
    if (this.success) {
      context.styles.total.classes.push("success");
      context.styles.total.tooltip += _loc("TERIOCK.ROLLS.Base.success");
      context.styles.total.icon = TERIOCK.display.icons.ui.enable;
    } else if (this.failure) {
      context.styles.total.classes.push("failure");
      context.styles.total.tooltip += _loc("TERIOCK.ROLLS.Base.failure");
      context.styles.total.icon = TERIOCK.display.icons.ui.disable;
    }
    return context;
  }

  /**
   * Boost this roll in place.
   * @param {object} [options]
   * @returns {Promise<BaseRoll>}
   */
  async boost(options = {}) {
    const clone = this.clone({ evaluated: true });
    const formula = clone.formula;
    if (!clone._evaluated) { await clone.evaluate(); }
    const die = selectWeightedMaxFaceDie(clone);
    die._number = (die.number ?? 0) + 1;
    const dieRoll = new BaseRoll(die.formula);
    await dieRoll.evaluate();
    die.results.push(dieRoll.dice[0].results.at(-1));
    BaseRoll.resetFormulas(clone);
    return this.constructor.fromTerms(
      [new Booster({ fn: "b", result: clone.total, rolls: [clone], terms: [formula] })],
      options,
    );
  }

  /**
   * @inheritDoc
   * @param {object} [options]
   * @param {boolean} [options.evaluated]
   * @returns {BaseRoll}
   */
  clone(options = {}) {
    const { evaluated } = options;
    if (evaluated) { return this.constructor.fromData(foundry.utils.deepClone(this.toJSON())); }
    return super.clone();
  }

  /**
   * Deboost this roll in place.
   * @param {object} [options]
   * @returns {Promise<BaseRoll>}
   */
  async deboost(options = {}) {
    const clone = this.clone({ evaluated: true });
    const formula = clone.formula;
    if (!clone._evaluated) { await clone.evaluate(); }
    const die = selectWeightedMaxFaceDie(clone);
    die._number = Math.max(0, (die.number ?? 0) - 1);
    die.results.pop();
    this.constructor.resetFormulas(clone);
    return this.constructor.fromTerms([
      new Booster({ fn: "db", result: clone.total, rolls: [clone], terms: [formula] }),
    ], options);
  }

  /** @inheritDoc */
  async evaluate(
    { allowInteractive = true, allowStrings = false, maximize = false, minimize = false, ...options } = {},
  ) {
    await this._applyDiceStyles();
    return super.evaluate({ allowInteractive, allowStrings, maximize, minimize, ...options });
  }

  /**
   * Activations that are created by this roll.
   * @returns {Promise<BaseActivation[]>}
   */
  async getActivations() {
    return [];
  }

  /**
   * Panels that are created by this roll.
   * @returns {Promise<Teriock.Panels.PanelParts[]>}
   */
  async getPanels() {
    return [];
  }

  /** @inheritDoc */
  async toMessage(messageData = {}, { create = true, messageMode } = {}) {
    const activations = await this.getActivations();
    const panels = await this.getPanels();
    messageData = foundry.utils.mergeObject({
      system: {
        activations: teriock.data.pseudoDocuments.abstract.BasePseudoDocument.toCollectionObject(activations),
        panels,
        tags: this.options?.tags,
      },
      type: "interactive",
    }, messageData);
    return super.toMessage(messageData, { create, messageMode });
  }
}
