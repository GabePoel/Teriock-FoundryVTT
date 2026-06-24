import { BaseExpiration } from "./abstract/_module.mjs";

/**
 * @todo Implement trigger handling.
 */
export default class TriggerExpiration extends BaseExpiration {
  /** @inheritDoc */
  static get TYPE() {
    return "trigger";
  }

  /** @inheritDoc */
  isValidEvent(event, context = {}) {
    return super.isValidEvent(event, context) && context.trigger === this.trigger;
  }
}
