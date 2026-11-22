import { mergeMetadata, mixClasses } from "../../../utils/_module.mjs";
import { WikiSystemMixin } from "../mixins/_module.mjs";
import { PlayableActorSystem } from "./abstract/_module.mjs";

/**
 * Creature-specific actor data model.
 *
 * Relevant wiki pages:
 * - [Attributes](https://wiki.teriock.com/index.php/Core:Attributes)
 * - [Size](https://wiki.teriock.com/index.php/Core:Size)
 *
 * @extends {PlayableActorSystem}
 * @mixes WikiSystem
 */
export default class CreatureSystem extends mixClasses(PlayableActorSystem, WikiSystemMixin) {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: TERIOCK.DISPLAY.icons.manifest.document.creature,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.creature,
    importable: true,
    type: "creature",
  });

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    this.parent.updateSource(
      foundry.utils.mergeObject({
        prototypeToken: { actorLink: false, disposition: CONST.TOKEN_DISPOSITIONS.HOSTILE },
        system: { scaling: { basis: "br" } },
      }, data),
    );
  }

  /** @inheritDoc */
  async getPanelParts() {
    const parts = await super.getPanelParts();
    for (const species of this.parent.previewedTypes.species) {
      const speciesParts = await species.system.getPanelParts();
      parts.blocks.push(...speciesParts.blocks);
    }
    return parts;
  }
}
