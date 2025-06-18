const { ActiveEffect } = foundry.documents;
import { MixinChildDocument } from "./mixins/child-mixin.mjs";

// Allows for typing within mixin.
/** @import ActiveEffect from "@client/documents/active-effect.mjs"; */

/**
 * @extends {ActiveEffect}
 */
export default class TeriockEffect extends MixinChildDocument(ActiveEffect) {

  /** @inheritdoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.type === 'ability' && this.system.maneuver === 'passive') {
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
   * @returns { parent: TeriockEffect }
   */
  getParent() {
    if (this.system.parentId) {
      return this.parent?.getEmbeddedDocument('ActiveEffect', this.system.parentId);
    }
    return null;
  }

  /**
   * Get whatever Document most directly applies this. If it's an ability, it
   * returns that. Otherwise, gets what Foundry considers to be the parent.
   * @returns { source: Document }
   */
  getSource() {
    let source = this.getParent();
    if (!source) {
      source = this.parent;
    }
    return source;
  }

  getChildren() {
    const children = [];
    if (this.system.childIds?.length > 0) {
      for (const id of this.system.childIds) {
        children.push(this.parent?.getEmbeddedDocument('ActiveEffect', id));
      }
    }
    return children;
  }

  getDescendants() {
    const descendants = [];
    const children = this.getChildren();
    for (const child of children) {
      descendants.push(child);
      descendants.push(...child.getDescendants());
    }
    return descendants;
  }

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

  async deleteChildren() {
    if (this.system?.childIds?.length > 0) {
      const childIds = this.system.childIds;
      await this.update({
        'system.childIds': [],
      })
      await this.parent?.deleteEmbeddedDocuments('ActiveEffect', childIds);
    }
  }

  async softEnable() {
    const updateCandidates = this.getNotForceDisabled();
    const updates = updateCandidates.map(effect => {
      return { _id: effect.id, disabled: false };
    });
    this.parent.updateEmbeddedDocuments('ActiveEffect', updates);
  }

  async softDisable() {
    const updateCandidates = this.getDescendants();
    updateCandidates.push(this);
    const updates = updateCandidates.map(effect => {
      return { _id: effect.id, disabled: true };
    });
    this.parent.updateEmbeddedDocuments('ActiveEffect', updates);
  }

  async hardEnable() {
    const updateCandidates = this.getNotForceDisabled(true);
    const updates = updateCandidates.map(effect => {
      return { _id: effect.id, disabled: false };
    });
    updates.push({
      _id: this.id,
      disabled: false,
      'system.forceDisabled': false,
    })
    console.log(updates);
    this.parent.updateEmbeddedDocuments('ActiveEffect', updates);
  }

  async hardDisable() {
    const updateCandidates = this.getDescendants();
    updateCandidates.push(this);
    const updates = updateCandidates.map(effect => {
      return { _id: effect.id, disabled: true };
    });
    updates.push({
      _id: this.id,
      disabled: true,
      'system.forceDisabled': true,
    })
    console.log(updates);
    this.parent.updateEmbeddedDocuments('ActiveEffect', updates);
  }

  async setSoftDisabled(bool) {
    if (bool) {
      await this.softDisable();
    } else {
      await this.softEnable();
    }
  }

  async toggleSoftDisabled() {
    await this.setSoftDisabled(!this.disabled);
  }

  async setForceDisabled(bool) {
    console.log('set force disabled', bool);

    const shouldEnable =
      (!this.system.consumable) ||
      (this.system.consumable && this.system.quantity >= 1);

    const parentDisabled =
      (this.parent?.system?.disabled ?? false) ||
      (this.getParent()?.disabled ?? false) ||
      (this.getParent()?.system?.forceDisabled ?? false);

    if (parentDisabled) {
      ui.notifications.error(
        `You cannot ${bool ? 'enable' : 'disable'} ${this.name} while its parent is disabled.`
      );
    }

    if (shouldEnable && !parentDisabled) {
      if (bool) {
        await this.hardDisable();
      } else {
        await this.hardEnable();
      }
    }
  }

  async toggleForceDisabled() {
    await this.setForceDisabled(!this.system.forceDisabled);
  }

  async disable() {
    await this.setForceDisabled(true);
  }

  async enable() {
    await this.setForceDisabled(false);
  }
}
