import BaseActorSystem from "../base-actor-system/base-actor-system.mjs";

/**
 * Creature-specific actor data model.
 *
 * Relevant wiki pages:
 * - [Attributes](https://wiki.teriock.com/index.php/Core:Attributes)
 * - [Size](https://wiki.teriock.com/index.php/Core:Size)
 *
 * @implements {Teriock.Models.CreatureSystemData}
 */
export default class CreatureSystem extends BaseActorSystem {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "creature",
      indexCategoryKey: "creatures",
      indexCompendiumKey: "creatures",
    });
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) {
      return false;
    }

    this.parent.updateSource(foundry.utils.mergeObject({ system: { scaling: { brScale: true } } }, data));
  }

  /** @inheritDoc */
  async getPanelParts() {
    const parts = await super.getPanelParts();
    for (const species of this.parent.species) {
      const speciesParts = await species.system.getPanelParts();
      parts.blocks.push(...speciesParts.blocks);
    }
    return parts;
  }
}
