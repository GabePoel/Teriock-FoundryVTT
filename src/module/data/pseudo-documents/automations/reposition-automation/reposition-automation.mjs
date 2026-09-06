import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { localizeChoices } from "../../../../helpers/localization.mjs";
import { movementActionField, rollableFormulaField } from "../../../fields/tools/builders.mjs";
import { MoveActivation } from "../../activations/_module.mjs";
import { CritMechanicMixin } from "../../mixins/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";
import { DisplayAutomationMixin, TriggerAutomationMixin } from "../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @mixes DisplayAutomation
 * @mixes TriggerAutomation
 * @mixes CritMechanic
 */
export default class RepositionAutomation
  extends mixClasses(BaseAutomation, CritMechanicMixin, DisplayAutomationMixin, TriggerAutomationMixin)
{
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Move"];

  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { type: "move" });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      distance: rollableFormulaField(),
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
    return ["distance", ...this._originPaths, "movementAction", "hr", ...this._triggerDisplayPaths];
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

  /** @inheritDoc */
  async _getActivations(options = {}) {
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
}
