import { copyItem } from "../../../helpers/fetch.mjs";
import { mergeFreeze } from "../../../helpers/utils.mjs";
import TeriockBaseActorModel from "../base-actor-data/base-actor-data.mjs";

/**
 * Character-specific actor data model.
 *
 * Relevant wiki pages:
 * - [Attributes](https://wiki.teriock.com/index.php/Core:Attributes)
 * - [Leveling Up](https://wiki.teriock.com/index.php/Core:Leveling_Up)
 * - [Size](https://wiki.teriock.com/index.php/Core:Size)
 *
 * @extends {TeriockBaseActorModel}
 */
export default class TeriockCharacterModel extends TeriockBaseActorModel {
  /**
   * @inheritDoc
   * @type {Readonly<Teriock.Documents.ActorModelMetadata>}
   */
  static metadata = mergeFreeze(super.metadata, {
    type: "character",
  });

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    if ((await super._preCreate(data, options, user)) === false) {
      return false;
    }

    // Ensure default items
    const defaultItems = [
      {
        name: "Foot",
        pack: "bodyParts",
      },
      {
        name: "Hand",
        pack: "bodyParts",
      },
      {
        name: "Mouth",
        pack: "bodyParts",
      },
      {
        name: "Created Elder Sorceries",
        pack: "essentials",
      },
      {
        name: "Learned Elder Sorceries",
        pack: "essentials",
      },
      {
        name: "Journeyman",
        pack: "classes",
      },
    ];
    const items = [];
    for (const item of defaultItems) {
      if (!this.parent.items.find((i) => i.name === item.name)) {
        items.push((await copyItem(item.name, item.pack)).toObject());
      }
    }

    // Add Essential Items
    this.parent.updateSource({
      prototypeToken: {
        actorLink: true,
        sight: {
          enabled: true,
        },
      },
      items: items,
    });
  }
}
