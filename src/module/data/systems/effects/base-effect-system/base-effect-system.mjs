import {
  ChangesAutomation,
  ProtectionAutomation,
  StatusAutomation,
} from "../../../pseudo-documents/automations/_module.mjs";
import { ChildSystem } from "../../abstract/_module.mjs";

const { fields } = foundry.data;

//noinspection JSClosureCompilerSyntax
/**
 * Base effect data model.
 * @implements {Teriock.Models.BaseEffectSystemInterface}
 */
export default class BaseEffectSystem extends ChildSystem {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.SYSTEMS.BaseEffect",
  ];

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      modifies: "Actor",
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      deleteOnExpire: new fields.BooleanField({ initial: false }),
    });
  }

  /**
   * Gets the changes this ability would provide.
   * @returns {Teriock.Changes.QualifiedChangeData[]}
   */
  get changes() {
    const changes = [];
    const changesAutomations =
      /** @type {ChangesAutomation[]} */ this.activeAutomations.filter(
        (a) => a.type === ChangesAutomation.TYPE,
      );
    changesAutomations.forEach((a) => {
      changes.push(...a.changes);
    });
    changes.push(...this.pseudoHookChanges);
    const protectionAutomations =
      /** @type {ProtectionAutomation[]} */ this.activeAutomations.filter(
        (a) => a.type === ProtectionAutomation.TYPE,
      );
    protectionAutomations.forEach((a) => {
      if (a.protectionChange) changes.push(a.protectionChange);
    });
    return changes;
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
   * @returns {TeriockParentName}
   */
  get modifies() {
    return this.metadata.modifies;
  }

  /**
   * Changes corresponding to pseudo-hooks.
   * @returns {Teriock.Changes.QualifiedChangeData[]}
   */
  get pseudoHookChanges() {
    return [];
  }

  /** @inheritDoc */
  async _preDelete(options, user) {
    const data = { doc: this.parent };
    await this.parent.hookCall("effectExpiration", data, this.parent);
    if (data.cancel) return;
    await super._preDelete(options, user);
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
      const data = { doc: this.parent };
      await this.parent.hookCall("effectExpiration", data, this.parent);
      if (data.cancel) return;
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
    if (!this.parent.isTemporary) {
      return false;
    }
    return this.parent.duration.remaining < 0;
  }
}
