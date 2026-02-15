import { systemPath } from "../../helpers/path.mjs";
import Booster from "../booster.mjs";
import { selectWeightedMaxFaceDie } from "../helpers.mjs";

const { Roll } = foundry.dice;

/** @inheritDoc */
export default class BaseRoll extends Roll {
  /** @inheritDoc */
  static CHAT_TEMPLATE = systemPath("templates/ui-templates/roll.hbs");

  /**
   * @param {string} formula
   * @param {object} data
   * @param {Teriock.Dice.RollOptions} options
   */
  constructor(formula, data, options = {}) {
    super(formula, data, options);
    /** @type {Teriock.Dice.RollOptions} */
    const userOptions = foundry.utils.mergeObject(
      {
        hideRoll: false,
        styles: {
          dice: {
            classes: "",
            tooltip: "",
            icon: "",
          },
          total: {
            classes: "",
            tooltip: "",
            icon: "",
          },
        },
        targets: [],
        threshold: null,
        comparison: "gte",
      },
      options,
    );
    this.id = foundry.utils.randomID();
    if (userOptions.threshold) {
      this.threshold = Number(userOptions.threshold);
    }
    this.styles = userOptions.styles;
    this.hideRoll = userOptions.hideRoll;
    this.comparison = userOptions.comparison;
    /** @type {Teriock.Dice.RollTarget[]} */
    this.targets = [];
    for (const target of userOptions.targets) {
      let img = "";
      let name = "";
      let rescale = false;
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
        actor = actor || token.actor;
      } else if (target.documentName === "Actor") {
        token = target.token;
        actor = actor || target;
      }
      // Prioritize name and image from the token over the actor
      if (actor) {
        img = actor.img;
        name = actor.name;
      }
      if (token) {
        img = token.imageLive;
        rescale = token.rescale;
        name = token.name;
      }
      this.targets.push({
        actorUuid: actor?.uuid || target?.actorUuid,
        img: img || target?.img || systemPath("icons/documents/character.svg"),
        name: name || target?.name,
        rescale: rescale || target?.rescale,
        tokenUuid: token?.uuid || target?.tokenUuid,
      });
    }
    options.targets = this.targets;
    this.options.targets = options.targets;
  }

  /**
   * A value the formula evaluates to.
   * @param {string} formula
   * @param {object} data
   * @param {Teriock.Dice.RollOptions} options
   * @returns {Promise<number>}
   */
  static async getValue(formula, data, options = {}) {
    const roll = new BaseRoll(formula, data, options);
    await roll.evaluate({ allowStrings: true });
    return roll.total;
  }

  /**
   * Minimum value formula evaluates to.
   * @param {string} formula
   * @param {object} data
   * @returns {number}
   */
  static maxValue(formula, data = {}) {
    const maxRoll = new BaseRoll(formula + " + 0", data);
    return maxRoll.evaluateSync({ allowStrings: true, maximize: true }).total;
  }

  /**
   * Mean value formula evaluates to.
   * @param {string} formula
   * @param {object} data
   * @returns {number}
   */
  static meanValue(formula, data = {}) {
    const maxValue = this.maxValue(formula, data);
    const minValue = this.minValue(formula, data);
    return (maxValue + minValue) / 2;
  }

  /**
   * Maximum value formula evaluates to.
   * @param {string} formula
   * @param {object} data
   * @returns {number}
   */
  static minValue(formula, data = {}) {
    const minRoll = new BaseRoll(formula + " + 0", data);
    return minRoll.evaluateSync({ allowStrings: true, minimize: true }).total;
  }

  /**
   * Parse an event into usable roll or execution options.
   * @param {PointerEvent} _event
   * @returns {object}
   */
  static parseEvent(_event) {
    return {};
  }

  /**
   * Reset all rolls recursively.
   * @param {BaseRoll} roll
   */
  static resetFormulas(roll) {
    for (const term of roll.terms) {
      if (term?.rolls) {
        term.rolls.forEach((r) => {
          this.resetFormulas(r);
        });
      }
      if (term?.isBooster) {
        term.result = term.rolls[0].total;
      }
    }
    roll.resetFormula();
    roll._total = roll._evaluateTotal();
  }

  /**
   * Whether this threshold has been met.
   * @returns {null|boolean}
   */
  get success() {
    if (typeof this.threshold === "number") {
      const comparisonFormula = `${this.comparison}(${this.total}, ${this.threshold})`;
      const comparisonRoll = new BaseRoll(comparisonFormula, {});
      comparisonRoll.evaluateSync();
      return Boolean(comparisonRoll.total);
    }
    return null;
  }

  /**
   * Apply additional options based on damage type. This allows for styled Dice So Nice integration.
   */
  #applyDiceStyles() {
    for (const die of this.dice) {
      for (const [type, options] of Object.entries(
        TERIOCK.options.die.styles,
      )) {
        if (die.flavor.includes(type)) {
          die.options.appearance = options;
        }
      }
    }
  }

  /** @inheritDoc */
  async _prepareChatRenderContext(options = {}) {
    const context = await super._prepareChatRenderContext(options);
    context.targets = this.targets;
    context.threshold = this.threshold;
    context.hasThreshold = typeof this.threshold === "number";
    context.styles = this.styles;
    context.hideRoll = this.hideRoll;
    context.id = this.id;
    if (context.hasThreshold) {
      if (this.success) {
        context.styles.total.classes += " success";
        context.styles.total.tooltip += "Success";
        context.styles.total.icon = "check";
      } else {
        context.styles.total.classes += " failure";
        context.styles.total.tooltip += "Failure";
        context.styles.total.icon = "xmark";
      }
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
    if (!clone._evaluated) {
      await clone.evaluate();
    }
    const die = selectWeightedMaxFaceDie(clone.dice);
    die._number += 1;
    const dieRoll = new BaseRoll(die.formula);
    await dieRoll.evaluate();
    die.results.push(dieRoll.dice[0].results.at(-1));
    BaseRoll.resetFormulas(clone);
    return /** @type {BaseRoll} */ BaseRoll.fromTerms(
      [
        new Booster({
          fn: "b",
          terms: [formula],
          rolls: [clone],
          result: clone.total,
        }),
      ],
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
    if (evaluated) {
      return /** @type {BaseRoll} */ BaseRoll.fromData(
        foundry.utils.deepClone(this.toJSON()),
      );
    }
    return /** @type {BaseRoll} */ super.clone();
  }

  /**
   * Deboost this roll in place.
   * @param {object} [options]
   * @returns {Promise<BaseRoll>}
   */
  async deboost(options = {}) {
    const clone = this.clone({ evaluated: true });
    const formula = clone.formula;
    if (!clone._evaluated) {
      await clone.evaluate();
    }
    const die = selectWeightedMaxFaceDie(clone.dice);
    die._number = Math.max(0, die._number - 1);
    die.results.pop();
    BaseRoll.resetFormulas(clone);
    return /** @type {BaseRoll} */ BaseRoll.fromTerms(
      [
        new Booster({
          fn: "db",
          terms: [formula],
          rolls: [clone],
          result: clone.total,
        }),
      ],
      options,
    );
  }

  /** @inheritDoc */
  async evaluate({
    minimize = false,
    maximize = false,
    allowStrings = false,
    allowInteractive = true,
    ...options
  } = {}) {
    this.#applyDiceStyles();
    return super.evaluate({
      minimize,
      maximize,
      allowStrings,
      allowInteractive,
      ...options,
    });
  }
}
