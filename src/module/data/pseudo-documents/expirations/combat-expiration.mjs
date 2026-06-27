import { localizeChoices } from "../../../helpers/localization.mjs";
import { BaseExpiration } from "./abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @property {Teriock.Keys.CombatEvent} event
 * @property {Teriock.Keys.CombatRelation} relation
 * @property {Teriock.Keys.CombatTiming} timing
 * @property {number} skip
 */
export default class CombatExpiration extends BaseExpiration {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.EXPIRATIONS.Combat"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.EXPIRATIONS.Combat.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "combat";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      event: new fields.StringField({
        choices: localizeChoices(TERIOCK.config.combat.event),
        initial: "turn",
        required: true,
      }),
      relation: new fields.StringField({
        choices: localizeChoices(TERIOCK.config.combat.relation),
        initial: "target",
        required: true,
      }),
      skip: new fields.NumberField({ initial: 0, integer: true, min: 0 }),
      timing: new fields.StringField({
        choices: localizeChoices(TERIOCK.config.combat.timing, { sort: false }),
        initial: "start",
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
  _validateExpirationAttempt(type, context) {
    const progress = super._validateExpirationAttempt(type, context) && context.event === this.event
      && context.timing === this.timing && this.isValidActor(context.actor);
    if (!progress || this.skip === 0) { return progress; }
    this.update({ skip: this.skip - 1 });
    return false;
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
}
