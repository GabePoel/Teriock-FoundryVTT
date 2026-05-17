import { getImage } from "../../../helpers/path.mjs";
import { ruleUuid } from "../../../helpers/resolve.mjs";
import { ThresholdExecutionMixin } from "../../mixins/_module.mjs";
import ImmunityExecution from "../immunity-execution/immunity-execution.mjs";

/**
 * @extends {BaseExecution}
 * @mixes ThresholdExecution
 */
export default class ResistanceExecution extends ThresholdExecutionMixin(ImmunityExecution) {
  /**
   * @param {Teriock.Execution.ResistanceExecutionOptions} options
   */
  constructor(options = {}) {
    super(options);
    if (options.threshold === undefined) this.threshold = 10;
    this.img =
      options.img || (this.hex ? getImage("effect-types", "Hexproof") : getImage("effect-types", "Resistance"));
    this.rule = this.hex ? "hexproof" : "resistance";
    this.LABEL = "Resistance";
  }

  /** @inheritDoc */
  get chatData() {
    return foundry.utils.mergeObject(super.chatData, {
      system: {
        _src: ruleUuid("Keyword", this.hex ? "Hexproof" : "Resistance"),
      },
    });
  }

  /** @inheritDoc */
  get flavor() {
    return _loc("TERIOCK.ROLLS.Resist.label");
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.display.icons.effect.protection;
  }

  /** @inheritDoc */
  get name() {
    if (this.hex) {
      return _loc("TERIOCK.TERMS.Protections.hexproof.single");
    }
    return _loc("TERIOCK.TERMS.Protections.resistance.single");
  }

  /** @inheritDoc */
  async _buildActivations() {
    this.activations.push(
      new teriock.data.pseudoDocuments.activations.UseLocalActivation({
        options: { lookup: "ability:resist" },
      }),
    );
  }

  /** @inheritDoc */
  _determineCompetence(options) {
    this.competence.raw = 1;
    super._determineCompetence(options);
  }
}
