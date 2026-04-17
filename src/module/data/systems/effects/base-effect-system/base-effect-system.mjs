import {
  AbilityMacroAutomation,
  ChangesAutomation,
  PropertyMacroAutomation,
  ProtectionAutomation,
  StatusAutomation,
} from "../../../pseudo-documents/automations/_module.mjs";
import { ChildSystemMixin } from "../../mixins/_module.mjs";

const { fields, ActiveEffectTypeDataModel } = foundry.data;

/**
 * Base effect data model.
 * @extends {ActiveEffectTypeDataModel}
 * @extends {Teriock.Models.BaseEffectSystemData}
 * @mixes ChildSystem
 */
export default class BaseEffectSystem extends ChildSystemMixin(
  ActiveEffectTypeDataModel,
) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.SYSTEMS.BaseEffect",
  ];

  /** @inheritDoc */
  static PRESERVED_PROPERTIES = [
    "disabled",
    "duration",
    "tint",
    "transfer",
    ...super.PRESERVED_PROPERTIES,
  ];

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      modifies: "Actor",
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(ActiveEffectTypeDataModel.defineSchema(), {
      ...super.defineSchema(),
      deleteOnExpire: new fields.BooleanField({ initial: false }),
    });
  }

  /**
   * If this is suppressed due to its parent being dampened.
   * @returns {boolean}
   */
  get _isSuppressedDampened() {
    return !!(
      this.parent.parent?.type === "equipment" &&
      this.parent.parent.system.dampened
    );
  }

  /**
   * If this is suppressed due to its parent being deattuned.
   * @returns {boolean}
   */
  get _isSuppressedDeattuned() {
    return !!(
      (this.parent.parent?.type === "equipment" ||
        this.parent.parent?.type === "mount") &&
      !this.parent.parent.system.isAttuned
    );
  }

  /**
   * If this is suppressed due to its parent being destroyed.
   * @returns {boolean}
   */
  get _isSuppressedDestroyed() {
    return !!(
      this.parent.parent?.type === "equipment" &&
      this.parent.parent.system.destroyed
    );
  }

  /** @inheritDoc */
  get _isSuppressedElder() {
    return (
      (this.parent.elder?.type !== "equipment" ||
        (this.parent.elder?.type === "equipment" &&
          this.parent.elder.system._isSuppressedConsumed)) &&
      super._isSuppressedElder
    );
  }

  /**
   * If this is suppressed due to its parent being shattered.
   * @returns {boolean}
   */
  get _isSuppressedShattered() {
    return !!(
      this.parent.parent?.type === "equipment" &&
      this.parent.parent.system.shattered
    );
  }

  /**
   * If this is suppressed due to its parent being stashed.
   * @returns {boolean}
   */
  get _isSuppressedStashed() {
    return !!(
      this.parent.parent?.type === "equipment" &&
      this.parent.parent.system.stashed
    );
  }

  /**
   * If this is suppressed due to its parent being unequipped.
   * @returns {boolean}
   */
  get _isSuppressedUnequipped() {
    return !!(
      this.parent.parent?.type === "equipment" &&
      !this.parent.parent.system.equipped
    );
  }

  /**
   * Whether this can change.
   * @returns {boolean}
   */
  get canChange() {
    const validTypes = [
      AbilityMacroAutomation.TYPE,
      ChangesAutomation.TYPE,
      PropertyMacroAutomation.TYPE,
      ProtectionAutomation.TYPE,
    ];
    return !!this.automations.contents.find((a) => validTypes.includes(a.type));
  }

  /** @inheritDoc */
  get displayToggles() {
    return [
      ...super.displayToggles,
      {
        label: _loc("TERIOCK.SYSTEMS.BaseItem.FIELDS.disabled.label"),
        path: "disabled",
      },
    ];
  }

  /**
   * Whether this effect is a reference and not "real".
   * @returns {boolean}
   */
  get isReference() {
    const sups = /** @type {TeriockAbility[]} */ this.parent.allSups.contents;
    for (const sup of sups) {
      if (sup.type === "ability" && sup.system?.maneuver !== "passive") {
        return true;
      }
    }
    return super.isReference;
  }

  /** @inheritDoc */
  get makeSuppressed() {
    return (
      super.makeSuppressed ||
      this._isSuppressedDampened ||
      this._isSuppressedDeattuned ||
      this._isSuppressedDestroyed ||
      this._isSuppressedShattered ||
      this._isSuppressedStashed ||
      this._isSuppressedUnequipped
    );
  }

  /**
   * What this modifies.
   * @returns {ParentDocumentName}
   */
  get modifies() {
    return this.metadata.modifies;
  }

  /**
   * Gets the changes this ability would provide.
   * @returns {Teriock.Changes.QualifiedChangeData[]}
   */
  get qualifiedChanges() {
    const changes = [];
    const changesAutomations =
      /** @type {ChangesAutomation[]} */ this.activeAutomations.filter(
        (a) => a.type === ChangesAutomation.TYPE,
      );
    changesAutomations.forEach((a) => {
      changes.push(...a.changes);
    });
    const protectionAutomations =
      /** @type {ProtectionAutomation[]} */ this.activeAutomations.filter(
        (a) => a.type === ProtectionAutomation.TYPE,
      );
    protectionAutomations.forEach((a) => {
      if (a.protectionChange) changes.push(a.protectionChange);
    });
    return changes;
  }

  /**
   * Expires the effect, removing it from the parent document.
   * @returns {Promise<void>}
   */
  async expire() {
    if (!this.deleteOnExpire) {
      await this.parent.hookCall("effectExpiration");
    }
    if (this.deleteOnExpire) await this.parent.delete();
    else await this.parent.update({ disabled: true });
  }

  /** @inheritDoc */
  getLocalRollData() {
    const data = super.getLocalRollData();
    for (const status of this.parent.statuses) {
      data[`condition.${status}`] = 1;
    }
    return data;
  }

  /** @inheritDoc */
  prepareBaseData() {
    super.prepareBaseData();
    const statusAutomations =
      /** @type {StatusAutomation[]} */ this.activeAutomations.filter(
        (a) => a.type === StatusAutomation.TYPE,
      );
    statusAutomations.forEach((a) => {
      if (a.relation === "include") {
        this.parent.statuses.add(a.status);
      }
    });
  }

  /**
   * Checks if the effect should expire based on its current state.
   * @returns {Promise<boolean>} True if the effect should expire, false otherwise.
   */
  async shouldExpire() {
    if (!this.parent.isTemporary) return false;
    return this.parent.duration.remaining < 0;
  }
}
