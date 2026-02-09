import { FeatHandler } from "../../../helpers/interaction/button-handlers/simple-command-handlers.mjs";
import ThresholdAutomation from "./threshold-automation.mjs";

const { fields } = foundry.data;

export default class FeatAutomation extends ThresholdAutomation {
  /** @inheritDoc */
  static get LABEL() {
    return "Feat Save";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "feat";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      attribute: new fields.StringField({
        choices: TERIOCK.index.attributesFull,
        label: "Attribute",
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["attribute", ...super._formPaths];
  }

  /** @inheritDoc */
  get buttons() {
    return [FeatHandler.buildButton(this.attribute, this.threshold)];
  }
}
