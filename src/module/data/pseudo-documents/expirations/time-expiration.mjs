import { BaseExpiration } from "./abstract/_module.mjs";

export default class TimeExpiration extends BaseExpiration {
  /** @inheritDoc */
  static get TYPE() {
    return "time";
  }
}
