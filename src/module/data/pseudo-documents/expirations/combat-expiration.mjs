import { localizeChoices } from "../../../helpers/localization.mjs";
import { combatExpirationSourceTypeField } from "../../fields/helpers/builders.mjs";
import { BaseExpiration } from "./abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {"action"|"combat"|"turn"|"round"} event
 * @property {"everyone"|"executor"|"target"} relation
 * @property {"start"|"end"} timing
 * @property {Teriock.System.FormulaString} skip
 */
export default class CombatExpiration extends BaseExpiration {
  /** @inheritDoc */
  static get TYPE() {
    return "combat";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      event: new fields.StringField({
        choices: localizeChoices({
          action: "TERIOCK.SCHEMA.CombatExpiration.when.trigger.choices.action",
          combat: "TERIOCK.SCHEMA.CombatExpiration.when.trigger.choices.combat",
          turn: "TERIOCK.SCHEMA.CombatExpiration.when.trigger.choices.turn",
        }),
        hint: _loc("TERIOCK.SCHEMA.CombatExpiration.when.trigger.hint"),
        initial: "turn",
        label: _loc("TERIOCK.SCHEMA.CombatExpiration.when.trigger.label"),
        required: true,
      }),
      relation: combatExpirationSourceTypeField(),
      skip: new fields.NumberField({
        hint: _loc("TERIOCK.SCHEMA.CombatExpiration.when.skip.hint"),
        initial: 0,
        label: _loc("TERIOCK.SCHEMA.CombatExpiration.when.skip.label"),
      }),
      timing: new fields.StringField({
        choices: localizeChoices({
          start: "TERIOCK.SCHEMA.CombatExpiration.when.time.choices.start",

          end: "TERIOCK.SCHEMA.CombatExpiration.when.time.choices.end",
        }),
        hint: _loc("TERIOCK.SCHEMA.CombatExpiration.when.time.hint"),
        initial: "start",
        label: _loc("TERIOCK.SCHEMA.CombatExpiration.when.time.label"),
        required: true,
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = [...super._formPaths, "timing", "event"];
    if (["action", "turn"].includes(this.event)) { paths.push("relation"); }
    paths.push("skip");
    return paths;
  }

  /** @inheritDoc */
  isRollEvent(event, context = {}) {
    return super.isRollEvent(event, context) && this.actor?.defaultUser?.isSelf;
  }

  /**
   * Check if the actor from an event's context is a valid actor.
   * @param {TeriockActor} actor
   */
  isValidActor(actor) {
    if (!actor) { return false; }
    if (this.relation === "target" && this.actor?.uuid === actor.uuid) { return true; }
    else if (this.relation === "executor" && this.document?.system?.executor === actor.uuid) { return true; }
    else if (this.relation === "everyone") { return true; }
    return false;
  }

  /** @inheritDoc */
  isValidEvent(event, context = {}) {
    return super.isValidEvent(event, context) && this.isValidActor(context.actor);
  }
}
