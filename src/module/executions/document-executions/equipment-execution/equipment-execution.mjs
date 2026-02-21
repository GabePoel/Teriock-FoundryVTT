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
        name: game.i18n.format("TERIOCK.SYSTEMS.Equipment.PANELS.unknown", {
          type: this.source.system.equipmentType,
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

  /** @inheritDoc */
  async _postExecute() {
    const onUseIds = Array.from(this.source.system.onUse);
    const onUseAbilities = /** @type {TeriockAbility[]} */ onUseIds
      .map((id) => this.source.effects.get(id))
      .filter((a) => a);
    if (onUseAbilities.length > 0) {
      const usedAbilities = await selectDocumentsDialog(onUseAbilities, {
        hint: game.i18n.format("TERIOCK.SYSTEMS.Equipment.DIALOG.onUse.hint", {
          name: this.source.name,
        }),
        title: game.i18n.localize(
          "TERIOCK.SYSTEMS.Equipment.DIALOG.onUse.title",
        ),
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
