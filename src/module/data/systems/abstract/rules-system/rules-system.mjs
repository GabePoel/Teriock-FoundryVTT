import { IdentifierField } from "../../../fields/_module.mjs";
import BaseSystem from "../base-system.mjs";

/**
 * @extends {Teriock.Models.RulesSystemData}
 */
export default class RulesSystem extends BaseSystem {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    super.LOCALIZATION_PREFIXES,
    "TERIOCK.SYSTEMS.Rules",
  ];

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      identifier: new IdentifierField(),
    });
  }
}
