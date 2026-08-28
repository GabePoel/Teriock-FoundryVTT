import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { localizeChoices } from "../../../../helpers/localization.mjs";
import { prefixObject } from "../../../../helpers/utils.mjs";
import { competenceField, qualifierField } from "../../../fields/tools/builders.mjs";
import * as dataMixins from "../../../mixins/_module.mjs";
import TypedPseudoDocument from "../typed-pseudo-document/typed-pseudo-document.mjs";

const { fields } = foundry.data;

/**
 * @implements {Teriock.PseudoDocuments.MechanicPseudoDocumentData}
 * @mixes PropagationData
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
      activeQualifier: qualifierField({ initial: "1" }),
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
    return this.parent?.competence ? this.competencies.has(this.parent.competence.value) : true;
  }

  /**
   * Notification-style tips that appear in the editor form.
   * @returns {Teriock.UI.Tip[]}
   */
  get formTips() {
    return [];
  }

  /**
   * Whether this is ongoing.
   * @returns {boolean}
   * @todo Redo this handling with metadata and stuff.
   */
  get ongoing() {
    return !(this.document?.type === "ability" && this.document.system.maneuver !== "passive");
  }

  /**
   * The roll data used to evaluate something scope-dependent. Documents are scoped under `@mechanic`.
   * @param {Partial<Teriock.System.TriggerScope>} [scope]
   * @returns {object}
   */
  _getFireRollData(scope = {}) {
    const rollData = scope.rollData ?? scope.execution?.getRollData?.() ?? this.getRollData() ?? {};
    const doc = this.document;
    const effect = doc?.documentName === "ActiveEffect" ? doc : null;
    const item = doc?.documentName === "Item" ? doc : (effect?.parent?.documentName === "Item" ? effect.parent : null);
    return {
      ...rollData,
      ...(effect ? prefixObject(effect.system.getSystemRollData(), "mechanic") : {}),
      ...(item ? prefixObject(item.system.getSystemRollData(), "mechanic") : {}),
    };
  }

  /**
   * Whether this is qualified.
   * @param {object|(() => object)} [rollData]
   * @returns {boolean}
   */
  checkIfQualified(rollData) {
    return BaseRoll.qualify(this.activeQualifier, rollData ?? (() => this.getRollData()));
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

  /**
   * The competence this uses, falling back to the competence of its document.
   * @param {Partial<Teriock.System.TriggerScope>} _scope
   * @returns {Teriock.System.CompetenceLevel|undefined}
   */
  getCompetence(_scope) {
    return this.document?.system?.competence?.raw ?? 0;
  }

  /** @inheritDoc */
  prepareData() {
    super.prepareData();
    this.actor?.getEmbeddedCollection(this.documentName)?.set(this.uuid, this);
  }
}
