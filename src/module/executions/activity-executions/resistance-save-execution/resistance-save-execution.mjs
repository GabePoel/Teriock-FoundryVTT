import { UseLocalHandler } from "../../../helpers/interaction/button-handlers/simple-command-handlers.mjs";
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
    if (options.threshold === undefined) {
      this.threshold = 10;
    }
    this.image =
      options.image ||
      (this.hex
        ? getImage("effect-types", "Hexproof")
        : getImage("effect-types", "Resistance"));
    this.rule = this.hex ? "hexproof" : "resistance";
    this.LABEL = "Resistance";
  }

  /** @inheritDoc */
  get flavor() {
    return game.i18n.localize("TERIOCK.ROLLS.Resist.label");
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.display.icons.effect.protection;
  }

  /** @inheritDoc */
  get name() {
    if (this.hex) {
      return game.i18n.localize("TERIOCK.TERMS.Protections.hexproof.single");
    }
    return game.i18n.localize("TERIOCK.TERMS.Protections.resistance.single");
  }

  /** @inheritDoc */
  async _buildButtons() {
    this.buttons.push(UseLocalHandler.buildButton("resist", "ability"));
  }

  /** @inheritDoc */
  _determineCompetence(options) {
    this.competence.raw = 1;
    super._determineCompetence(options);
  }
}
