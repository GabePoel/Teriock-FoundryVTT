import { getImage } from "../../../helpers/path.mjs";
import { inferNameFromIdentifier } from "../../../helpers/utils.mjs";
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
        icon: TERIOCK.options.document.equipment.icon,
        name: _loc("TERIOCK.SYSTEMS.Equipment.PANELS.unknown", {
          type: inferNameFromIdentifier(
            this.source.system.equipmentType,
            "equipment",
          ),
        }),
        blocks: [
          {
            title: _loc("TERIOCK.SYSTEMS.Child.FIELDS.description.label"),
            text: _loc("TERIOCK.SYSTEMS.Equipment.PANELS.used"),
          },
        ],
        image: getImage("equipment", this.source.system.equipmentType),
      };
    } else {
      return super._buildSourcePanel();
    }
  }
}
