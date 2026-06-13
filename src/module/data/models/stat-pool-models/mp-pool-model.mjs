import { getImage } from "../../../helpers/path.mjs";
import BaseStatPoolModel from "./base-stat-pool-model.mjs";

export default class MpPoolModel extends BaseStatPoolModel {
  /** @inheritDoc */
  get callback() {
    return /** @param {number} amount */ async amount => {
      await this.actor?.system.takeRevitalizing(amount);
    };
  }

  /** @inheritDoc */
  get dieName() {
    return _loc("TERIOCK.MODELS.MpPool.PANELS.name");
  }

  /** @inheritDoc */
  get flavor() {
    return "mp";
  }

  /** @inheritDoc */
  get panels() {
    return [{
      bars: [],
      blocks: [{
        text: _loc("TERIOCK.MODELS.MpPool.PANELS.text"),
        title: _loc("TERIOCK.MODELS.BaseStatPool.PANELS.title"),
      }],
      icon: TERIOCK.display.icons.stat.mp,
      image: getImage("misc", "Mana Die"),
      name: _loc("TERIOCK.MODELS.MpPool.PANELS.name"),
    }];
  }

  /** @inheritDoc */
  get stat() {
    return "mp";
  }
}
