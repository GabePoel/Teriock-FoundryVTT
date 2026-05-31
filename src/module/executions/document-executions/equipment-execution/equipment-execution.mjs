import { getImage } from "../../../helpers/path.mjs";
import { getName } from "../../../helpers/utils.mjs";
import ArmamentExecution from "../armament-execution/armament-execution.mjs";

/**
 * @implements {Teriock.Execution.EquipmentExecutionInterface}
 */
export default class EquipmentExecution extends ArmamentExecution {
  /**
   * @param {Teriock.Execution.EquipmentExecutionOptions} options
   */
  constructor(options = {}) {
    super(options);
    this.secret = options.secret ?? game.teriock.getSetting("secretEquipment");
  }

  /** @inheritDoc */
  get executionNames() {
    return [...super.executionNames, "Equipment"];
  }

  /** @inheritDoc */
  async _buildSourcePanel() {
    if (this.secret) {
      return {
        blocks: [{
          text: _loc("TERIOCK.SYSTEMS.Equipment.PANELS.used"),
          title: _loc("TERIOCK.SYSTEMS.Child.FIELDS.description.label"),
        }],
        icon: TERIOCK.config.document.equipment.icon,
        image: getImage("equipment", this.source.system._source.equipmentType),
        name: _loc("TERIOCK.SYSTEMS.Equipment.PANELS.unknown", { type: getName(this.source.system.equipmentType) }),
      };
    }
    return super._buildSourcePanel();
  }
}
