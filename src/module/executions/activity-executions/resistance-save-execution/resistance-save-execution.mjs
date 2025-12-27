import { UseAbilityHandler } from "../../../helpers/interaction/button-handlers/simple-command-handlers.mjs";
import { getImage } from "../../../helpers/path.mjs";
import { ThresholdExecutionMixin } from "../../mixins/_module.mjs";
import ImmunityExecution from "../immunity-execution/immunity-execution.mjs";

/**
 * @extends {BaseExecution}
 * @mixes ThresholdExecution
 */
export default class ResistanceSaveExecution extends ThresholdExecutionMixin(
  ImmunityExecution,
) {
  /**
   * @param {Teriock.Execution.ResistanceExecutionOptions} options
   */
  constructor(options = {}) {
    super(options);
    if (options.proficient === undefined) {
      this.proficient = true;
    }
    if (options.threshold === undefined) {
      this.threshold = 10;
    }
    this.image =
      options.image ||
      (this.hex
        ? getImage("effect-types", "Hexproof")
        : getImage("effect-types", "Resistance"));
    this.rule = this.hex ? "hexproof" : "resistance";
    this.label = "Resistance";
  }

  /** @inheritDoc */
  get flavor() {
    return "Resistance Save";
  }

  /** @inheritDoc */
  async _buildButtons() {
    this.buttons.push(UseAbilityHandler.buildButton("Resist"));
  }
}
