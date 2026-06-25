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
    const schema = Object.assign(super.defineSchema(), { statuses: conditionRequirementsField() });
    delete schema.method;
    return schema;
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["statuses.absent", "statuses.present"];
  }

  /**
   * Whether this has statuses that will cause expiration.
   * @returns {boolean}
   */
  get shouldExpire() {
    if (this.actor) {
      for (const c of this.statuses.present) { if (this.actor.statuses.has(c)) { return true; } }
      for (const c of this.statuses.absent) { if (!this.actor.statuses.has(c)) { return true; } }
    }
    return false;
  }

  /** @inheritDoc */
  isValidEvent(event, context = {}) {
    return super.isValidEvent(event, context) && this.shouldExpire;
  }

  /** @inheritDoc */
  prepareData() {
    super.prepareData();
    this.method = "automatic";
  }
}
