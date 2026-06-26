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
    this.wrappers.push(this.hex ? _loc("TERIOCK.TERMS.Common.chosen") : _loc("TERIOCK.TERMS.Common.automatic"));
    this.img = options.img || (this.hex ? getImage("effect-types", "Hexseal") : getImage("effect-types", "Immunity"));
  }

  /** @inheritDoc */
  get chatData() {
    return foundry.utils.mergeObject(super.chatData, { system: { _src: this.journalEntryPage?.uuid } });
  }

  /** @inheritDoc */
  get flavor() {
    return this.name;
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.display.icons.effect.protection;
  }

  /** @inheritDoc */
  get journalEntryPageIdentifier() {
    return this.hex ? "keyword:hexseal" : "keyword:immunity";
  }

  /** @inheritDoc */
  get name() {
    if (this.hex) { return _loc("TERIOCK.TERMS.Protections.hexseal.single"); }
    return _loc("TERIOCK.TERMS.Protections.immunity.single");
  }

  /** @inheritDoc */
  async _buildPanels() {
    this.panels.push({
      bars: [{
        icon: TERIOCK.display.icons.effect.immune,
        label: _loc("TERIOCK.TERMS.Common.protection"),
        wrappers: this.wrappers,
      }],
      blocks: [{ text: this.journalEntryPage?.text?.content, title: this.name }],
      icon: TERIOCK.display.icons.effect.protection,
      image: this.img,
      label: _loc("TERIOCK.TERMS.Common.protection"),
      name: this.name,
    });
    await TeriockTextEditor.enrichPanels(this.panels);
  }
}
