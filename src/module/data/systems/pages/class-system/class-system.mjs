import { getName, mergeMetadata, mixClasses, objectMap } from "../../../../utils/_module.mjs";
import { IdentifierField, TypedIdentifierSetField } from "../../../fields/_module.mjs";
import { RankSystem } from "../../items/_module.mjs";
import { WikiSystemMixin } from "../../mixins/_module.mjs";
import BasePageSystem from "../base-page-system/base-page-system.mjs";

/**
 * @extends {BasePageSystem}
 * @mixes WikiSystem
 */
export default class ClassSystem extends mixClasses(BasePageSystem, WikiSystemMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Rank"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: RankSystem.metadata.icon,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.class,
    type: "class",
  });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      archetype: new IdentifierField({
        choices: objectMap(TERIOCK.CONFIG.class.archetypes, a => a.label, { localize: true }),
        initial: "everyman",
        nullable: false,
        required: true,
        type: "archetype",
      }),
      ranks: new TypedIdentifierSetField({
        label: "TERIOCK.DOCUMENTS.Item.rank.plural",
        suggestions: true,
        types: ["rank"],
      }),
    });
  }

  /** @inheritDoc */
  get _displayInputs() {
    return [...super._displayInputs, "system.archetype", "system.ranks"];
  }

  /** @inheritDoc */
  get _displayTags() {
    return [...super._displayTags, getName(this.archetype)];
  }

  /** @inheritDoc */
  get _panelBars() {
    return [{
      icon: TERIOCK.CONFIG.class.archetypes[this._source.archetype]?.icon,
      label: _loc("TERIOCK.SYSTEMS.Rank.FIELDS.archetype.label"),
      wrappers: [getName(this.archetype)],
    }];
  }
}
