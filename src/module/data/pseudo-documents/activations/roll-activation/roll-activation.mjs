import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { getRollIcon, mergeMetadata } from "../../../../utils/_module.mjs";
import { migrateRename } from "../../../fields/tools/migrations.mjs";
import RollAutomation from "../../automations/roll-automation/roll-automation.mjs";
import { AutomationActivationFactory } from "../abstract/_module.mjs";

const { fields } = foundry.data;

export default class RollActivation extends AutomationActivationFactory(RollAutomation) {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { icon: TERIOCK.DISPLAY.icons.manifest.ui.dice });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { boosts: new fields.NumberField() });
  }

  /** @inheritDoc */
  static migrateData(source, options) {
    migrateRename(source, "impact", "command");
    if (source.command === "other") { source.command = null; }
    return super.migrateData(source, options);
  }

  /**
   * Roll this activation's formula.
   * @param {"run"|"reverse"} action
   * @returns {Promise<void>}
   */
  async #act(action) {
    if (!this.command) {
      const roll = new BaseRoll(this.formula, this.actors[0]?.getRollData() ?? {});
      await roll.evaluate();
      await roll.toMessage({ messageMode: game.settings.get("core", "messageMode") });
      return;
    }
    const origin = this.getNearestDocument()?.system?.origin;
    await game.teriock.commands[action](this.command, this.actors, {
      boosts: this.boosts,
      document: origin ? await fromUuid(origin) : null,
      formula: this.formula ?? "",
    });
  }

  /** @inheritDoc */
  get label() {
    const command = TERIOCK.CONFIG.command[this.command]?.label;
    if (this.display.label || !command) { return super.label; }
    return _loc("TERIOCK.ACTIVATIONS.Roll.BUTTON", { command });
  }

  /** @inheritDoc */
  get tooltip() {
    return this.formula;
  }

  /** @inheritDoc */
  get typeIcon() {
    return this.display.icon || getRollIcon(this.formula) || super.typeIcon;
  }

  /** @inheritDoc */
  async primaryAction() {
    await this.#act("run");
  }

  /** @inheritDoc */
  async secondaryAction() {
    await this.#act("reverse");
  }
}
