import { TeriockTextEditor } from "../../../applications/ux/_module.mjs";
import { getImage } from "../../../helpers/path.mjs";
import { fromIdentifier } from "../../../helpers/utils.mjs";
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
    return foundry.utils.mergeObject(super.chatData, {
      system: { _src: game.teriock.identifiers.get(this.identifier) },
    });
  }

  /** @inheritDoc */
  get flavor() {
    return this.name;
  }

  /** @returns {TypedIdentifier} */
  get identifier() {
    return this.hex ? "keyword:hexseal" : "keyword:immunity";
  }

  /** @inheritDoc */
  get name() {
    if (this.hex) return _loc("TERIOCK.TERMS.Protections.hexseal.single");
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
      blocks: [{ text: (await fromIdentifier(this.identifier))?.text?.content, title: this.name }],
      icon: TERIOCK.display.icons.effect.protection,
      image: this.img,
      label: _loc("TERIOCK.TERMS.Common.protection"),
      name: this.name,
    });
    await TeriockTextEditor.enrichPanels(this.panels);
  }
}
