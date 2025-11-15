import { getImage } from "../../../helpers/path.mjs";
import { getRollIcon } from "../../../helpers/utils.mjs";
import StatPoolModel from "./stat-pool-model.mjs";

export default class MpPoolModel extends StatPoolModel {
  get callback() {
    return /** @param {number} amount */ async (amount) => {
      await this.parent.actor?.system.takeRevitalize(amount);
    };
  }

  /** @inheritDoc */
  get dieName() {
    return "Mana Dice";
  }

  /** @inheritDoc */
  get panels() {
    return [
      {
        image: getImage("misc", "Mana Die"),
        name: "Mana Die",
        bars: [],
        blocks: [
          {
            title: "Description",
            text: "You restore the rolled number of @L[Core:Hit Points and Mana Points]{MP}.",
          },
        ],
        icon: getRollIcon(this.formula),
      },
    ];
  }
}
