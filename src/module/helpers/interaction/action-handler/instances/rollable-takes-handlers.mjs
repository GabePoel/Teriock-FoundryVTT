import { boostDialog } from "../../../../applications/dialogs/_module.mjs";
import { TeriockRoll } from "../../../../dice/_module.mjs";
import { TeriockChatMessage } from "../../../../documents/_module.mjs";
import {
  makeDamageDrainTypePanels,
  makeDamageTypeButtons,
} from "../../../html.mjs";
import { getRollIcon, makeIconClass } from "../../../utils.mjs";
import ActionHandler from "../action-handler.mjs";

/**
 * Action to roll a rollable take.
 */
export class RollRollableTakeHandler extends ActionHandler {
  /** @inheritDoc */
  static ACTION = "roll-rollable-take";

  /**
   * @inheritDoc
   * @param {string} rollType
   * @param {string} formula
   * @returns {Teriock.UI.HTMLButtonConfig}
   */
  static buildButton(rollType, formula) {
    const button = super.buildButton();
    button.icon = makeIconClass(getRollIcon(formula), "button");
    button.label = TERIOCK.display.buttons.rollButtons[rollType].label;
    button.dataset.type = rollType;
    button.dataset.formula = formula;
    button.dataset.tooltip = formula;
    return button;
  }

  /**
   * @returns {string}
   */
  _makeFlavor() {
    let flavor = ROLL_TYPES[this.dataset.type].label;
    for (const s of ["Apply", "Set", "Gain", "Pay"]) {
      flavor = flavor.replace(s, "").trim();
    }
    flavor = flavor + " Roll";
    return flavor;
  }

  /**
   * @property {string} formula - Roll formula
   */
  async _makeRoll(formula) {
    const flavor = this._makeFlavor();
    const actor = game.actors.defaultActor;
    const roll = new TeriockRoll(formula, actor?.getRollData() || {}, {
      flavor: flavor,
    });
    if (this.critRollOptions.crit) {
      roll.alter(2, 0, { multiplyNumeric: false });
    }
    await roll.evaluate();
    const buttons = [
      TakeRollableTakeHandler.buildButton(this.dataset.type, roll.total),
    ];
    const damageTypeButtons = makeDamageTypeButtons(roll);
    const damageDrainPanels = await makeDamageDrainTypePanels(roll);
    buttons.push(...damageTypeButtons);
    const messageData = {
      speaker: TeriockChatMessage.getSpeaker({ actor: actor }),
      rolls: [roll],
      system: {
        avatar: actor?.img,
        buttons: buttons,
        panels: damageDrainPanels,
      },
    };
    await TeriockChatMessage.create(messageData);
  }

  /** @inheritDoc */
  async primaryAction() {
    await this._makeRoll(this.dataset.formula);
  }

  /** @inheritDoc */
  async secondaryAction() {
    const formula = await boostDialog(this.dataset.formula, {
      label: "Make " + this._makeFlavor(),
    });
    await this._makeRoll(formula);
  }
}

/**
 * Action to take a rollable take.
 */
export class TakeRollableTakeHandler extends ActionHandler {
  /** @inheritDoc */
  static ACTION = "take-rollable-take";

  /**
   * @inheritDoc
   * @param {string} rollType
   * @param {number} amount
   */
  static buildButton(rollType, amount) {
    const button = super.buildButton();
    button.icon = makeIconClass(ROLL_TYPES[rollType].icon || "plus", "button");
    button.label = ROLL_TYPES[rollType].label || "Apply";
    button.classes = ["teriock-chat-button", `${rollType}-button`];
    button.dataset.type = rollType;
    button.dataset.amount = amount.toString();
    return button;
  }

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      await ROLL_TYPES[this.dataset.type].callback(
        actor,
        Number(this.dataset.amount),
      );
    }
  }

  /** @inheritDoc */
  async secondaryAction() {
    for (const actor of this.actors) {
      await ROLL_TYPES[this.dataset.type].reverse(
        actor,
        Number(this.dataset.amount),
      );
    }
  }
}

/**
 * @typedef {object} ActionType
 * @property {string} label - Label
 * @property {string} icon - Icon
 * @property {(actor: TeriockActor, amount: number) => Promise<void>} callback - Callback Function
 * @property {(actor: TeriockActor, amount: number) => Promise<void>} reverse - Reverse callback Function
 */

/**
 * @type {Record<string, ActionType>}
 */
export const ROLL_TYPES = {
  damage: {
    label: "Apply Damage",
    icon: "heart-crack",
    callback: async (actor, amt) => await actor.system.takeDamage(amt),
    reverse: async (actor, amt) => await actor.system.takeHeal(amt),
  },
  drain: {
    label: "Apply Drain",
    icon: "droplet-slash",
    callback: async (actor, amt) => await actor.system.takeDrain(amt),
    reverse: async (actor, amt) => await actor.system.takeRevitalize(amt),
  },
  wither: {
    label: "Apply Wither",
    icon: "hourglass-half",
    callback: async (actor, amt) => await actor.system.takeWither(amt),
    reverse: async (actor, amt) => await actor.system.takeWither(-amt),
  },
  heal: {
    label: "Apply Healing",
    icon: "heart",
    callback: async (actor, amt) => await actor.system.takeHeal(amt),
    reverse: async (actor, amt) => await actor.system.takeDamage(amt),
  },
  revitalize: {
    label: "Apply Revitalization",
    icon: "droplet",
    callback: async (actor, amt) => await actor.system.takeRevitalize(amt),
    reverse: async (actor, amt) => await actor.system.takeDrain(amt),
  },
  setTempHp: {
    label: "Set Temp HP",
    icon: "heart",
    callback: async (actor, amt) => await actor.system.takeSetTempHp(amt),
    reverse: async (actor) => await actor.system.takeSetTempHp(0),
  },
  gainTempHp: {
    label: "Gain Temp HP",
    icon: "heart",
    callback: async (actor, amt) => await actor.system.takeGainTempHp(amt),
    reverse: async (actor) => await actor.system.takeSetTempHp(0),
  },
  setTempMp: {
    label: "Set Temp MP",
    icon: "droplet",
    callback: async (actor, amt) => await actor.system.takeSetTempMp(amt),
    reverse: async (actor) => await actor.system.takeSetTempMp(0),
  },
  gainTempMp: {
    label: "Gain Temp MP",
    icon: "droplet",
    callback: async (actor, amt) => await actor.system.takeGainTempMp(amt),
    reverse: async (actor) => await actor.system.takeSetTempMp(0),
  },
  sleep: {
    label: "Check Sleep",
    icon: "bed",
    callback: async (actor, amt) => await actor.system.takeSleep(amt),
    reverse: async (actor) =>
      await actor.toggleStatusEffect("asleep", { active: false }),
  },
  kill: {
    label: "Check Kill",
    icon: "skull",
    callback: async (actor, amt) => await actor.system.takeKill(amt),
    reverse: async (actor) =>
      await actor.toggleStatusEffect("dead", { active: false }),
  },
  pay: {
    label: "Pay Gold",
    icon: "coin",
    callback: async (actor, amt) => await actor.system.takePay(amt),
    reverse: async (actor, amt) => await actor.system.takePay(-amt),
  },
};
