import { TeriockTextEditor } from "../../../applications/ux/_module.mjs";
import { getIcon } from "../../../helpers/path.mjs";
import BaseExecution from "../../base-execution/base-execution.mjs";
import { ThresholdExecutionMixin } from "../../mixins/_module.mjs";

/**
 * @extends {BaseExecution}
 * @mixes ThresholdExecution
 */
export default class ResistanceSaveExecution extends ThresholdExecutionMixin(
  BaseExecution,
) {
  /**
   * @param {Teriock.Execution.ResistanceExecutionOptions} options
   */
  constructor(options) {
    super(options);
    this.image = options.image || getIcon("effect-types", "Resistance");
    this.wrappers = options.wrappers;
    this.wrappers.push("Automatic");
    if (options.proficient === undefined) {
      this.proficient = true;
    }
    if (options.threshold === undefined) {
      this.threshold = 10;
    }
  }

  /** @inheritDoc */
  get flavor() {
    return "Resistance Save";
  }

  /** @inheritDoc */
  async _buildPanels() {
    this.panels.push({
      image: this.image,
      name: "Resistance",
      bars: [
        {
          icon: "fa-shield",
          label: "Resistance",
          wrappers: this.wrappers,
        },
      ],
      blocks: [
        {
          title: "Resistance",
          text: TERIOCK.content.keywords.resistance,
        },
      ],
      icon: "shield-halved",
      label: "Protection",
    });
    await TeriockTextEditor.enrichPanels(this.panels);
  }
}
