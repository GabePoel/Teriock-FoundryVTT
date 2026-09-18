import mathConfig from "../../../constants/config/math-config.mjs";
import BaseRoll from "../base-roll/base-roll.mjs";

class Threshold {
  /** @param {Partial<Teriock.Dice.ThresholdData>} data */
  constructor(data = {}) {
    Object.assign(this, data);
    if (!this.label) {
      if (this.level === -2) { this.label = "TERIOCK.ROLLS.Base.critFailure"; }
      if (this.level === -1) { this.label = "TERIOCK.ROLLS.Base.failure"; }
      if (this.level === 1) { this.label = "TERIOCK.ROLLS.Base.success"; }
      if (this.level === 2) { this.label = "TERIOCK.ROLLS.Base.critSuccess"; }
    }
  }

  /** @type {Teriock.Keys.Comparison} */
  comparison = "gt";

  /** @type {string} */
  label = "";

  /** @type {number} */
  level = 0;

  /** @type {Teriock.Dice.ThresholdTarget} */
  target;

  /** @type {"die"|"roll"} */
  type = "roll";

  /**
   * CSS classes for this Threshold.
   * @returns {string[]}
   */
  get classes() {
    if (this.level === -2) { return ["crit-failure", "failure"]; }
    if (this.level === -1) { return ["failure"]; }
    if (this.level === 1) { return ["success"]; }
    if (this.level === 2) { return ["crit-success", "success"]; }
    return [];
  }

  /**
   * An icon for this Threshold.
   * @returns {string|undefined}
   */
  get icon() {
    if (this.level <= -1) { return TERIOCK.display.icons.manifest.ui.disable; }
    if (this.level >= 1) { return TERIOCK.display.icons.manifest.ui.enable; }
  }

  /**
   * A tooltip for this Threshold.
   * @returns {string}
   */
  get tooltip() {
    return _loc(this.label);
  }

  /**
   * Check if a value passes this Threshold.
   * @param {ThresholdRoll} roll
   * @param {object} rollData
   * @returns {boolean}
   */
  check(roll, rollData = {}) {
    let total;
    let target = typeof this.target === "number" ? this.target : undefined;
    if (this.type === "die") {
      total = roll.dice[0]?.total;
      if (this.target === "max") { target = roll.dice[0]?.faces; }
      if (this.target === "min") { target = 1; }
    }
    if (this.type === "roll") {
      total = roll.total;
      if (this.target === "max") { target = BaseRoll.maxValue(roll.formula); }
      if (this.target === "min") { target = BaseRoll.minValue(roll.formula); }
    }
    if (typeof total !== "number" || typeof target !== "number") { return false; }
    return BaseRoll.qualify(`${this.comparison}(${total}, ${target})`, rollData);
  }
}

/** @inheritDoc */
export default class ThresholdRoll extends BaseRoll {
  /**
   * @inheritDoc
   * @returns {Teriock.Dice.ThresholdRollOptions}
   */
  static get defaultOptions() {
    return Object.assign(super.defaultOptions, {
      thresholds: [{ comparison: "eq", level: -2, target: 1, type: "die" }, {
        comparison: "eq",
        level: 2,
        target: 20,
        type: "die",
      }],
    });
  }

  /**
   * @inheritDoc
   * @param {PointerEvent} event
   * @returns {Teriock.Command.ThresholdOptions}
   */
  static parseEvent(event) {
    return Object.assign(super.parseEvent(event), {
      edge: Number(event?.altKey || false) - Number(event?.shiftKey || false),
    });
  }

  /**
   * Set Thresholds from some data.
   * @param {Partial<Teriock.Dice.ThresholdData>[]} thresholds
   * @returns {Threshold[]}
   */
  static parseThresholds(thresholds) {
    return thresholds.flatMap(({ inverse, ...data }) => {
      const parsed = [new Threshold(data)];
      if (inverse) {
        parsed.push(
          new Threshold({
            ...data,
            comparison: mathConfig.comparisons[data.comparison].inverse,
            label: "",
            level: -data.level,
          }),
        );
      }
      return parsed;
    });
  }

  constructor(formula, data, options = {}) {
    super(formula, data, options);
    this.thresholds = this.constructor.parseThresholds(this.options.thresholds ?? []);
  }

  /**
   * The Thresholds to check against.
   * @type {Threshold[]}
   */
  thresholds = [];

  /**
   * The most extreme Threshold that's met.
   * @returns {Threshold|null}
   */
  get metThreshold() {
    return [...this.thresholds].sort((a, b) => Math.abs(b.level) - Math.abs(a.level)).find(t => t.check(this)) ?? null;
  }

  /** @inheritDoc */
  get product() {
    return this.metThreshold?.level ?? 0;
  }

  /** @inheritDoc */
  async _prepareChatRenderContext(options = {}) {
    const context = await super._prepareChatRenderContext(options);
    if (!options.isPrivate) {
      const threshold = this.metThreshold;
      if (threshold) {
        context.styles.total.classes.push(...threshold.classes);
        context.styles.total.tooltip = threshold.tooltip;
        context.styles.total.icon = threshold.icon;
      }
    }
    return context;
  }
}
