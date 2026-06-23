import { BaseExpiration } from "./abstract/_module.mjs";

export default class CombatExpiration extends BaseExpiration {
  /** @inheritDoc */
  static get TYPE() {
    return "combat";
  }
}
