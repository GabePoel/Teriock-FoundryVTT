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
    if (this.actor && options.bonus === undefined) {
      this.bonus = this.actor.system.attributes[options.attribute].formula;
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

  /**
   * @inheritDoc
   * @param {Teriock.Execution.FeatSaveExecutionOptions} options
   */
  _determineCompetence(options) {
    if (!this.actor) return;
    if (options.proficient === undefined) {
      this.proficient =
        this.actor.system.attributes[options.attribute].competence.proficient;
    }
    if (options.fluent === undefined) {
      this.fluent =
        this.actor.system.attributes[options.attribute].competence.fluent;
    }
  }
}
