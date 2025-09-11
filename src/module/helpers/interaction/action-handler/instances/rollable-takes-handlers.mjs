import { boostDialog } from "../../../../applications/dialogs/_module.mjs";
import { TeriockRoll } from "../../../../dice/_module.mjs";
import { TeriockChatMessage } from "../../../../documents/_module.mjs";
import { makeDamageDrainTypeMessage, makeDamageTypeButtons } from "../../../html.mjs";
import { buildMessage } from "../../../messages-builder/message-builder.mjs";
import { getIcon } from "../../../path.mjs";
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
    let flavor = ROLL_TYPES[this.dataset.type].label;
    for (const s of [
      "Apply",
      "Set",
      "Gain",
      "Pay",
    ]) {
      flavor = flavor.replace(s, "").trim();
    }
    flavor = flavor + " Roll";
    const roll = new TeriockRoll(formula, {}, {
      flavor: flavor,
    });
    if (this.critRollOptions.crit) {
      roll.alter(2, 0, { multiplyNumeric: false });
    }
    await roll.evaluate();
    const buttons = [
      {
        label: ROLL_TYPES[this.dataset.type].label || "Apply",
        icon: `fa-solid fa-${ROLL_TYPES[this.dataset.type].icon || "plus"}`,
        classes: [
          "teriock-chat-button",
          `${this.dataset.type}-button`,
        ],
        dataset: {
          action: "take-rollable-take",
          type: this.dataset.type,
          amount: roll.total,
        },
      },
    ];
    const damageTypeButtons = makeDamageTypeButtons(roll);
    const damageDrainTypeMessage = await makeDamageDrainTypeMessage(roll);
    buttons.push(...damageTypeButtons);
    let messageStart = "";
    if (damageDrainTypeMessage.length > 0) {
      let image;
      let name;
      if (this.dataset.type === "damage") {
        image = getIcon("effect-types", "Damaging");
        name = "Damage";
      } else if (this.dataset.type === "drain") {
        image = getIcon("abilities", "Mana Drain Touch");
        name = "Drain";
      }
      const messageStartRaw = buildMessage({
        image: image,
        name: name,
      });
      messageStart = `<div class="teriock">${messageStartRaw.outerHTML}</div>`;
    }
    const messageData = {
      rolls: [ roll ],
      system: {
        buttons: buttons,
        extraContent: messageStart + damageDrainTypeMessage,
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
export const ROLL_TYPES = {
  damage: {
    label: "Apply Damage",
    icon: "heart-crack",
    callback: async (actor, amt) => await actor.takeDamage(amt),
  },
  drain: {
    label: "Apply Drain",
    icon: "droplet-slash",
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
    icon: "droplet",
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
    icon: "droplet",
    callback: async (actor, amt) => await actor.takeSetTempMp(amt),
  },
  gainTempMp: {
    label: "Gain Temp MP",
    icon: "droplet",
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
