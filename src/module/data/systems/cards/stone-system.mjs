import { getImage } from "../../../helpers/path.mjs";
import BaseCardsSystem from "./base-cards-system.mjs";

/**
 * @extends {BaseCardsSystem}
 */
export default class StoneSystem extends BaseCardsSystem {
  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    const copy = foundry.utils.deepClone(data);
    this.parent.updateSource(
      foundry.utils.mergeObject({
        back: { img: getImage("death-bag-stones", "Unknown"), name: _loc("TERIOCK.SYSTEMS.Stone.DEFAULTS.back") },
      }, data),
    );
    if (!foundry.utils.hasProperty(copy, "faces") || Object.keys(copy.faces[0]).length === 0) {
      this.parent.updateSource({
        faces: [{ img: getImage("death-bag-stones", "Brown"), name: _loc("TERIOCK.SYSTEMS.Stone.DEFAULTS.faces") }],
      });
    }
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.parent.parent) {
      let count = 1;
      const cards = this.parent.parent?.cards.contents.filter(c =>
        c.type === this.parent.type && c.suit === this.parent.suit
      );
      cards.sort((a, b) => a.sort - b.sort);
      for (const card of cards) {
        if (card.id === this.parent.id) { break; }
        count++;
      }
      this.parent.value = count;
    }
  }
}
