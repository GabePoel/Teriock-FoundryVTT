import { copyItem } from "../../../helpers/fetch.mjs";
import TeriockBaseActorModel from "../base-actor-model/base-actor-model.mjs";

//noinspection JSClosureCompilerSyntax
/**
 * Character-specific actor data model.
 *
 * Relevant wiki pages:
 * - [Attributes](https://wiki.teriock.com/index.php/Core:Attributes)
 * - [Leveling Up](https://wiki.teriock.com/index.php/Core:Leveling_Up)
 * - [Size](https://wiki.teriock.com/index.php/Core:Size)
 * @implements {Teriock.Models.TeriockCharacterModelInterface}
 */
export default class TeriockCharacterModel extends TeriockBaseActorModel {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "character",
    });
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    if ((await super._preCreate(data, options, user)) === false) {
      return false;
    }

    // Ensure default items
    const defaultItems = [
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
        disposition: 0,
        sight: {
          enabled: true,
        },
      },
      items: items,
    });
  }
}
