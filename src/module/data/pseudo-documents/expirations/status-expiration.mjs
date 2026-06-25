import { conditionRequirementsField } from "../../fields/helpers/builders.mjs";
import { BaseExpiration } from "./abstract/_module.mjs";

/**
 * @property {object} statuses
 * @property {Set<Teriock.Keys.Condition>} statuses.absent
 * @property {Set<Teriock.Keys.Condition>} statuses.present
 */
export default class StatusExpiration extends BaseExpiration {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.EXPIRATIONS.Status"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.EXPIRATIONS.Status.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "status";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { statuses: conditionRequirementsField() });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [...super._formPaths, "statuses.absent", "statuses.present"];
  }

  /**
   * Whether this has statuses that will cause expiration.
   * @returns {boolean}
   */
  get hasExpiryStatuses() {
    if (this.actor) {
      for (const c of this.statuses.present) { if (!this.actor.statuses.has(c)) { return false; } }
      for (const c of this.statuses.absent) { if (this.actor.statuses.has(c)) { return false; } }
    }
    return false;
  }

  /** @inheritDoc */
  isValidEvent(event, context = {}) {
    return super.isValidEvent(event, context) && this.hasExpiryStatuses;
  }
}
