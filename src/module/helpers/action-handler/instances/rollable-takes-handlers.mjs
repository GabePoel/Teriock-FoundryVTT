import { boostDialog } from "../../../applications/dialogs/_module.mjs";
import { TeriockChatMessage, TeriockRoll } from "../../../documents/_module.mjs";
import { makeDamageTypeButtons } from "../../html.mjs";
import ActionHandler from "../action-handler.mjs";

/**
 * Action to roll a rollable take.
 */
export class RollRollableTakeHandler extends ActionHandler {
  /** @inheritDoc */
  static ACTION = "roll-rollable-take";

  /**
   * @property {string} formula - Roll formula
   */
  async _makeRoll(formula) {
    const roll = new TeriockRoll(formula);
    if (this.critRollOptions.crit) {
      roll.alter(2, 0, { multiplyNumeric: false });
    }
    await roll.evaluate();
    const buttons = [
      {
        label: ROLL_TYPES[this.dataset.type].label || "Apply",
        icon: `fa-solid fa-${ROLL_TYPES[this.dataset.type].icon || "plus"}`,
        classes: ["teriock-chat-button", `${this.dataset.type}-button`],
        dataset: {
          action: "take-rollable-take",
          type: this.dataset.type,
          amount: roll.total,
        },
      },
    ];
    const damageTypeButtons = makeDamageTypeButtons(roll);
    buttons.push(...damageTypeButtons);
    const messageData = {
      rolls: [roll],
      system: {
        buttons: buttons,
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
    const formula = await boostDialog(this.dataset.formula);
    await this._makeRoll(formula);
  }
}

/**
 * Action to take a rollable take.
 */
export class TakeRollableTakeHandler extends ActionHandler {
  /** @inheritDoc */
  static ACTION = "take-rollable-take";

  /** @inheritDoc */
  async primaryAction() {
    for (const actor of this.actors) {
      await ROLL_TYPES[this.dataset.type].callback(actor, this.dataset.amount);
    }
  }
}

/**
 * @typedef {object} ActionType
 * @property {string} label - Label
 * @property {string} icon - Icon
 * @property {(actor: TeriockActor, amount: number) => Promise<void>} callback - Callback Function
 */

/**
 * @type {Record<string, ActionType>}
 */
const ROLL_TYPES = {
  damage: {
    label: "Apply Damage",
    icon: "heart",
    callback: async (actor, amt) => await actor.takeDamage(amt),
  },
  drain: {
    label: "Apply Drain",
    icon: "brain",
    callback: async (actor, amt) => await actor.takeDrain(amt),
  },
  wither: {
    label: "Apply Wither",
    icon: "hourglass-half",
    callback: async (actor, amt) => await actor.takeWither(amt),
  },
  heal: {
    label: "Apply Healing",
    icon: "heart",
    callback: async (actor, amt) => await actor.takeHeal(amt),
  },
  revitalize: {
    label: "Apply Revitalization",
    icon: "brain",
    callback: async (actor, amt) => await actor.takeRevitalize(amt),
  },
  setTempHp: {
    label: "Set Temp HP",
    icon: "heart",
    callback: async (actor, amt) => await actor.takeSetTempHp(amt),
  },
  gainTempHp: {
    label: "Gain Temp HP",
    icon: "heart",
    callback: async (actor, amt) => await actor.takeGainTempHp(amt),
  },
  setTempMp: {
    label: "Set Temp MP",
    icon: "brain",
    callback: async (actor, amt) => await actor.takeSetTempMp(amt),
  },
  gainTempMp: {
    label: "Gain Temp MP",
    icon: "brain",
    callback: async (actor, amt) => await actor.takeGainTempMp(amt),
  },
  sleep: {
    label: "Check Sleep",
    icon: "bed",
    callback: async (actor, amt) => await actor.takeSleep(amt),
  },
  kill: {
    label: "Check Kill",
    icon: "skull",
    callback: async (actor, amt) => await actor.takeKill(amt),
  },
  pay: {
    label: "Pay Gold",
    icon: "coin",
    callback: async (actor, amt) => await actor.takePay(amt),
  },
};
