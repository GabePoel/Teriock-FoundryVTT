import classConfig from "../../../../constants/config/class-config.mjs";
import { objectMap } from "../../../../helpers/utils.mjs";
import { IdentifierField } from "../../../fields/_module.mjs";
import BasePageSystem from "../base-page-system/base-page-system.mjs";

/**
 * @extends {TypeDataModel}
 * @extends {Teriock.Models.ClassSystemData}
 */
export default class ClassSystem extends BasePageSystem {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Rank"];

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      archetype: new IdentifierField({
        choices: objectMap(classConfig.archetypes, a => a.label, { localize: true }),
        initial: "everyman",
        nullable: false,
        required: true,
      }),
    });
  }

  /** @inheritDoc */
  get displayInputs() {
    return [...super.displayInputs, "system.archetype"];
  }

  /** @inheritDoc */
  get displayTags() {
    return [...super.displayTags, TERIOCK.config.class.archetypes[this.archetype]?.label];
  }

  /** @inheritDoc */
  get messageBars() {
    return [{
      icon: TERIOCK.config.class.archetypes[this.archetype]?.icon,
      label: _loc("TERIOCK.SYSTEMS.Rank.FIELDS.archetype.label"),
      wrappers: [TERIOCK.config.class.archetypes[this.archetype]?.label],
    }];
  }
}
