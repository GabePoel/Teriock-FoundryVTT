import {
  AbilityMacroAutomation,
  ChangesAutomation,
  PropertyMacroAutomation,
  ProtectionAutomation,
  StatusAutomation,
} from "../../../pseudo-documents/automations/_module.mjs";
import { ChildSystem } from "../../abstract/_module.mjs";

const { fields, ActiveEffectTypeDataModel } = foundry.data;

/**
 * Base effect data model.
 * @extends {Teriock.Models.BaseEffectSystemInterface}
 * @extends {ChildSystem}
 */
export default class BaseEffectSystem extends ChildSystem {
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

  /**
   * @inheritDoc
   * @todo Make `BaseEffectSystem` extend `ActiveEffectTypeDataModel` by turning `ChildSystem` into a mixin.
   */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      deleteOnExpire: new fields.BooleanField({ initial: false }),
      ...ActiveEffectTypeDataModel.defineSchema(),
    });
  }

  /**
   * Whether this can change.
   * @returns {boolean}
   */
  get canChange() {
    const validTypes = [
      ChangesAutomation.TYPE,
      ProtectionAutomation.TYPE,
      AbilityMacroAutomation.TYPE,
      PropertyMacroAutomation.TYPE,
    ];
    return !!this.automations.contents.find((a) => validTypes.includes(a.type));
  }

  /** @inheritDoc */
  get displayToggles() {
    return [
      ...super.displayToggles,
      {
        label: game.i18n.localize(
          "TERIOCK.SYSTEMS.BaseItem.FIELDS.disabled.label",
        ),
        path: "disabled",
      },
    ];
  }

  /**
   * Whether this effect is a reference and not "real".
   * @returns {boolean}
   */
  get isReference() {
    return false;
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
   * Checks if the effect should expire and expires it if necessary.
   * @returns {Promise<void>}
   */
  async checkExpiration() {
    if (await this.shouldExpire()) {
      await this.expire();
    }
  }

  /**
   * Expires the effect, removing it from the parent document.
   * @returns {Promise<void>}
   */
  async expire() {
    if (!this.deleteOnExpire) {
      await this.parent.hookCall("effectExpiration");
    }
    if (this.deleteOnExpire) {
      await this.parent.delete();
    } else {
      await this.parent.update({ disabled: true });
    }
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
