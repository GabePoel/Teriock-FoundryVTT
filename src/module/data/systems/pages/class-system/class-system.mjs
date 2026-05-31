import classConfig from "../../../../constants/config/class-config.mjs";
import { getName, objectMap } from "../../../../helpers/utils.mjs";
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
        type: "archetype",
      }),
    });
  }

  /** @inheritDoc */
  get _displayInputs() {
    return [...super._displayInputs, "system.archetype"];
  }

  /** @inheritDoc */
  get _displayTags() {
    return [...super._displayTags, getName(this.archetype)];
  }

  /** @inheritDoc */
  get _panelBars() {
    return [{
      icon: TERIOCK.config.class.archetypes[this._source.archetype]?.icon,
      label: _loc("TERIOCK.SYSTEMS.Rank.FIELDS.archetype.label"),
      wrappers: [getName(this.archetype)],
    }];
  }
}
