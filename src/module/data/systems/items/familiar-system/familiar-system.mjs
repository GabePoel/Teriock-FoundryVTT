import { getName, mergeMetadata, mixClasses } from "../../../../utils/_module.mjs";
import { IdentifierField } from "../../../fields/_module.mjs";
import { ArmorSuppressionSystemMixin } from "../../mixins/_module.mjs";
import { SimpleItemSystem } from "../abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * Familiar-specific item data model.
 * @extends {SimpleItemSystem}
 * @mixes ArmorSuppressionSystem
 */
export default class FamiliarSystem extends mixClasses(SimpleItemSystem, ArmorSuppressionSystemMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Familiar"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: TERIOCK.DISPLAY.icons.manifest.document.familiar,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.familiar,
    type: "familiar",
  });

  /** @inheritDoc */
  static get Execution() {
    return teriock.executions.child.FamiliarExecution;
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      actorUuid: new fields.DocumentUUIDField({ type: "Actor" }),
      creatureType: new IdentifierField({ suggestions: true, type: "creature" }),
    });
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    if (this.creatureType) { parts.subtitle = getName(this.creatureType); }
    return parts;
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    this.parent.updateSource(
      foundry.utils.mergeObject({
        system: {
          effectTypes: ["contract"],
          elements: ["nature"],
          maxAv: 0,
          powerSources: ["magical", "primal", "spiritual"],
        },
      }, data),
    );
  }
}
