import { TeriockTextEditor } from "../../../applications/ux/_module.mjs";
import { getImage } from "../../../helpers/path.mjs";
import BaseExecution from "../../base-execution/base-execution.mjs";

export default class ImmunityExecution extends BaseExecution {
  /**
   * @param {Teriock.Execution.ImmunityExecutionOptions} options
   */
  constructor(options = {}) {
    super(options);
    this.hex = options.hex;
    this.wrappers = options.wrappers || [];
    this.wrappers.push(
      this.hex
        ? game.i18n.localize("TERIOCK.TERMS.Common.chosen")
        : game.i18n.localize("TERIOCK.TERMS.Common.automatic"),
    );
    this.image =
      options.image ||
      (this.hex
        ? getImage("effect-types", "Hexseal")
        : getImage("effect-types", "Immunity"));
    this.rule = this.hex ? "hexseal" : "immunity";
    this.LABEL = "Immunity";
  }

  /** @inheritDoc */
  get flavor() {
    return this.name;
  }

  /** @inheritDoc */
  get name() {
    if (this.hex) {
      return game.i18n.localize("TERIOCK.TERMS.Protections.hexseal.single");
    }
    return game.i18n.localize("TERIOCK.TERMS.Protections.immunity.single");
  }

  /** @inheritDoc */
  async _buildPanels() {
    this.panels.push({
      image: this.image,
      name: this.name,
      bars: [
        {
          icon: TERIOCK.display.icons.effect.immune,
          label: game.i18n.localize("TERIOCK.TERMS.Common.protection"),
          wrappers: this.wrappers,
        },
      ],
      blocks: [
        {
          title: this.name,
          text: TERIOCK.content.keywords[this.rule],
        },
      ],
      icon: TERIOCK.display.icons.effect.protection,
      label: game.i18n.localize("TERIOCK.TERMS.Common.protection"),
    });
    await TeriockTextEditor.enrichPanels(this.panels);
  }
}
