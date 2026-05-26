import { getIdentifierIcon, getIdentifierName } from "../../../../helpers/utils.mjs";
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
      archetype: new IdentifierField({ initial: "everyman", type: "archetype" }),
    });
  }

  /** @inheritDoc */
  get displayInputs() {
    return [...super.displayInputs, {
      choices: game.teriock.identifiers.getNames("archetype"),
      path: "system.archetype",
      value: this._source.archetype,
    }];
  }

  /** @inheritDoc */
  get displayTags() {
    return [...super.displayTags, getIdentifierName(this.archetype)];
  }

  /** @inheritDoc */
  get messageBars() {
    return [{
      icon: getIdentifierIcon(this.archetype),
      label: _loc("TERIOCK.SYSTEMS.Rank.FIELDS.archetype.label"),
      wrappers: [getIdentifierName(this.archetype)],
    }];
  }
}
