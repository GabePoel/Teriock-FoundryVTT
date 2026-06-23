import { BaseExpiration } from "./abstract/_module.mjs";

export default class EventExpiration extends BaseExpiration {
  /** @inheritDoc */
  static get TYPE() {
    return "event";
  }
}
