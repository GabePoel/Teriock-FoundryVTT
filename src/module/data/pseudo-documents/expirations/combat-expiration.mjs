import { combatExpirationSourceTypeField, combatExpirationTimingField } from "../../fields/helpers/builders.mjs";
import { BaseExpiration } from "./abstract/_module.mjs";

/**
 * @todo Possibly split the when pieces apart.
 * @todo Actor filtering using the effect's executor property.
 */
export default class CombatExpiration extends BaseExpiration {
  /** @inheritDoc */
  static get TYPE() {
    return "combat";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      when: combatExpirationTimingField(),
      who: combatExpirationSourceTypeField(),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return [...super._formPaths, "hr", "when.time", "when.trigger", "when.skip", "who"];
  }
}
