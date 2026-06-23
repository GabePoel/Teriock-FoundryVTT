import { BaseExpiration } from "./abstract/_module.mjs";

export default class StatusExpiration extends BaseExpiration {
  /** @inheritDoc */
  static get TYPE() {
    return "status";
  }
}
