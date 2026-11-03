import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { mergeMetadata, mixClasses, prefixObject, toId } from "../../../../utils/_module.mjs";
import { FormulaField } from "../../../fields/_module.mjs";
import { qualifierField } from "../../../fields/tools/builders.mjs";
import { PropagationDataMixin } from "../../../mixins/_module.mjs";
import BasePseudoDocument from "../base-pseudo-document/base-pseudo-document.mjs";

const { fields } = foundry.data;

/**
 * Scope keys whose string values become `@<key>.<value>` flags in fire roll data.
 * @todo Move this into `fireTrigger` maybe?
 */
const SCOPE_FLAG_KEYS = ["attribute", "mode", "part", "tradecraft"];

/** Scope keys whose documents are compared against this mechanic's own as `@this.<key>` flags. */
const SCOPE_RELATION_KEYS = ["ability", "actor", "armament", "effect", "item", "source"];

/**
 * @extends {BasePseudoDocument}
 * @mixes PropagationData
 */
export default class MechanicPseudoDocument extends mixClasses(BasePseudoDocument, PropagationDataMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.MECHANICS.Base"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { tags: { mechanic: true } });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      activeQualifier: qualifierField({ initial: "1" }),
      disabledToggles: new fields.SetField(new fields.StringField()),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options) {
    if (["competencies", "crit", "heighten"].some(k => k in source)) {
      const disabled = new Set([...(source.disabledToggles ?? []), "resultsAlt", "resultsAltCrit"]);
      const crit = source.crit ?? [0, 1];
      if (!crit.includes(0)) { disabled.add("resultsBase"); }
      if (!crit.includes(1)) { disabled.add("resultsBaseCrit"); }
      const heighten = source.heighten ?? [0, 1];
      if (!heighten.includes(0)) { disabled.add("unheightened"); }
      if (!heighten.includes(1)) { disabled.add("heightened"); }
      const competencies = source.competencies ?? [0, 1, 2];
      for (const [level, { toggle }] of Object.entries(TERIOCK.CONFIG.competence.levels)) {
        if (!competencies.includes(Number(level))) { disabled.add(toggle); }
      }
      source.disabledToggles = Array.from(disabled);
      delete source.competencies;
      delete source.crit;
      delete source.heighten;
    }
    return super.migrateData(source, options);
  }

  /** @inheritDoc */
  get _inputContextKey() {
    return "trigger";
  }

  /**
   * Whether this is active and should be included in the overall effect.
   * @returns {boolean}
   */
  get active() {
    return this.competent && this.checkIfQualified();
  }

  /**
   * Whether the competence requirements for this to be active are met.
   * @returns {boolean}
   */
  get competent() {
    if (!this.parent?.competence) { return true; }
    return !this.disabledToggles.has(TERIOCK.CONFIG.competence.levels[this.parent.competence.value].toggle);
  }

  /**
   * Notification-style tips that appear in the editor form.
   * @returns {Teriock.UI.Tip[]}
   */
  get formTips() {
    return [];
  }

  /**
   * Whether this has an active qualifier set.
   * @returns {boolean}
   */
  get hasActiveQualifierSet() {
    return this.activeQualifier !== "1";
  }

  /**
   * Whether this applies passively rather than only when its document is used.
   * @returns {boolean}
   */
  get isPassive() {
    return this.getNearestDocument()?.system?.isPassive ?? true;
  }

  /**
   * Whether this contributes to chat data if its document makes any.
   * @returns {boolean}
   */
  get makesChatData() {
    return false;
  }

  /**
   * Whether this contributes to effect data if its document makes any.
   * @returns {boolean}
   */
  get makesEffectData() {
    return true;
  }

  /**
   * Whether this modifies the chat data its document makes.
   * @returns {boolean}
   */
  get modifiesChatData() {
    return (this.getNearestDocument() ? Boolean(this.getNearestDocument().system?.makesChatData) : true)
      && this.makesChatData;
  }

  /**
   * Whether this modifies the effect data its document makes.
   * @returns {boolean}
   */
  get modifiesEffectData() {
    return Boolean(this.getNearestDocument()?.system?.makesEffectData) && this.makesEffectData;
  }

  /**
   * Grouped toggles that will be displayed on this.
   * @returns {Record<string, Teriock.Mechanics.MechanicToggleState[]>}
   */
  get toggles() {
    const doc = this.getNearestDocument();
    if (!doc) { return {}; }
    /** @type {Teriock.Mechanics.MechanicToggleEntry[]} */
    const entries = doc.system?.mechanicToggles ?? [];
    return Object.groupBy(
      entries.filter(t => t.visible?.(this, doc) ?? true).map(t => ({ ...t, active: !this.disabledToggles.has(t.id) })),
      t => t.group,
    );
  }

  /**
   * The roll data used to evaluate a fired trigger. The event is under `@source` and this mechanic is under `@this`.
   * @param {Partial<Teriock.System.TriggerScope>} [scope]
   * @returns {object}
   */
  _getFireRollData(scope = {}) {
    const rollData = { ...(scope.execution?.getRollData() ?? (scope.actor ?? this.actor)?.getRollData() ?? {}) };
    if (!scope.execution && scope.source?.system?.getLocalRollData) {
      Object.assign(rollData, prefixObject(scope.source.system.getLocalRollData(), "source"));
    }
    rollData.amount = scope.amount ?? 0;
    for (const key of SCOPE_FLAG_KEYS) { if (scope[key]) { rollData[`${key}.${scope[key]}`] = 1; } }
    Object.assign(rollData, this._getOwnRollData());
    for (const key of SCOPE_RELATION_KEYS) { rollData[`this.${key}`] = Number(this.isOwnDocument(scope[key])); }
    return rollData;
  }

  /**
   * The roll data of this mechanic's own nearest effect and item under `this.effect` and `this.item`.
   * @returns {object}
   */
  _getOwnRollData() {
    const doc = this.getNearestDocument();
    return doc && doc.documentName !== "Actor" ? doc.system.getSystemRollData() : {};
  }

  /**
   * Whether this is qualified.
   * @param {object|(() => object)} [rollData]
   * @returns {boolean}
   */
  checkIfQualified(rollData) {
    if (!this.hasActiveQualifierSet) { return true; }
    if (!rollData) { return BaseRoll.qualify(this.activeQualifier, () => this.getRollData()); }
    return BaseRoll.qualify(
      this.activeQualifier,
      () => ({ ...(typeof rollData === "function" ? rollData() : rollData), ...this._getOwnRollData() }),
    );
  }

  /**
   * Edit this pseudo-document's active qualifier.
   * @returns {Promise<void>}
   */
  async editActiveQualifier() {
    const editor = new foundry.applications.apps.FormulaEditor({
      context: this._inputContextKey,
      formula: this.activeQualifier,
      window: { title: this.getFieldForProperty("activeQualifier")?.label },
    });
    editor.addEventListener("close", async () => {
      await this.getNearestDocument()?.update({ [`${this.localPath}.activeQualifier`]: editor.formula });
    });
    await editor.render(true);
  }

  /**
   * The competence this uses, falling back to the competence of its document.
   * @param {Partial<Teriock.System.TriggerScope>} _scope
   * @returns {Teriock.System.CompetenceLevel|undefined}
   */
  getCompetence(_scope) {
    return this.getNearestDocument()?.system?.competence?.raw ?? 0;
  }

  /**
   * Data for the copy of this attached to effects generated by an execution.
   * @param {BaseExecution} execution
   * @returns {object}
   */
  getEffectData(execution) {
    const data = this.toObject();
    this.schema.apply(function(value) {
      if (!(this instanceof fields.SchemaField) || !value || typeof value !== "object") { return; }
      for (const [key, field] of this.entries()) {
        if (field instanceof FormulaField && typeof value[key] === "string") {
          value[key] = execution._resolveString(value[key]);
        }
      }
    }, data);
    return data;
  }

  /**
   * Whether a document is the nearest document of its kind to this.
   * @param {unknown} doc
   * @returns {boolean}
   */
  isOwnDocument(doc) {
    if (!(doc instanceof foundry.abstract.Document) || !doc.uuid) { return false; }
    return this.getNearestDocument(doc.documentName)?.uuid === doc.uuid;
  }

  /** @inheritDoc */
  prepareData() {
    super.prepareData();
    const uuid = this.uuid;
    if (uuid && this.getNearestDocument()?.documentName !== "Actor") {
      this.actor?.getEmbeddedCollection(this.documentName)?.set(toId(uuid, { hash: true }), this);
    }
  }
}
