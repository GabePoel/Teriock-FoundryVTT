import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { localizeChoices } from "../../../../helpers/localization.mjs";
import { mergeMetadata, mixClasses } from "../../../../utils/_module.mjs";
import { movementActionField, rollableFormulaField } from "../../../fields/tools/builders.mjs";
import { RepositionActivation } from "../../activations/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";
import { TriggerAutomationMixin } from "../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @extends {BaseAutomation}
 * @mixes TriggerAutomation
 */
export default class RepositionAutomation extends mixClasses(BaseAutomation, TriggerAutomationMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Move"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { tags: { interactInExecution: true }, type: "move" });

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

  /**
   * The origin token selected during an execution.
   * @type {TeriockTokenDocument|null|undefined}
   */
  #executionOrigin;

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

  /** @inheritDoc */
  get _triggerPaths() {
    const paths = super._triggerPaths;
    return this.selectsOrigin ? paths : paths.filter(p => p !== "interactInExecution");
  }

  /** @inheritDoc */
  get canHaveTriggers() {
    return !["executor", "target"].includes(this.origin) && super.canHaveTriggers;
  }

  /**
   * Whether this moves tokens in a random direction instead of from a specific point.
   * @returns {boolean}
   */
  get randomDirection() {
    return this.origin === "random";
  }

  /**
   * Whether the origin is a token someone selects.
   * @returns {boolean}
   */
  get selectsOrigin() {
    return ["chosen", "target"].includes(this.origin);
  }

  /** @inheritDoc */
  async _getActivations(options = {}) {
    const originToken = this.origin === "executor"
      ? options.execution?.executor?.document ?? null
      : this.#executionOrigin ?? null;
    const originMode = this.selectsOrigin && this.#executionOrigin === undefined ? this.origin : null;
    if (!this.randomDirection && !originToken && !originMode) { return []; }
    const distance = await BaseRoll.getValue(this.distance, options.rollData ?? {});
    return [
      new RepositionActivation({
        distance,
        movementAction: this.movementAction || null,
        originBarrier: this.originBarrier,
        originMode,
        originUuid: originToken?.uuid,
        randomDirection: this.randomDirection,
      }),
    ];
  }

  /** @inheritDoc */
  async cleanupExecution() {
    this.#executionOrigin = undefined;
  }

  /** @inheritDoc */
  async interactOnExecutionInput() {
    if (!this.interactInExecution || !this.selectsOrigin) { return; }
    const origin = await RepositionActivation.selectOrigin(this.origin, this.getNearestDocument()?.name);
    if (origin === false) { return false; }
    this.#executionOrigin = origin;
  }
}
