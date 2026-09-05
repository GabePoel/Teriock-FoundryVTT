import { icons } from "../../../../constants/display/_module.mjs";
import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { getRollIcon } from "../../../../helpers/icon.mjs";
import commands from "../../../../helpers/interaction/commands/_module.mjs";
import RollAutomation from "../../automations/roll-automation/roll-automation.mjs";
import { AutomationActivationFactory } from "../abstract/_module.mjs";

const { fields } = foundry.data;

export default class RollActivation extends AutomationActivationFactory(RollAutomation) {
  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { icon: icons.manifest.ui.dice });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { boosts: new fields.NumberField() });
  }

  /**
   * Run this activation's command for each connected actor.
   * @param {"primary"|"secondary"} action
   * @returns {Promise<void>}
   */
  async #act(action) {
    let actors = this.actors;
    if (!this.actors.length) { actors = [null]; }
    for (const actor of actors) {
      if (this.impact === "other") {
        const roll = new BaseRoll(this.formula, actor?.getRollData?.() ?? {});
        await roll.evaluate();
        await roll.toMessage({ messageMode: game.settings.get("core", "messageMode") });
      } else {
        await commands[this.impact][action](actor, {
          boost: true,
          boosts: this.boosts,
          document: this.document?.system?._src ? await fromUuid(this.document.system._src) : null,
          formula: this.formula,
          type: this.impact,
        });
      }
    }
  }

  /** @inheritDoc */
  get label() {
    return (this.display.label
      || _loc("TERIOCK.ACTIVATIONS.Roll.BUTTON", { impact: TERIOCK.config.impact[this.impact]?.label })
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
    await this.#act("primary");
  }

  /** @inheritDoc */
  async secondaryAction() {
    await this.#act("secondary");
  }
}
