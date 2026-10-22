import { fromIdentifier, mergeMetadata } from "../../../utils/_module.mjs";
import BaseActorSystem from "./base-actor-system/base-actor-system.mjs";

/**
 * Playable character actor data model.
 *
 * Relevant wiki pages:
 * - [Attributes](https://wiki.teriock.com/index.php/Core:Attributes)
 * - [Leveling Up](https://wiki.teriock.com/index.php/Core:Leveling_Up)
 * - [Size](https://wiki.teriock.com/index.php/Core:Size)
 */
export default class PlayableCharacterSystem extends BaseActorSystem {
  /**
   * @inheritDoc
   * @type {Teriock.Metadata.PlayableCharacterSystemMetadata}
   */
  static metadata = mergeMetadata(super.metadata, {
    defaultChildIdentifiers: ["rank:journeyman", "resource:agency-spark"],
    icon: TERIOCK.DISPLAY.icons.manifest.document.character,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.character,
    type: "pc",
  });

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    const existing = [...this.parent.items, ...this.parent.effects].map(d => d.typedIdentifier);
    const docs = await Promise.all(
      this.constructor.metadata.defaultChildIdentifiers.filter(identifier => !existing.includes(identifier)).map(
        identifier => fromIdentifier(identifier)
      ),
    );
    const children = { effects: [], items: [] };
    for (const doc of docs.filter(Boolean)) {
      const obj = doc.toObject(true);
      if (doc.inCompendium) { foundry.utils.setProperty(obj, "_stats.compendiumSource", doc.uuid); }
      children[doc.collectionName].push(obj);
    }

    // Add Essential Children
    this.parent.updateSource(
      foundry.utils.mergeObject({
        ...children,
        prototypeToken: { actorLink: true, disposition: CONST.TOKEN_DISPOSITIONS.FRIENDLY, sight: { enabled: true } },
        system: { scaling: { brScale: false } },
      }, data),
    );
  }
}
