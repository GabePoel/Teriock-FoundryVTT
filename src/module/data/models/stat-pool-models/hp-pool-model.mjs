import { getImage } from "../../../helpers/path.mjs";
import { getRollIcon } from "../../../helpers/utils.mjs";
import StatPoolModel from "./stat-pool-model.mjs";

export default class HpPoolModel extends StatPoolModel {
  get callback() {
    return /** @param {number} amount */ async (amount) => {
      const criticallyWounded =
        this.parent.actor?.statuses.has("criticallyWounded");
      await this.parent.actor?.system.takeHealing(amount);
      if (!criticallyWounded) {
        await this.parent.actor?.system.takeAwaken();
      }
    };
  }

  /** @inheritDoc */
  get dieName() {
    return game.i18n.localize("TERIOCK.MODELS.HpPool.PANELS.name");
  }

  /** @inheritDoc */
  get flavor() {
    return "hp";
  }

  /** @inheritDoc */
  get panels() {
    const panels = [
      {
        bars: [],
        blocks: [
          {
            text: game.i18n.localize("TERIOCK.MODELS.HpPool.PANELS.text"),
            title: game.i18n.localize("TERIOCK.MODELS.StatPool.PANELS.title"),
          },
        ],
        icon: getRollIcon(this.formula),
        image: getImage("misc", "Hit Die"),
        name: game.i18n.localize("TERIOCK.MODELS.HpPool.PANELS.name"),
      },
    ];
    if (this.parent.actor?.statuses.has("criticallyWounded")) {
      panels.push({
        bars: [],
        blocks: [
          {
            text: TERIOCK.data.conditions.criticallyWounded.description,
            title: game.i18n.localize("TERIOCK.MODELS.StatPool.PANELS.title"),
          },
        ],
        icon: TERIOCK.options.document.condition.icon,
        image: TERIOCK.data.conditions.criticallyWounded.img,
        name: TERIOCK.data.conditions.criticallyWounded.name,
      });
    } else if (this.parent.actor?.statuses.has("unconscious")) {
      panels.push({
        bars: [],
        blocks: [
          {
            text: TERIOCK.content.keywords.awaken,
            title: game.i18n.localize("TERIOCK.MODELS.StatPool.PANELS.title"),
          },
        ],
        icon: TERIOCK.display.icons.effect.awaken,
        image: getImage("effect-types", "Awakening"),
        name: game.i18n.localize("TERIOCK.EFFECTS.Common.awaken"),
      });
    }
    return panels;
  }

  /** @inheritDoc */
  get stat() {
    return "hp";
  }
}
