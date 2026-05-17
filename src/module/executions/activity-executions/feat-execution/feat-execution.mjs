import { addFormula } from "../../../helpers/formula.mjs";
import { attributePanel } from "../../../helpers/panel.mjs";
import { ruleUuid } from "../../../helpers/resolve.mjs";
import BaseExecution from "../../base-execution/base-execution.mjs";
import { ThresholdExecutionMixin } from "../../mixins/_module.mjs";

/**
 * @extends {BaseExecution}
 * @mixes ThresholdExecution
 */
export default class FeatExecution extends ThresholdExecutionMixin(BaseExecution) {
  /**
   * @param {Partial<Teriock.Execution.FeatExecutionOptions>} options
   */
  constructor(options = {}) {
    super(options);
    this.attribute = options.attribute;
    if (this.actor) {
      this.bonus = addFormula(this.actor.system.attributes[options.attribute].formula, this.bonus);
    }
  }

  /** @type {Teriock.Keys.Attribute} */
  attribute;

  /** @inheritDoc */
  get chatData() {
    return foundry.utils.mergeObject(super.chatData, {
      system: {
        _src: ruleUuid("Core", TERIOCK.config.attribute[this.attribute].page),
      },
    });
  }

  /** @inheritDoc */
  get executionNames() {
    return [...super.executionNames, "Feat"];
  }

  /** @inheritDoc */
  get flavor() {
    if (this.threshold !== undefined) {
      return _loc("TERIOCK.ROLLS.Feat.thresholded", {
        threshold: this.threshold,
        value: this.attribute.toUpperCase(),
      });
    } else {
      return _loc("TERIOCK.ROLLS.Feat.unthresholded", {
        value: this.attribute.toUpperCase(),
      });
    }
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.display.icons.attribute[this.attribute];
  }

  /** @inheritDoc */
  get name() {
    return _loc("TERIOCK.ROLLS.Feat.name", {
      value: TERIOCK.reference.attributesFull[this.attribute],
    });
  }

  /** @inheritDoc */
  async _buildActivations() {
    const impactByAttribute = { per: "perceive", snk: "hide" };
    const impact = impactByAttribute[this.attribute];
    const amount = this.rolls[0]?.total;
    if (impact && Number.isFinite(amount)) {
      this.activations.push(
        new teriock.data.pseudoDocuments.activations.TakeActivation({
          impact,
          amount,
        }),
      );
    }
  }

  /** @inheritDoc */
  async _buildPanels() {
    this.panels = [await attributePanel(this.attribute)];
  }

  /**
   * @inheritDoc
   * @param {Teriock.Execution.FeatExecutionOptions} options
   */
  _determineCompetence(options) {
    if (this.actor) {
      this.competence.raw = this.actor.system.attributes[options.attribute].competence.value;
    }
    super._determineCompetence(options);
  }
}
