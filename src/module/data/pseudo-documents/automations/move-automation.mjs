import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import { mixClasses } from "../../../helpers/construction.mjs";
import { localizeChoices } from "../../../helpers/localization.mjs";
import { FormulaField } from "../../fields/_module.mjs";
import { movementActionField } from "../../fields/helpers/builders.mjs";
import { MoveActivation } from "../activations/_module.mjs";
import { BaseAutomation } from "./abstract/_module.mjs";
import { DisplayAutomationMixin } from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {"chosen"|"executor"|"random"|"target"} origin
 * @property {Teriock.System.FormulaString} distance
 * @property {boolean} originBarrier
 * @property {string} movementAction
 * @mixes DisplayAutomation
 */
export default class MoveAutomation extends mixClasses(BaseAutomation, DisplayAutomationMixin) {
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Move"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.Move.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "move";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      distance: new FormulaField({ deterministic: false, initial: "0" }),
      movementAction: movementActionField({ blank: true, initial: null, nullable: true, required: false }),
      origin: new fields.StringField({
        choices: localizeChoices({
          chosen: "TERIOCK.AUTOMATIONS.Move.FIELDS.origin.choices.chosen",
          executor: "TERIOCK.AUTOMATIONS.Move.FIELDS.origin.choices.executor",
          random: "TERIOCK.AUTOMATIONS.Move.FIELDS.origin.choices.random",
          target: "TERIOCK.AUTOMATIONS.Move.FIELDS.origin.choices.target",
        }),
        initial: "executor",
        required: true,
      }),
      originBarrier: new fields.BooleanField({ initial: true }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["distance", ...this._originPaths, "movementAction", ...this._displayPaths];
  }

  /**
   * Origin paths.
   * @returns {string[]}
   */
  get _originPaths() {
    const paths = ["origin"];
    if (this.origin !== "random") { paths.push("originBarrier"); }
    return paths;
  }

  /**
   * Whether this moves tokens in a random direction instead of from a specific point.
   * @returns {boolean}
   */
  get randomDirection() {
    return this.origin === "random";
  }

  /**
   * Get the movement's origin token.
   * @param {AbilityExecution} execution
   * @returns {Promise<TeriockTokenDocument|null>}
   */
  async _getOriginToken(execution) {
    if (this.origin === "executor" && execution?.executor?.document?.uuid) { return execution.executor.document; }
    else if (this.origin === "target") {
      return game.user.selectTargetedToken({
        title: _loc("TERIOCK.AUTOMATIONS.Move.DIALOGS.SelectToken.title", { name: this.document?.name || "" }),
      });
    } else if (this.origin === "chosen") {
      return game.user.selectVisibleToken({
        title: _loc("TERIOCK.AUTOMATIONS.Move.DIALOGS.SelectToken.title", { name: this.document?.name || "" }),
      });
    }
    return null;
  }

  /** @inheritDoc */
  async getActivations(options = {}) {
    const originToken = await this._getOriginToken(options.execution);
    if (!this.randomDirection && !originToken) { return []; }
    const distance = await BaseRoll.getValue(this.distance, options.rollData ?? {});
    return [
      new MoveActivation({
        display: this.display,
        distance,
        movementAction: this.movementAction || null,
        originBarrier: this.originBarrier,
        randomDirection: this.randomDirection,
        token: originToken?.uuid,
      }),
    ];
  }
}
