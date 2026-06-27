import { StatusAutomation } from "../../../pseudo-documents/automations/_module.mjs";
import { migrateKey } from "../../../shared/migrations/source-migrations.mjs";
import * as systemMixins from "../../mixins/_module.mjs";

const { ActiveEffectTypeDataModel, fields } = foundry.data;

/**
 * Base effect data model.
 * @extends {ActiveEffectTypeDataModel}
 * @extends {Teriock.Models.BaseEffectSystemData}
 * @mixes ChildSystem
 * @mixes AutomatedData
 */
export default class BaseEffectSystem extends systemMixins.ChildSystemMixin(ActiveEffectTypeDataModel) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.BaseEffect"];

  /** @inheritDoc */
  static PRESERVED_PROPERTIES = ["disabled", "duration", "tint", "transfer", ...super.PRESERVED_PROPERTIES];

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(ActiveEffectTypeDataModel.defineSchema(), {
      ...super.defineSchema(),
      applyIfDeattuned: new fields.BooleanField(),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options, state) {
    migrateKey(source, "mundane", "applyIfDeattuned");
    return super.migrateData(source, options, state);
  }

  /** @inheritDoc */
  get _displayMessagesSuppression() {
    const messages = super._displayMessagesSuppression;
    if (this._isSuppressedDampened) { this._addSuppressionMessage("dampened", messages); }
    if (this._isSuppressedDeattuned) { this._addSuppressionMessage("deattuned", messages); }
    if (this._isSuppressedDestroyed) { this._addSuppressionMessage("parentDestroyed", messages); }
    if (this._isSuppressedShattered) { this._addSuppressionMessage("shattered", messages); }
    if (this._isSuppressedStashed) { this._addSuppressionMessage("parentStashed", messages); }
    if (this._isSuppressedUnequipped) { this._addSuppressionMessage("parentUnequipped", messages); }
    return messages;
  }

  /** @inheritDoc */
  get _displayToggles() {
    return [...super._displayToggles, {
      label: _loc("TERIOCK.SYSTEMS.BaseItem.FIELDS.disabled.label"),
      path: "disabled",
    }];
  }

  /**
   * If this is suppressed due to its parent being dampened.
   * @returns {boolean}
   */
  get _isSuppressedDampened() {
    return Boolean(this.parent.parent?.type === "equipment" && this.parent.parent?.system.dampened);
  }

  /**
   * If this is suppressed due to its parent being deattuned.
   * @returns {boolean}
   */
  get _isSuppressedDeattuned() {
    return Boolean(this.actor && this.needsAttunement && !this.parent.parent?.system.isAttuned);
  }

  /**
   * If this is suppressed due to its parent being destroyed.
   * @returns {boolean}
   */
  get _isSuppressedDestroyed() {
    return Boolean(this.parent.parent?.type === "equipment" && this.parent.parent?.system.destroyed);
  }

  /** @inheritDoc */
  get _isSuppressedElder() {
    return ((this.parent.elder?.type !== "equipment"
      || (this.parent.elder?.type === "equipment" && this.parent.elder.system._isSuppressedConsumed))
      && super._isSuppressedElder);
  }

  /**
   * If this is suppressed due to its parent being shattered.
   * @returns {boolean}
   */
  get _isSuppressedShattered() {
    return Boolean(this.parent.parent?.type === "equipment" && this.parent.parent.system.shattered);
  }

  /**
   * If this is suppressed due to its parent being stashed.
   * @returns {boolean}
   */
  get _isSuppressedStashed() {
    return Boolean(this.parent.parent?.type === "equipment" && this.parent.parent.system.stashed);
  }

  /**
   * If this is suppressed due to its parent being unequipped.
   * @returns {boolean}
   */
  get _isSuppressedUnequipped() {
    return Boolean(this.parent.parent?.type === "equipment" && !this.parent.parent.system.equipped);
  }

  /** @inheritDoc */
  get _statusTags() {
    const tags = super._statusTags;
    if (this.needsAttunement) { tags.push("TERIOCK.SYSTEMS.Attunable.FIELDS.needsAttunement.true"); }
    return tags;
  }

  /**
   * Whether this can provide qualified changes.
   * @returns {boolean}
   */
  get canChange() {
    return this.automations.contents.some(a => a.metadata.changes);
  }

  /**
   * Changes to apply to children.
   * @returns {Teriock.Changes.QualifiedChangeData[]}
   */
  get childChanges() {
    return this.getAutomations("childChange", { active: true }).flatMap(a => a.getChanges());
  }

  /**
   * Whether this effect is a reference and not "real".
   * @returns {boolean}
   */
  get isReference() {
    const sups = /** @type {TeriockAbility[]} */ this.parent.allSups.contents;
    for (const sup of sups) { if (sup.type === "ability" && sup.system?.maneuver !== "passive") { return true; } }
    return super.isReference;
  }

  /**
   * Whether this is temporary due to type-specific behavior.
   * @returns {boolean}
   */
  get isTemporary() {
    return false;
  }

  /**
   * Changes to apply to the parent item.
   * @returns {Teriock.Changes.QualifiedChangeData[]}
   */
  get itemChanges() {
    return this.qualifiedChanges.flat().filter(c => c.target === "Item");
  }

  /** @inheritDoc */
  get makeSuppressed() {
    return (super.makeSuppressed
      || this._isSuppressedDampened
      || this._isSuppressedDeattuned
      || this._isSuppressedDestroyed
      || this._isSuppressedShattered
      || this._isSuppressedStashed
      || this._isSuppressedUnequipped);
  }

  /**
   * Whether this needs attunement to be active.
   * @returns {boolean}
   */
  get needsAttunement() {
    return (!this.applyIfDeattuned
      && ["equipment", "mount"].includes(this.parent.parent?.type)
      && Boolean(this.parent.parent?.system.needsAttunement));
  }

  /**
   * Gets the changes this ability would provide.
   * @returns {Teriock.Changes.QualifiedChangeData[]}
   */
  get qualifiedChanges() {
    const changes = [];
    for (const a of this.activeAutomations.filter(a => a.metadata.changes)) { changes.push(...a.getChanges()); }
    return changes;
  }

  /**
   * Expires the effect manually.
   * @returns {Promise<void>}
   */
  async expire() {
    if (CONFIG.ActiveEffect.expiryAction === "delete") { await this.parent.delete(); }
    else if (CONFIG.ActiveEffect.expiryAction === "update") { await this.parent.update({ "duration.expired": true }); }
  }

  /** @inheritDoc */
  getLocalRollData() {
    const data = super.getLocalRollData();
    for (const status of this.parent.statuses) { data[`condition.${status}`] = 1; }
    return data;
  }

  /** @inheritDoc */
  prepareBaseData() {
    super.prepareBaseData();
    const statusAutomations = /** @type {StatusAutomation[]} */ this.activeAutomations.filter(a =>
      a.type === StatusAutomation.TYPE
    );
    statusAutomations.forEach(a => {
      if (a.relation === "include") { this.parent.statuses.add(a.status); }
    });
  }

  /** @inheritDoc */
  prepareChangeData() {
    super.prepareChangeData();
    this.changes.push(...this.qualifiedChanges.filter(c => c.target === "Actor"));
  }
}
