import { getImage } from "../../../helpers/path.mjs";
import { getRollIcon } from "../../../helpers/utils.mjs";
import StatPoolModel from "./stat-pool-model.mjs";

export default class HpPoolModel extends StatPoolModel {
  get callback() {
    return /** @param {number} amount */ async (amount) => {
      const criticallyWounded =
        this.parent.actor?.statuses.has("criticallyWounded");
      await this.parent.actor?.system.takeHeal(amount);
      if (!criticallyWounded) {
        await this.parent.actor?.system.takeAwaken();
      }
    };
  }

  /** @inheritDoc */
  get dieName() {
    return "Hit Dice";
  }

  /** @inheritDoc */
  get panels() {
    const panels = [
      {
        image: getImage("misc", "Hit Die"),
        name: "Hit Die",
        bars: [],
        blocks: [
          {
            title: "Description",
            text:
              "You restore the rolled number of @L[Core:Hit Points and Mana Points]{HP} and are" +
              " @L[Keyword:Awaken]{awakened}.",
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
            title: "Description",
            text: TERIOCK.data.conditions.criticallyWounded.description,
          },
        ],
        icon: TERIOCK.options.document.condition.icon,
      });
    } else if (this.parent.actor?.statuses.has("unconscious")) {
      panels.push({
        image: getImage("effect-types", "Awakening"),
        icon: "sunrise",
        name: "Awaken",
        bars: [],
        blocks: [
          {
            title: "Description",
            text: TERIOCK.content.keywords.awaken,
          },
        ],
      });
    }
    return panels;
  }
}
