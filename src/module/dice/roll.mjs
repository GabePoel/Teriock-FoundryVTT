import { systemPath } from "../helpers/path.mjs";

const { Roll } = foundry.dice;

/** @inheritDoc */
export default class TeriockRoll extends Roll {
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
    this.threshold = userOptions.threshold;
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
   * Minimum value formula evaluates to.
   * @param {string} formula
   * @param {object} data
   * @returns {number}
   */
  static maxValue(formula, data = {}) {
    const maxRoll = new TeriockRoll(formula + " + 0", data);
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
    const minRoll = new TeriockRoll(formula + " + 0", data);
    return minRoll.evaluateSync({ allowStrings: true, minimize: true }).total;
  }

  /**
   * Whether this threshold has been met.
   * @returns {null|boolean}
   */
  get success() {
    if (typeof this.threshold === "number") {
      const comparisonFormula = `${this.comparison}(${this.total}, ${this.threshold})`;
      const comparisonRoll = new TeriockRoll(comparisonFormula, {});
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
