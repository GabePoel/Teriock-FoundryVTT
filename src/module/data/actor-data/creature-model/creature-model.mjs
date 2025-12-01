import TeriockBaseActorModel from "../base-actor-model/base-actor-model.mjs";

/**
 * Creature-specific actor data model.
 *
 * Relevant wiki pages:
 * - [Attributes](https://wiki.teriock.com/index.php/Core:Attributes)
 * - [Size](https://wiki.teriock.com/index.php/Core:Size)
 *
 * @extends {TeriockBaseActorModel}
 */
export default class TeriockCreatureModel extends TeriockBaseActorModel {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "creature",
      indexCategoryKey: "creatures",
      indexCompendiumKey: "creatures",
    });
  }

  /** @inheritDoc */
  get messageParts() {
    const parts = super.messageParts;
    for (const species of this.parent.species) {
      parts.blocks.push(...species.system.messageParts.blocks);
    }
    return parts;
  }

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
}
