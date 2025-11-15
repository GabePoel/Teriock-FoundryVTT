import { TeriockTextEditor } from "../../../applications/ux/_module.mjs";
import { getImage } from "../../../helpers/path.mjs";
import { toTitleCase } from "../../../helpers/string.mjs";
import BaseExecution from "../../base-execution/base-execution.mjs";

export default class ImmunityExecution extends BaseExecution {
  /**
   * @param {Teriock.Execution.ImmunityExecutionOptions} options
   */
  constructor(options = {}) {
    super(options);
    this.hex = options.hex;
    this.wrappers = options.wrappers || [];
    this.wrappers.push(this.hex ? "Chosen" : "Automatic");
    this.image =
      options.image ||
      (this.hex
        ? getImage("effect-types", "Hexseal")
        : getImage("effect-types", "Immunity"));
    this.rule = this.hex ? "hexseal" : "immunity";
    this.label = "Immunity";
  }

  /** @inheritDoc */
  async _buildPanels() {
    this.panels.push({
      image: this.image,
      name: toTitleCase(this.rule),
      bars: [
        {
          icon: "fa-shield",
          label: this.label,
          wrappers: this.wrappers,
        },
      ],
      blocks: [
        {
          title: toTitleCase(this.rule),
          text: TERIOCK.content.keywords[this.rule],
        },
      ],
      icon: "shield-halved",
      label: "Protection",
    });
    await TeriockTextEditor.enrichPanels(this.panels);
  }
}
