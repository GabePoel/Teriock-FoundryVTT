import { formatDynamicSelectOptions } from "../../../helpers/utils.mjs";
import { BaseExpiration } from "./abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {Teriock.System.Trigger} trigger
 */
export default class TriggerExpiration extends BaseExpiration {
  /** @inheritDoc */
  static get TYPE() {
    return "trigger";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      trigger: new fields.StringField({
        blank: false,
        choices: formatDynamicSelectOptions(TERIOCK.config.trigger),
        initial: "dawn",
        nullable: false,
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [...super._formPaths, "trigger"];
  }

  /** @inheritDoc */
  isValidEvent(event, context = {}) {
    return super.isValidEvent(event, context) && context.trigger === this.trigger;
  }
}
