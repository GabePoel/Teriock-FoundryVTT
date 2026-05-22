import { fromIdentifier } from "../../../../helpers/utils.mjs";
import BaseActorSystem from "../base-actor-system/base-actor-system.mjs";

/**
 * Character-specific actor data model.
 *
 * Relevant wiki pages:
 * - [Attributes](https://wiki.teriock.com/index.php/Core:Attributes)
 * - [Leveling Up](https://wiki.teriock.com/index.php/Core:Leveling_Up)
 * - [Size](https://wiki.teriock.com/index.php/Core:Size)
 *
 * @implements {Teriock.Models.CharacterSystemData}
 */
export default class CharacterSystem extends BaseActorSystem {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, { type: "character" });
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) return false;

    const defaultItemIdentifiers = [
      "power:created-elder-sorceries",
      "power:learned-elder-sorceries",
      "rank:journeyman",
    ];
    const items = await Promise.all(
      defaultItemIdentifiers.filter(identifier => !this.parent.items.find(i => i.typedIdentifier === identifier)).map(
        identifier => fromIdentifier(identifier)
      ),
    );
    const itemData = items.filter(Boolean).map(item => {
      const obj = item?.toObject(true);
      if (item?.inCompendium) foundry.utils.setProperty(item, "_stats.compendiumSource", item.uuid);
      return obj;
    });

    // Add Essential Items
    this.parent.updateSource(
      foundry.utils.mergeObject({
        items: itemData,
        prototypeToken: { actorLink: true, disposition: 0, sight: { enabled: true } },
      }, data),
    );
  }
}
