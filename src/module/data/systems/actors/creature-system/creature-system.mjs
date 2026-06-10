import { toCamelCase } from "../../../../helpers/string.mjs";
import * as systemMixins from "../../mixins/_module.mjs";
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
export default class CreatureSystem extends systemMixins.WikiSystemMixin(BaseActorSystem) {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, { type: "creature" });
  }

  /** @inheritDoc */
  get wikiPage() {
    return `Creature:${TERIOCK.index.creatures[toCamelCase(this.identifier ?? "")] ?? ""}`;
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    this.parent.updateSource(
      foundry.utils.mergeObject({
        prototypeToken: { actorLink: false, disposition: CONST.TOKEN_DISPOSITIONS.NEUTRAL },
        system: { scaling: { brScale: true } },
      }, data),
    );
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
