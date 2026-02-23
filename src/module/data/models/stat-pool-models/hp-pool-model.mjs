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
        image: getImage("misc", "Hit Die"),
        name: game.i18n.localize("TERIOCK.MODELS.HpPool.PANELS.name"),
        bars: [],
        blocks: [
          {
            title: game.i18n.localize("TERIOCK.MODELS.StatPool.PANELS.title"),
            text: game.i18n.localize("TERIOCK.MODELS.HpPool.PANELS.text"),
          },
        ],
        icon: getRollIcon(this.formula),
      },
    ];
    if (this.parent.actor?.statuses.has("criticallyWounded")) {
      panels.push({
        image: TERIOCK.data.conditions.criticallyWounded.img,
        name: TERIOCK.data.conditions.criticallyWounded.name,
        bars: [],
        blocks: [
          {
            title: game.i18n.localize("TERIOCK.MODELS.StatPool.PANELS.title"),
            text: TERIOCK.data.conditions.criticallyWounded.description,
          },
        ],
        icon: TERIOCK.options.document.condition.icon,
      });
    } else if (this.parent.actor?.statuses.has("unconscious")) {
      panels.push({
        image: getImage("effect-types", "Awakening"),
        icon: TERIOCK.display.icons.effect.awaken,
        name: game.i18n.localize("TERIOCK.EFFECTS.Common.awaken"),
        bars: [],
        blocks: [
          {
            title: game.i18n.localize("TERIOCK.MODELS.StatPool.PANELS.title"),
            text: TERIOCK.content.keywords.awaken,
          },
        ],
      });
    }
    return panels;
  }

  /** @inheritDoc */
  get stat() {
    return "hp";
  }
}
