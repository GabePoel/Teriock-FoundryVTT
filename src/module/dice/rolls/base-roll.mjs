import { TeriockContextMenu } from "../../applications/ux/_module.mjs";
import { TeriockChatMessage } from "../../documents/_module.mjs";
import { systemPath } from "../../helpers/path.mjs";
import { makeIcon } from "../../helpers/utils.mjs";
import Booster from "../booster.mjs";
import { selectWeightedMaxFaceDie } from "../helpers.mjs";

const { Roll } = foundry.dice;

/**
 * @inheritDoc
 * @property {ID<BaseRoll>} id
 * @property {Teriock.Dice.BaseRollOptions} options
 */
export default class BaseRoll extends Roll {
  /** @inheritDoc */
  static CHAT_TEMPLATE = "teriock/ui/roll";

  /**
   * @param {Teriock.System.FormulaString} formula
   * @param {object} data
   * @param {Partial<Teriock.Dice.BaseRollOptions>} options
   */
  constructor(formula, data, options = {}) {
    super(formula, data, options);
    this.options = foundry.utils.mergeObject(
      this.constructor.defaultOptions,
      options,
    );

    // If we don't do this, then the targets will be raw classes instead of JSON parsable objects
    this.targets = this.options.targets;

    // Ensure roll has an ID that can be referenced in chat messages
    if (this.options._id && this.options.keepId) {
      delete this.options.keepId;
      this._id = this.options._id;
    } else {
      this._id = foundry.utils.randomID();
    }
  }

  /**
   * Default roll options.
   * @returns {Partial<Teriock.Dice.BaseRollOptions>}
   */
  static get defaultOptions() {
    return {
      hideRoll: false,
      styles: {
        dice: { classes: "", tooltip: "", icon: "" },
        total: { classes: "", tooltip: "", icon: "" },
      },
      targets: [],
      threshold: null,
      comparison: "gte",
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
    await roll.evaluate({ allowStrings: true });
    return roll.total;
  }

  /**
   * Minimum value formula evaluates to.
   * @param {string} formula
   * @param {object} data
   * @param {Partial<Teriock.Dice.BaseRollOptions>} options
   * @returns {number}
   */
  static maxValue(formula, data = {}, options = {}) {
    const maxRoll = new BaseRoll(formula + " + 0", data, options);
    return maxRoll.evaluateSync({ allowStrings: true, maximize: true }).total;
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
   * Maximum value formula evaluates to.
   * @param {string} formula
   * @param {object} data
   * @param {Partial<Teriock.Dice.BaseRollOptions>} options
   * @returns {number}
   */
  static minValue(formula, data = {}, options = {}) {
    const minRoll = new BaseRoll(formula + " + 0", data, options);
    return minRoll.evaluateSync({ allowStrings: true, minimize: true }).total;
  }

  /**
   * Parse an event into usable roll or execution options.
   * @param {PointerEvent} event
   * @returns {object}
   */
  static parseEvent(event) {
    return {
      showDialog: game.teriock.getSetting("showRollDialogs")
        ? event.button !== 2
        : event.button === 2,
    };
  }

  /**
   * Reset all rolls recursively.
   * @param {BaseRoll} roll
   */
  static resetFormulas(roll) {
    for (const term of roll.terms) {
      if (term?.rolls) term.rolls.forEach((r) => this.resetFormulas(r));
      if (term?.isBooster) term.result = term.rolls[0].total;
    }
    roll.resetFormula();
    roll._total = roll._evaluateTotal();
  }

  /**
   * All terms.
   * @returns {RollTerm[]}
   */
  get _allTerms() {
    const terms = [...this.terms];
    for (const t of /** @type {(ParentheticalTerm|Booster)[]} */ this.terms) {
      if (t.roll && t.roll instanceof Roll) terms.push(...t.roll.terms);
      if (t.rolls) {
        for (const r of t.rolls) {
          if (r instanceof Roll) terms.push(...r.terms);
        }
      }
    }
    return terms;
  }

  /** @returns {Teriock.Fields.ComparisonCheck} */
  get comparison() {
    return this.options.comparison ?? "gte";
  }

  /** @param {Teriock.Fields.ComparisonCheck} comparison */
  set comparison(comparison) {
    this.options.comparison = comparison;
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

  /** @returns {boolean} */
  get hideRoll() {
    return this.options.hideRoll ?? false;
  }

  /** @param {boolean} hideRoll */
  set hideRoll(hideRoll) {
    this.options.hideRoll = !!hideRoll;
  }

  /**
   * The ID for this roll.
   * @returns {UUID<BaseRoll>}
   */
  get id() {
    return this._id;
  }

  /** @returns {Teriock.Dice.DieStyles} */
  get styles() {
    return foundry.utils.deepClone(
      this.options.styles ?? this.constructor.defaultOptions.styles,
    );
  }

  /**
   * Whether this threshold has been met.
   * @returns {boolean}
   */
  get success() {
    if (this.hasThreshold) {
      const comparisonFormula = `${this.comparison}(${this.total}, ${this.threshold})`;
      const comparisonRoll = new BaseRoll(comparisonFormula, {});
      comparisonRoll.evaluateSync();
      return Boolean(comparisonRoll.total);
    }
    return false;
  }

  /** @returns {Teriock.Dice.DieTarget[]} */
  get targets() {
    return this.options.targets ?? [];
  }

  /** @param {Teriock.Dice.RawDieTarget[]} targets */
  set targets(targets) {
    this.options.targets = targets.map((t) => this.#parseTarget(t));
  }

  /** @returns {number|null} */
  get threshold() {
    if (["number"].includes(typeof this.options.threshold)) {
      if (
        typeof this.options.threshold === "string" &&
        !this.options.threshold
      ) {
        return null;
      }
      const th = Number(this.options.threshold);
      if (Number.isNumeric(th)) return th;
    }
    return null;
  }

  /** @param {number} threshold */
  set threshold(threshold) {
    this.options.threshold = threshold;
  }

  /**
   * @param {Teriock.Dice.RawDieTarget} target
   * @returns {Teriock.Dice.DieTarget}
   */
  #parseTarget(target) {
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
    return {
      actorUuid: actor?.uuid || target.actorUuid,
      img: img || target?.img || systemPath("icons/documents/character.svg"),
      name: name || target?.name,
      rescale: rescale || target?.rescale,
      tokenUuid: token?.uuid || target.tokenUuid,
    };
  }

  /**
   * Apply additional options based on the damage type. This allows for styled Dice So Nice integration.
   */
  async _applyDiceStyles() {
    for (const die of this.dice) {
      for (const [type, options] of Object.entries(TERIOCK.config.die.styles)) {
        if (die.flavor.includes(type)) die.options.appearance = options;
      }
    }
  }

  /**
   * Context menu entries for the roll formula.
   * @param {object} [options]
   * @returns {ContextMenuEntry[]}
   */
  _getFormulaContextOptions(options = {}) {
    return [
      {
        label: _loc("TERIOCK.ROLLS.Base.reroll"),
        icon: makeIcon(TERIOCK.display.icons.roll.reroll, "contextMenu"),
        onClick: async () => {
          const reroll = this.clone();
          await reroll.evaluate();
          await reroll.toMessage(
            options.messageData ?? { speaker: TeriockChatMessage.getSpeaker() },
          );
        },
      },
    ];
  }

  /**
   * Context menu entries for the roll total.
   * @param {object} [_options]
   * @returns {ContextMenuEntry[]}
   */
  _getTotalContextOptions(_options = {}) {
    return [];
  }

  /** @inheritDoc */
  async _prepareChatRenderContext(options = {}) {
    const context = await super._prepareChatRenderContext(options);
    Object.assign(context, {
      targets: this.targets,
      threshold: this.threshold,
      hasThreshold: this.hasThreshold,
      styles: this.styles,
      hideRoll: this.hideRoll,
      id: this.id,
    });
    if (this.success) {
      context.styles.total.classes += " success";
      context.styles.total.tooltip += _loc("TERIOCK.ROLLS.Base.success");
      context.styles.total.icon = TERIOCK.display.icons.ui.enable;
    } else if (this.failure) {
      context.styles.total.classes += " failure";
      context.styles.total.tooltip += _loc("TERIOCK.ROLLS.Base.failure");
      context.styles.total.icon = TERIOCK.display.icons.ui.disable;
    }
    return context;
  }

  /**
   * Bind context menu entries to some HTML element.
   * @param {HTMLElement} element
   * @param {object} [options]
   */
  bindContextMenus(element, options = {}) {
    new TeriockContextMenu(
      element,
      `.dice-formula[data-id="${this.id}"]`,
      this._getFormulaContextOptions(options),
      {
        fixed: false,
        jQuery: false,
      },
    );
    new TeriockContextMenu(
      element,
      `.dice-total[data-id="${this.id}"]`,
      this._getTotalContextOptions(options),
      {
        fixed: false,
        jQuery: false,
      },
    );
  }

  /**
   * Boost this roll in place.
   * @param {object} [options]
   * @returns {Promise<BaseRoll>}
   */
  async boost(options = {}) {
    const clone = this.clone({ evaluated: true });
    const formula = clone.formula;
    if (!clone._evaluated) await clone.evaluate();
    const die = selectWeightedMaxFaceDie(clone.dice);
    die._number += 1;
    const dieRoll = new BaseRoll(die.formula);
    await dieRoll.evaluate();
    die.results.push(dieRoll.dice[0].results.at(-1));
    BaseRoll.resetFormulas(clone);
    return this.constructor.fromTerms(
      [
        new Booster({
          fn: "b",
          result: clone.total,
          rolls: [clone],
          terms: [formula],
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
      return this.constructor.fromData(foundry.utils.deepClone(this.toJSON()));
    }
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
    if (!clone._evaluated) await clone.evaluate();
    const die = selectWeightedMaxFaceDie(clone.dice);
    die._number = Math.max(0, die._number - 1);
    die.results.pop();
    this.constructor.resetFormulas(clone);
    return this.constructor.fromTerms(
      [
        new Booster({
          fn: "db",
          result: clone.total,
          rolls: [clone],
          terms: [formula],
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
    await this._applyDiceStyles();
    return super.evaluate({
      minimize,
      maximize,
      allowStrings,
      allowInteractive,
      ...options,
    });
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
   * @returns {Promise<Teriock.Messages.MessagePanel[]>}
   */
  async getPanels() {
    return [];
  }

  /** @inheritDoc */
  async toMessage(messageData = {}, { rollMode, create = true } = {}) {
    const activations = await this.getActivations();
    const panels = await this.getPanels();
    messageData = foundry.utils.mergeObject(
      {
        system: {
          panels: panels,
          activations:
            teriock.data.pseudoDocuments.abstract.PseudoDocument.toCollectionObject(
              activations,
            ),
        },
      },
      messageData,
    );
    return super.toMessage(messageData, { rollMode, create });
  }
}
