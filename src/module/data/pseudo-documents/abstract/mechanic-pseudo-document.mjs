import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import { localizeChoices } from "../../../helpers/localization.mjs";
import { FormulaField } from "../../fields/_module.mjs";
import { competenceField } from "../../fields/tools/builders.mjs";
import * as dataMixins from "../../mixins/_module.mjs";
import TypedPseudoDocument from "./typed-pseudo-document.mjs";

const { fields } = foundry.data;

/**
 * @extends {Teriock.PseudoDocuments.MechanicPseudoDocumentData}
 * @extends {TypedPseudoDocument}
 * @mixes PropagationData
 * @property {ID<MechanicPseudoDocument>} _id
 */
export default class MechanicPseudoDocument extends dataMixins.PropagationDataMixin(TypedPseudoDocument) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.MECHANICS.Base"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.MECHANICS.Base.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "base";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      activeQualifier: new FormulaField({ deterministic: true, initial: "1" }),
      competencies: new fields.SetField(competenceField(), { initial: [0, 1, 2] }),
      heighten: new fields.SetField(
        new fields.NumberField({
          choices: localizeChoices({
            0: "TERIOCK.MECHANICS.Base.FIELDS.heighten.choices.0",
            1: "TERIOCK.MECHANICS.Base.FIELDS.heighten.choices.1",
          }),
        }),
        { initial: [0, 1] },
      ),
    });
  }

  /**
   * Whether this is active and should be included in the overall effect.
   * @returns {boolean}
   */
  get active() {
    return this.competent && this.checkIfQualified();
  }

  /**
   * Whether this can crit.
   * @returns {boolean}
   */
  get canCrit() {
    return false;
  }

  /**
   * Whether the competence requirements for this to be active are met.
   * @returns {boolean}
   */
  get competent() {
    return this.competencies.has(this.parent.competence.value);
  }

  /**
   * Notification-style tips that appear in the editor form.
   * @returns {Teriock.UI.Tip[]}
   */
  get formTips() {
    return [];
  }

  /**
   * Whether this is qualified.
   * @param {object} [rollData]
   * @returns {boolean}
   */
  checkIfQualified(rollData) {
    return BaseRoll.qualify(this.activeQualifier, rollData ?? this.getRollData());
  }

  /**
   * Edit this pseudo-document's active qualifier.
   * @returns {Promise<void>}
   */
  async editActiveQualifier() {
    const editor = new foundry.applications.apps.FormulaEditor({
      context: "actor",
      formula: this.activeQualifier,
      window: { title: this.getFieldForProperty("activeQualifier")?.label },
    });
    editor.addEventListener("close", async () => {
      await this.document?.update({ [`${this.localPath}.activeQualifier`]: editor.formula });
    });
    await editor.render(true);
  }
}
