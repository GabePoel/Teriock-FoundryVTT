import { getImage } from "../../../helpers/path.mjs";
import BaseStatPoolModel from "./base-stat-pool-model.mjs";

export default class MpPoolModel extends BaseStatPoolModel {
  get callback() {
    return /** @param {number} amount */ async (amount) => {
      await this.parent.actor?.system.takeRevitalizing(amount);
    };
  }

  /** @inheritDoc */
  get dieName() {
    return game.i18n.localize("TERIOCK.MODELS.MpPool.PANELS.name");
  }

  /** @inheritDoc */
  get flavor() {
    return "mp";
  }

  /** @inheritDoc */
  get panels() {
    return [
      {
        bars: [],
        blocks: [
          {
            text: game.i18n.localize("TERIOCK.MODELS.MpPool.PANELS.text"),
            title: game.i18n.localize(
              "TERIOCK.MODELS.BaseStatPool.PANELS.title",
            ),
          },
        ],
        icon: TERIOCK.display.icons.stat.mp,
        image: getImage("misc", "Mana Die"),
        name: game.i18n.localize("TERIOCK.MODELS.MpPool.PANELS.name"),
      },
    ];
  }

  /** @inheritDoc */
  get stat() {
    return "mp";
  }
}
