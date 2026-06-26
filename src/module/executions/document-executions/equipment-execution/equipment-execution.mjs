import { getImage } from "../../../helpers/path.mjs";
import { getName } from "../../../helpers/utils.mjs";
import ArmamentExecution from "../armament-execution/armament-execution.mjs";

export default class EquipmentExecution extends ArmamentExecution {
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
