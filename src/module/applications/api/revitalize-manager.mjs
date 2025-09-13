import {
  RollRollableTakeHandler,
} from "../../helpers/interaction/action-handler/instances/rollable-takes-handlers.mjs";
import TeriockStatManager from "./stat-manager.mjs";

const { fields } = foundry.data;

export default class TeriockHealManager extends TeriockStatManager {
  static DEFAULT_OPTIONS = {
    actions: {
      rollStatDie: this._rollStatDie,
    },
    window: {
      icon: "fa-solid fa-hand-holding-drop",
      title: "Revitalizing",
      resizable: false,
    },
  };

  static PARTS = {
    all: {
      template: "systems/teriock/src/templates/dialog-templates/revitalize.hbs",
      scrollable: [ "" ],
    },
  };

  /**
   * Creates a new revitalization manager instance.
   * @param {TeriockActor} actor
   * @param {...any} args
   */
  constructor(actor, ...args) {
    super(actor, ...args);
    this._forHarm = false;
    this._forHarmField = new fields.BooleanField({
      initial: false,
      label: "For Drain",
      hint: "Check this is the revitalizing should be done for drain.",
    });
    this._consumeStatDice = true;
    this._consumeStatDiceField = new fields.BooleanField({
      initial: true,
      label: "Consume Mana Dice",
      hint: "Check this if mana dice should be consumed on use.",
    });
  }

  /** @inheritDoc */
  static async _rollStatDie(event, target) {
    const id = target.dataset.id;
    const parentId = target.dataset.parentId;
    const stat = target.dataset.stat;
    /** @type {StatDieModel} */
    const statDie = this.actor.items
      .get(parentId)
      ["system"][`${stat}Dice`][id];
    //noinspection JSUnresolvedReference
    if (this._forHarm) {
      const takeHandler = new RollRollableTakeHandler(event, target);
      takeHandler.dataset = {
        type: "drain",
        formula: `${statDie.formula}`,
      };
      await takeHandler.secondaryAction();
    } else {
      let criticallyWounded = this.actor.statuses.has("criticallyWounded");
      //noinspection JSUnresolvedReference
      await statDie.rollStatDie(this._consumeStatDice);
      if (!criticallyWounded) {
        await this.actor.system.takeAwaken();
      }
    }
  }
}
