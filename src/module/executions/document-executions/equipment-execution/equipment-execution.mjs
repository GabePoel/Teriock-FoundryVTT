import { getImage } from "../../../helpers/path.mjs";
import ArmamentExecution from "../armament-execution/armament-execution.mjs";

export default class EquipmentExecution extends ArmamentExecution {
  /**
   * @param {Teriock.Execution.EquipmentExecutionOptions} options
   */
  constructor(options = {}) {
    super(options);
    const {
      secret = game.settings.get("teriock", "secretEquipment"),
      twoHanded = game.settings.get("teriock", "twoHandedEquipment"),
    } = options;
    if (options.formula === undefined && options.twoHanded) {
      this.formula = this.source.system.damage.twoHanded.value;
    }
    this.secret = secret;
    this.twoHanded = twoHanded;
  }

  /** @inheritDoc */
  async _buildSourcePanel() {
    if (this.secret) {
      return {
        icon: TERIOCK.options.document.equipment.icon,
        name: "Unknown " + this.source.system.equipmentType,
        blocks: [
          {
            title: "Description",
            text: "Item is used.",
          },
        ],
        image: getImage("equipment", this.source.system.equipmentType),
      };
    } else {
      return super._buildSourcePanel();
    }
  }
}
