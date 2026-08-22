import { icons } from "../../../../constants/display/icons.mjs";
import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { TeriockChatMessage } from "../../../../documents/_module.mjs";
import { formulaExists, multiplyFormula } from "../../../../helpers/formula.mjs";
import { rollableFormulaField } from "../../../fields/tools/builders.mjs";
import { BaseActivation } from "../abstract/_module.mjs";

const { fields } = foundry.data;

export default class ChangeQuantityActivation extends BaseActivation {
  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.ACTIVATIONS.ChangeQuantity.BUTTON";
  }

  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { icon: icons.pseudoDocument.automation });
  }

  /** @inheritDoc */
  static get TYPE() {
    return "changeQuantity";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      consumable: new fields.DocumentUUIDField(),
      formula: rollableFormulaField(),
      messageMode: new fields.StringField({ nullable: true }),
      triggerLabel: new fields.StringField(),
    });
  }

  /**
   * Change quantity using the given formula.
   * @param {Teriock.System.FormulaString} formula
   * @returns {Promise<void>}
   */
  async #changeQuantity(formula) {
    if (!formulaExists(formula) || !this.consumable) { return; }
    const consumable = await fromUuid(this.consumable);
    if (!consumable?.system?.consumable) { return; }
    if (consumable.system.quantity.value <= 0 && BaseRoll.maxValue(formula) <= 0) { return; }
    if (consumable.system.quantity.value >= consumable.system.quantity.max && BaseRoll.minValue(formula) >= 0) {
      return;
    }
    const rollData = this.actors[0]?.getRollData?.() ?? consumable.getRollData?.() ?? {};
    const roll = new BaseRoll(formula, rollData, { flavor: _loc("TERIOCK.AUTOMATIONS.ChangeQuantity.USAGE.roll") });
    await roll.evaluate();
    const wrappers = [_loc("TERIOCK.AUTOMATIONS.Base.LABEL")];
    if (this.triggerLabel) { wrappers.push(this.triggerLabel); }
    const panelData = {
      bars: [{
        icon: TERIOCK.display.icons.pseudoDocument.automation,
        label: _loc("TERIOCK.SYSTEMS.Ability.PANELS.info"),
        wrappers,
      }],
      blocks: [{
        text: _loc("TERIOCK.AUTOMATIONS.ChangeQuantity.USAGE.description", {
          amount: roll.total.toString(),
          name: consumable.fullName,
        }),
        title: _loc("TERIOCK.SYSTEMS.Child.FIELDS.description.label"),
      }],
      icon: TERIOCK.display.icons.pseudoDocument.automation,
      img: consumable.img,
      label: _loc("TERIOCK.AUTOMATIONS.ChangeQuantity.LABEL"),
      name: _loc("TERIOCK.AUTOMATIONS.ChangeQuantity.LABEL"),
    };
    const messageData = {
      rolls: [roll],
      speaker: TeriockChatMessage.getSpeaker({ actor: this.actors[0] || consumable.actor }),
      system: { panels: [panelData] },
      type: "interactive",
    };
    TeriockChatMessage.applyMode(messageData, this.messageMode ?? game.settings.get("core", "messageMode"));
    await TeriockChatMessage.create(messageData);
    await consumable.update({
      "system.quantity.value": Math.clamp(
        consumable.system.quantity.value + roll.total,
        consumable.system.quantity.min,
        consumable.system.quantity.max,
      ),
    });
  }

  /** @inheritDoc */
  async primaryAction() {
    return this.#changeQuantity(this.formula);
  }

  /** @inheritDoc */
  async secondaryAction() {
    return this.#changeQuantity(multiplyFormula(this.formula, "-1"));
  }
}
