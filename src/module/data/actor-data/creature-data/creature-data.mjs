import { getItem } from "../../../helpers/fetch.mjs";
import { mergeFreeze } from "../../../helpers/utils.mjs";
import TeriockBaseActorModel from "../base-actor-data/base-actor-data.mjs";

/**
 * Creature-specific actor data model.
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
    type: "creature",
    indexCategoryKey: "creatures",
    indexCompendiumKey: "creatures",
  });

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    if ((await super._preCreate(data, options, user)) === false) {
      return false;
    }

    const updateData = {
      "system.scaling.brScale": true,
    };

    this.parent.updateSource(updateData);
  }

  /** @inheritDoc */
  async hardRefreshFromIndex() {
    if (!this.parent.species.map((s) => s.name).includes(this.parent.name)) {
      const species = await getItem(this.parent.name, "species");
      await this.parent.createEmbeddedDocuments("Item", [species]);
    }
    const species = this.parent.species.find(
      (s) => s.name === this.parent.name,
    );
    await species.system.hardRefreshFromIndex();
    await super.hardRefreshFromIndex();
    const bodyPartNames = new Set();
    const equipmentNames = new Set();
    for (const s of this.parent.species) {
      const items = /** @type {TeriockItem[]} */ await Promise.all(
        s.system.imports.items.map((i) => fromUuid(i)),
      );
      await s.system.importDeterministic();
      for (const b of items.filter((i) => i.type === "body")) {
        bodyPartNames.add(b.name);
      }
      for (const e of items.filter((i) => i.type === "equipment")) {
        equipmentNames.add(e.name);
      }
    }
    const toDelete = [
      ...this.parent.equipment
        .filter((e) => !equipmentNames.has(e.name))
        .map((e) => e.id),
      ...this.parent.bodyParts
        .filter((b) => !bodyPartNames.has(b.name))
        .map((b) => b.id),
    ];
    for (const b of this.parent.bodyParts) {
      await b.system.hardRefreshFromIndex();
    }
    for (const e of this.parent.equipment) {
      await e.system.hardRefreshFromIndex();
    }
    await this.parent.deleteEmbeddedDocuments("Item", toDelete);
    await this.parent.update({
      img: species.img,
      prototypeToken: {
        name: species.name,
        ring: {
          enabled: true,
        },
        texture: {
          src: species.img.replace("icons/creatures", "icons/tokens"),
        },
        width:
          game.teriock.Actor.sizeDefinition(species.system.size.value).length /
          5,
        height:
          game.teriock.Actor.sizeDefinition(species.system.size.value).length /
          5,
      },
      system: {
        hp: {
          value: this.parent.system.hp.max,
        },
        mp: {
          value: this.parent.system.mp.max,
        },
        size: {
          number: {
            saved: species.system.size.value,
          },
        },
      },
    });
  }
}
