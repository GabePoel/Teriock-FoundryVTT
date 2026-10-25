import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { getRollIcon, mergeMetadata } from "../../../../utils/_module.mjs";
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

  /**
   * Roll this activation's formula.
   * @param {"take"|"reverse"} action
   * @returns {Promise<void>}
   */
  async #act(action) {
    if (this.command === "other") {
      const roll = new BaseRoll(this.formula, this.actors[0]?.getRollData() ?? {});
      await roll.evaluate();
      await roll.toMessage({ messageMode: game.settings.get("core", "messageMode") });
      return;
    }
    const src = this.getNearestDocument()?.system?._src;
    await game.teriock.commands[action](this.command, this.actors, {
      boosts: this.boosts,
      document: src ? await fromUuid(src) : null,
      formula: this.formula ?? "",
    });
  }

  /** @inheritDoc */
  get label() {
    return (this.display.label
      || _loc("TERIOCK.ACTIVATIONS.Roll.BUTTON", { command: TERIOCK.CONFIG.command[this.command]?.label })
      || super.label());
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
    await this.#act("take");
  }

  /** @inheritDoc */
  async secondaryAction() {
    await this.#act("reverse");
  }
}
