import { FormulaField, TernaryField } from "../../fields/_module.mjs";
import { AttackActivation } from "../activations/_module.mjs";
import { OverrideCompetenceMechanicMixin } from "../mixins/_module.mjs";
import { ThresholdAutomation } from "./abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * An automation that makes an attack roll with no ability associated with it.
 * @extends {ThresholdAutomation}
 * @mixes OverrideCompetenceMechanic
 * @property {Teriock.System.FormulaString} attackPenalty
 * @property {boolean|null} limb
 * @property {boolean|null} sb
 * @property {boolean} useArmament
 * @property {boolean} keepArmament
 * @property {boolean|null} vitals
 * @property {boolean|null} warded
 * @see {AttackRollExecution}
 */
export default class AttackAutomation extends OverrideCompetenceMechanicMixin(ThresholdAutomation) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Attack"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.TERMS.Interaction.attack";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "attack";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      attackPenalty: new FormulaField({ deterministic: false, initial: "" }),
      keepArmament: new fields.BooleanField({ initial: true }),
      limb: new TernaryField(),
      sb: new TernaryField({ label: "TERIOCK.SYSTEMS.BaseActor.FIELDS.offense.sb.label" }),
      useArmament: new fields.BooleanField({ initial: true }),
      vitals: new TernaryField({ label: "TERIOCK.SYSTEMS.Armament.FIELDS.vitals.label" }),
      warded: new TernaryField({ label: "TERIOCK.SYSTEMS.Attack.FIELDS.warded.label" }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = ["useArmament"];
    if (this.useArmament) { paths.push("keepArmament"); }
    return [...paths, "sb", "vitals", "limb", "warded", "attackPenalty", ...super._formPaths];
  }

  /** @inheritDoc */
  async getActivations(options) {
    const threshold = await this.getThreshold(options?.rollData ?? {});
    return [
      new AttackActivation({
        armamentId: this.keepArmament ? (options.armament ?? options.execution?.armament)?.id : undefined,
        attackPenalty: this.attackPenalty,
        bonus: this.bonus,
        competence: { raw: this.getCompetence(options) },
        display: this.getDisplayData(threshold),
        limb: this.limb,
        sb: this.sb,
        threshold,
        useArmament: this.useArmament,
        vitals: this.vitals,
        warded: this.warded,
      }),
    ];
  }

  /** @inheritDoc */
  getDisplayData(threshold) {
    return { tooltip: typeof threshold === "number" ? _loc("TERIOCK.ROLLS.Attack.ac", { threshold }) : null };
  }
}
