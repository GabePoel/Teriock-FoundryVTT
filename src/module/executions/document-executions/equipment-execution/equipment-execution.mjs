import { selectDocumentsDialog } from "../../../applications/dialogs/select-document-dialog.mjs";
import { getImage } from "../../../helpers/path.mjs";
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
    const {
      secret = game.settings.get("teriock", "secretEquipment"),
      twoHanded = game.settings.get("teriock", "twoHandedEquipment"),
    } = options;
    if (options.formula === undefined && options.twoHanded) {
      this.formula = this.source.system.damage.twoHanded.formula;
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

  /** @inheritDoc */
  async _postExecute() {
    const onUseIds = Array.from(this.source.system.onUse);
    const onUseAbilities = /** @type {TeriockAbility[]} */ onUseIds
      .map((id) => this.source.effects.get(id))
      .filter((a) => a);
    if (onUseAbilities.length > 0) {
      const usedAbilities = await selectDocumentsDialog(onUseAbilities, {
        hint: `${this.source.name} has abilities that can activate on use. Select which to activate.`,
        title: "Activate Abilities",
      });
      for (const ability of usedAbilities) {
        if (ability.system.consumable && this.source.system.consumable) {
          if (
            ability.system.quantity !== 1 &&
            this.source.isOwner &&
            !this.source.inCompendium
          ) {
            await this.source.setFlag("teriock", "dontConsume", true);
          }
        }
        await ability.use();
      }
    }
    await super._postExecute();
  }
}
