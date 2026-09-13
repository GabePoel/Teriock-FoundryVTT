import { mergeMetadata, mixClasses } from "../../../../helpers/construction.mjs";
import { addFormula, formulaExists } from "../../../../helpers/formula.mjs";
import { FormulaField, TernaryField } from "../../../fields/_module.mjs";
import { OverrideCompetencePseudoDocumentMixin, OverrideDataPseudoDocumentMixin } from "../../mixins/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @mixes OverrideDataPseudoDocument
 * @mixes OverrideCompetenceMechanic
 */
export default class OverrideAutomation
  extends mixClasses(BaseAutomation, OverrideDataPseudoDocumentMixin, OverrideCompetencePseudoDocumentMixin)
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Override"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { type: "override" });

  /** @inheritDoc */
  static get _setCompetenceInitial() {
    return undefined;
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      makeCritEffect: new TernaryField(),
      makeEffect: new TernaryField(),
      preventAttack: new fields.BooleanField({ initial: false }),
      preventBlockCone: new fields.BooleanField({ initial: false }),
      preventFeat: new fields.BooleanField({ initial: false }),
      preventThreshold: new fields.BooleanField({ initial: false }),
      rollBonus: new FormulaField({ deterministic: false, placeholder: "0" }),
      targetsActor: new TernaryField(),
      targetsArmament: new TernaryField(),
    });
  }

  /** @inheritDoc */
  get _executionPriority() {
    return 1;
  }

  /** @inheritDoc */
  get _formPaths() {
    return [
      "display.label",
      "makeEffect",
      "makeCritEffect",
      "targetsActor",
      "targetsArmament",
      "hr",
      "rollBonus",
      "hr",
      ...this._preventPaths,
      ...this._competencePaths,
      ...this._overrideDataPaths,
    ];
  }

  /**
   * Prevent fields relevant to the parent ability.
   * @returns {string[]}
   */
  get _preventPaths() {
    if (this.document?.type !== "ability") { return []; }
    const paths = [];
    if (this.document.system.interaction === "attack") { paths.push("preventAttack"); }
    if (this.document.system.interaction === "feat") { paths.push("preventFeat", "preventThreshold"); }
    if (this.document.system.delivery === "cone") { paths.push("preventBlockCone"); }
    if (paths.length) { paths.push("hr"); }
    return paths;
  }

  /** @inheritDoc */
  get canModifyEffectData() {
    return this.setCompetence || this.overrideData || super.canModifyEffectData;
  }

  /** @inheritDoc */
  async modifyExecution(execution) {
    for (
      const k of [
        "makeCritEffect",
        "makeEffect",
        "preventAttack",
        "preventBlockCone",
        "preventFeat",
        "preventThreshold",
        "targetsActor",
        "targetsArmament",
      ]
    ) {
      if (typeof this[k] === "boolean") { execution.updateSource({ [k]: this[k] }); }
    }
  }

  /** @inheritDoc */
  async modifyExecutionConstruction(execution) {
    if (!formulaExists(this.rollBonus)) { return; }
    execution.updateSource({ bonus: addFormula(execution.bonus, this.rollBonus) });
    if (typeof execution.rootBonus === "string") {
      execution.rootBonus = addFormula(execution.rootBonus, this.rollBonus);
    }
  }

  /** @inheritDoc */
  async modifyExecutionEffectActivation(_execution, activation) {
    if (this.display.label) { activation.updateSource({ "display.label": this.display.label }); }
  }

  /** @inheritDoc */
  async modifyExecutionEffectData(execution, data) {
    await super.modifyExecutionEffectData(execution, data);
    const competence = this.getCompetence({ execution });
    if (typeof competence === "number") { foundry.utils.setProperty(data, "system.competence.raw", competence); }
    if (this.overrideData && this.data) { foundry.utils.mergeObject(data, this.data, { inplace: true }); }
  }
}
