// Allows for typing within mixin.
/** @import ActiveEffect from "@client/documents/active-effect.mjs"; */
const { ActiveEffect } = foundry.documents;
import { ChildDocumentMixin } from "./mixins/child-mixin.mjs";

/**
 * @extends {ActiveEffect}
 */
export default class TeriockEffect extends ChildDocumentMixin(ActiveEffect) {
  /**
   * @todo Move this logic to TeriockAbilityData as appropriate.
   * @inheritdoc
   */
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.type === "ability" && this.system.maneuver === "passive") {
      if (this.system.applies.base.changes.length > 0) {
        this.changes = this.system.applies.base.changes;
      }
      if (this.system.isProficient) {
        if (this.system.applies.proficient.changes.length > 0) {
          this.changes = this.system.applies.proficient.changes;
        }
      }
      if (this.system.isFluent) {
        if (this.system.applies.fluent.changes.length > 0) {
          this.changes = this.system.applies.fluent.changes;
        }
      }
    }
  }

  /**
   * Gets the ability that provides this, if there is one.
   * @returns {parent: TeriockEffect | null}
   */
  getParent() {
    if (this.system.parentUuid) {
      return foundry.utils.fromUuidSync(this.system.parentUuid);
    }
    return null;
  }

  /**
   * Get whatever Document most directly applies this. If it's an ability, it
   * returns that. Otherwise, gets what Foundry considers to be the parent.
   * @returns {source: Document}
   */
  getSource() {
    let source = this.getParent();
    if (!source) {
      source = this.parent;
    }
    return source;
  }

  /**
   * @returns {children: ActiveEffect[]}
   */
  getChildren() {
    const children = [];
    if (this.system.childIds?.length > 0) {
      for (const uuid of this.system.childUuids) {
        const child = foundry.utils.fromUuidSync(uuid);
        children.push(child);
      }
    }
    return children;
  }

  /**
   * @returns {Promise<ActiveEffect[]>}
   */
  async getChildrenAsync() {
    const children = [];
    if (this.system.childUuids?.length > 0) {
      for (const uuid of this.system.childUuids) {
        const child = await foundry.utils.fromUuid(uuid);
        children.push(child);
      }
    }
    return children;
  }

  /**
   * @returns {Promise<Void>}
   */
  async saveFamily() {
    const children = this.getChildren();
    const childUuids = children.map((child) => child.uuid);
    const parent = this.getParent();
    const parentUuid = parent ? parent.uuid : null;
    await this.update({
      "system.childUuids": childUuids,
      "system.parentUuid": parentUuid,
    });
  }

  /**
   * @returns {Promise<Void>}
   */
  async unsaveFamily() {
    await this.update({
      "system.childUuids": [],
      "system.parentUuid": null,
    });
  }

  /**
   * @todo Create addChild and setParent methods to handle this more generally.
   * @override
   */
  async duplicate() {
    const copy = await super.duplicate();
    const parent = copy.getParent();
    if (parent) {
      const parentChildIds = parent.system.childIds || [];
      parentChildIds.push(copy.id);
      await parent.update({
        "system.childIds": parentChildIds,
      });
    }
  }

  /**
   * @returns {descendants: ActiveEffect[]}
   */
  getDescendants() {
    const descendants = [];
    const children = this.getChildren();
    for (const child of children) {
      descendants.push(child);
      descendants.push(...child.getDescendants());
    }
    return descendants;
  }

  /**
   * @param {boolean} descendants - If true, gets only the descendants of this
   * regardless of whether or not this is force disabled.
   * @returns {notForceDisabled: ActiveEffect[]}
   */
  getNotForceDisabled(descendants = false) {
    const notForceDisabled = [];
    if (descendants || !this.system.forceDisabled) {
      const children = this.getChildren();
      for (const child of children) {
        const toPush = child.getNotForceDisabled();
        for (const p of toPush) {
          notForceDisabled.push(p);
        }
      }
    }
    if (!descendants && !this.system.forceDisabled) {
      notForceDisabled.push(this);
    }
    return notForceDisabled;
  }

  /**
   * @returns {Promise<void>}
   */
  async deleteChildren() {
    if (this.system?.childIds?.length > 0) {
      const childIds = this.system.childIds;
      await this.update({
        "system.childIds": [],
      });
      await this.parent?.deleteEmbeddedDocuments("ActiveEffect", childIds);
    }
  }

  /**
   * @returns {Promise<void>}
   */
  async softEnable() {
    const updateCandidates = this.getNotForceDisabled();
    const updates = updateCandidates.map((effect) => {
      return { _id: effect.id, disabled: false };
    });
    this.parent.updateEmbeddedDocuments("ActiveEffect", updates);
  }

  /**
   * @returns {Promise<void>}
   */
  async softDisable() {
    const updateCandidates = this.getDescendants();
    updateCandidates.push(this);
    const updates = updateCandidates.map((effect) => {
      return { _id: effect.id, disabled: true };
    });
    this.parent.updateEmbeddedDocuments("ActiveEffect", updates);
  }

  /**
   * @returns {Promise<void>}
   */
  async hardEnable() {
    const updateCandidates = this.getNotForceDisabled(true);
    const updates = updateCandidates.map((effect) => {
      return { _id: effect.id, disabled: false };
    });
    updates.push({
      _id: this.id,
      disabled: false,
      "system.forceDisabled": false,
    });
    this.parent.updateEmbeddedDocuments("ActiveEffect", updates);
  }

  /**
   * @returns {Promise<void>}
   */
  async hardDisable() {
    const updateCandidates = this.getDescendants();
    updateCandidates.push(this);
    const updates = updateCandidates.map((effect) => {
      return { _id: effect.id, disabled: true };
    });
    updates.push({
      _id: this.id,
      disabled: true,
      "system.forceDisabled": true,
    });
    this.parent.updateEmbeddedDocuments("ActiveEffect", updates);
  }

  /**
   * @param {boolean} bool
   * @returns {Promise<void>}
   */
  async setSoftDisabled(bool) {
    if (bool) {
      await this.softDisable();
    } else {
      await this.softEnable();
    }
  }

  /**
   * @returns {Promise<void>}
   */
  async toggleSoftDisabled() {
    await this.setSoftDisabled(!this.disabled);
  }

  /**
   * @todo A lot of this logic should be moved to data classes.
   * @param {boolean} bool
   * @returns {Promise<void>}
   */
  async setForceDisabled(bool) {
    const shouldEnable = !this.system.consumable || (this.system.consumable && this.system.quantity >= 1);
    const parentDisabled =
      (this.parent?.system?.disabled ?? false) ||
      (this.getParent()?.disabled ?? false) ||
      (this.getParent()?.system?.forceDisabled ?? false);
    if (parentDisabled) {
      ui.notifications.error(`You cannot ${bool ? "enable" : "disable"} ${this.name} while its parent is disabled.`);
    }
    if (!parentDisabled) {
      if (bool) {
        await this.hardDisable();
      } else {
        if (shouldEnable) {
          await this.hardEnable();
        }
      }
    }
  }

  /**
   * @returns {Promise<void>}
   */
  async toggleForceDisabled() {
    await this.setForceDisabled(!this.system.forceDisabled);
  }

  /**
   * @returns {Promise<void>}
   */
  async disable() {
    await this.setForceDisabled(true);
  }

  /**
   * @returns {Promise<void>}
   */
  async enable() {
    await this.setForceDisabled(false);
  }
}
