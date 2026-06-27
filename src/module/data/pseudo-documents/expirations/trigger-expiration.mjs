import { formatDynamicSelectOptions } from "../../../helpers/utils.mjs";
import { BaseExpiration } from "./abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {Set<Teriock.System.Trigger>} triggers
 */
export default class TriggerExpiration extends BaseExpiration {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.EXPIRATIONS.Trigger"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.EXPIRATIONS.Trigger.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "trigger";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      triggers: new fields.SetField(
        new fields.StringField({ choices: formatDynamicSelectOptions(TERIOCK.config.trigger, { localize: true }) }),
      ),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [...super._formPaths, "triggers"];
  }

  /** @inheritDoc */
  _onFireTrigger(trigger, scope = {}) {
    super._onFireTrigger(trigger, scope);
    if (this.isExpiryEvent(this.constructor.EXPIRY_REFRESH_EVENT), { trigger, type: this.type }) {
      console.log(true);
      // this.document.system.expire()
    }
  }

  /** @inheritDoc */
  isValidEvent(event, context = {}) {
    return super.isValidEvent(event, context) && this.triggers.has(context.trigger);
  }
}
