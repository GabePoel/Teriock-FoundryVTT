import { getImage } from "../../../helpers/path.mjs";
import { getRollIcon } from "../../../helpers/utils.mjs";
import StatPoolModel from "./stat-pool-model.mjs";

export default class MpPoolModel extends StatPoolModel {
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
        image: getImage("misc", "Mana Die"),
        name: game.i18n.localize("TERIOCK.MODELS.MpPool.PANELS.name"),
        bars: [],
        blocks: [
          {
            title: game.i18n.localize("TERIOCK.MODELS.StatPool.PANELS.title"),
            text: game.i18n.localize("TERIOCK.MODELS.MpPool.PANELS.text"),
          },
        ],
        icon: getRollIcon(this.formula),
      },
    ];
  }

  /** @inheritDoc */
  get stat() {
    return "mp";
  }
}
