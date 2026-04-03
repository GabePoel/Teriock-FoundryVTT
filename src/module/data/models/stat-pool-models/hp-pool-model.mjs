import { getImage } from "../../../helpers/path.mjs";
import BaseStatPoolModel from "./base-stat-pool-model.mjs";

export default class HpPoolModel extends BaseStatPoolModel {
  get callback() {
    return async (amount) => {
      const criticallyWounded = this.actor?.statuses.has("criticallyWounded");
      await this.actor?.system.takeHealing(amount);
      if (!criticallyWounded) await this.actor?.system.takeAwaken();
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
            title: game.i18n.localize(
              "TERIOCK.MODELS.BaseStatPool.PANELS.title",
            ),
          },
        ],
        icon: TERIOCK.display.icons.stat.hp,
        image: getImage("misc", "Hit Die"),
        name: game.i18n.localize("TERIOCK.MODELS.HpPool.PANELS.name"),
      },
    ];
    if (this.actor?.statuses.has("criticallyWounded")) {
      panels.push({
        bars: [],
        blocks: [
          {
            text: TERIOCK.data.conditions.criticallyWounded.description,
            title: game.i18n.localize(
              "TERIOCK.MODELS.BaseStatPool.PANELS.title",
            ),
          },
        ],
        icon: TERIOCK.options.document.condition.icon,
        image: TERIOCK.data.conditions.criticallyWounded.img,
        name: TERIOCK.data.conditions.criticallyWounded.name,
      });
    } else if (this.actor?.statuses.has("unconscious")) {
      panels.push({
        bars: [],
        blocks: [
          {
            text: TERIOCK.content.keywords.awaken,
            title: game.i18n.localize(
              "TERIOCK.MODELS.BaseStatPool.PANELS.title",
            ),
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
