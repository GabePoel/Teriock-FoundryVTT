import { getImage } from "../../../helpers/path.mjs";
import BaseCardSystem from "./base-card-system.mjs";

export default class StoneSystem extends BaseCardSystem {
  /** @inheritDoc */
  async _preCreate(data, options, user) {
    if ((await super._preCreate(data, options, user)) === false) {
      return false;
    }
    if (!foundry.utils.hasProperty(data, "back.img")) {
      this.parent.updateSource({
        "back.img": getImage("death-bag-stones", "Unknown"),
      });
    }
    if (!foundry.utils.hasProperty(data, "back.name")) {
      this.parent.updateSource({
        "back.name": game.i18n.localize("TERIOCK.SYSTEMS.Stone.DEFAULTS.back"),
      });
    }
    if (
      !foundry.utils.hasProperty(data, "faces") ||
      Object.keys(foundry.utils.getProperty(data, "faces")[0]).length === 0
    ) {
      this.parent.updateSource({
        faces: [
          {
            img: getImage("death-bag-stones", "Brown"),
            name: game.i18n.localize("TERIOCK.SYSTEMS.Stone.DEFAULTS.faces"),
          },
        ],
      });
    }
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.parent.parent) {
      let count = 1;
      const cards = this.parent.parent.cards.contents.filter(
        (c) => c.type === this.parent.type && c.suit === this.parent.suit,
      );
      cards.sort((a, b) => a.sort - b.sort);
      for (const card of cards) {
        if (card.id === this.parent.id) break;
        count++;
      }
      this.parent.value = count;
    }
  }
}
