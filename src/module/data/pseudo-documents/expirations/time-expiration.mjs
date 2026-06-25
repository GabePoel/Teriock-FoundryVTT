import { BaseExpiration } from "./abstract/_module.mjs";

export default class TimeExpiration extends BaseExpiration {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.EXPIRATIONS.Time"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.EXPIRATIONS.Time.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "time";
  }
}
