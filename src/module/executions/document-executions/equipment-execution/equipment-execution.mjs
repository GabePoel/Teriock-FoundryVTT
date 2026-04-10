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
        name: game.i18n.format("TERIOCK.SYSTEMS.Equipment.PANELS.unknown", {
          type: inferNameFromIdentifier(
            `equipment:${this.source.system.equipmentType}`,
          ),
        }),
        blocks: [
          {
            title: game.i18n.localize(
              "TERIOCK.SYSTEMS.Child.FIELDS.description.label",
            ),
            text: game.i18n.localize("TERIOCK.SYSTEMS.Equipment.PANELS.used"),
          },
        ],
        image: getImage("equipment", this.source.system.equipmentType),
      };
    } else {
      return super._buildSourcePanel();
    }
  }
}
