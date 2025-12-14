import { addFormula } from "../../../helpers/formula.mjs";
import { attributePanel } from "../../../helpers/html.mjs";
import BaseExecution from "../../base-execution/base-execution.mjs";
import { ThresholdExecutionMixin } from "../../mixins/_module.mjs";

/**
 * @extends {BaseExecution}
 * @mixes ThresholdExecution
 */
export default class FeatSaveExecution extends ThresholdExecutionMixin(
  BaseExecution,
) {
  /**
   * @param {Teriock.Execution.FeatSaveExecutionOptions} options
   */
  constructor(
    options = /** @type {Teriock.Execution.FeatSaveExecutionOptions} */ {},
  ) {
    super(options);
    this.attribute = options.attribute;
    if (this.actor) {
      if (options.proficient === undefined) {
        this.proficient =
          this.actor.system.attributes[options.attribute].isProficient;
      }
      if (options.fluent === undefined) {
        this.fluent = this.actor.system.attributes[options.attribute].isFluent;
      }
      if (options.bonus === undefined) {
        this.bonus = this.actor.system.attributes[options.attribute].formula;
      }
    }
  }

  /** @type {Teriock.Parameters.Actor.Attribute} */
  attribute;

  /** @inheritDoc */
  get flavor() {
    let flavor = "";
    if (this.threshold !== undefined) {
      flavor += `DC ${this.threshold}`;
    }
    flavor += ` ${this.attribute.toUpperCase()} Feat Save`;
    return flavor;
  }

  /** @inheritDoc */
  async _buildPanels() {
    this.panels = [await attributePanel(this.attribute)];
  }

  /** @inheritDoc */
  async _prepareFormula() {
    await super._prepareFormula();
    this.formula = addFormula(this.formula, `@att.${this.attribute}`);
  }
}
