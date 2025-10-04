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
    await super.hardRefreshFromIndex();
    const bodyPartNames = new Set();
    const equipmentNames = new Set();
    for (const s of this.parent.species) {
      await s.system.imports.importDeterministic();
      for (const uuid of s.system.imports.bodyParts) {
        const b = await fromUuid(uuid);
        bodyPartNames.add(b.name);
      }
      for (const uuid of s.system.imports.equipment) {
        const e = await fromUuid(uuid);
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
