import { rankConfig } from "../../../../constants/config/rank-config.mjs";
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
        choices: objectMap(rankConfig, a => a.name, { localize: true }),
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
    return [...super.displayTags, TERIOCK.config.rank[this.archetype]?.name];
  }

  /** @inheritDoc */
  get messageBars() {
    return [{
      icon: TERIOCK.config.rank[this.archetype]?.icon,
      label: _loc("TERIOCK.SYSTEMS.Rank.FIELDS.archetype.label"),
      wrappers: [TERIOCK.config.rank[this.archetype]?.name],
    }];
  }
}
