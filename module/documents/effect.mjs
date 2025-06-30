import { ChildDocumentMixin } from "./mixins/child-mixin.mjs";

/**
 * @extends {foundry.documents.ActiveEffect}
 */
export default class TeriockEffect extends ChildDocumentMixin(foundry.documents.ActiveEffect) {
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
      if (this.isProficient) {
        if (this.system.applies.proficient.changes.length > 0) {
          this.changes = this.system.applies.proficient.changes;
        }
      }
      if (this.isFluent) {
        if (this.system.applies.fluent.changes.length > 0) {
          this.changes = this.system.applies.fluent.changes;
        }
      }
    }
    if (this.type === "attunement") {
      this.changes = [
        { key: "system.attunements", mode: 2, value: this.system.target, priority: 10 },
        { key: "system.presence.value", mode: 2, value: this.system.tier, priority: 10 },
      ];
    }
  }

  /**
   * @override
   */
  get isSuppressed() {
    let suppressed = super.isSuppressed;
    return this.system.suppressed || suppressed;
  }

  /**
   * Gets the ability that provides this, if there is one.
   * @returns {parent: TeriockEffect | null}
   */
  getParent() {
    if (this.system.parentUuid) {
      try {
        return foundry.utils.fromUuidSync(this.system.parentUuid);
      } catch (error) {
        // Fallback to async if sync fails
        return foundry.utils.fromUuid(this.system.parentUuid);
      }
    }
    return null;
  }

  getParentSync() {
    if (this.system.parentUuid) {
      return this.parent.getEmbeddedDocument("ActiveEffect", this.system.parentId);
    }
    return null;
  }

  /**
   * Gets the top level ancestor ability that provides this, if there is one.
   * @returns {ancestor: TeriockEffect | null}
   */
  getAncestor() {
    let ancestor = this.getParent();
    if (ancestor) {
      ancestor = ancestor.getParent() || ancestor;
    }
    return ancestor;
  }

  getAncestors() {
    const ancestors = [];
    let ancestor = this.getParent();
    if (ancestor) {
      ancestors.push(ancestor);
      ancestors.push(...ancestor.getAncestors());
    }
    return ancestors;
  }

  getAncestorsSync() {
    const ancestors = [];
    let ancestor = this.getParentSync();
    if (ancestor) {
      ancestors.push(ancestor);
      ancestors.push(...ancestor.getAncestorsSync());
    }
    return ancestors;
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
        try {
          const child = foundry.utils.fromUuidSync(uuid);
          children.push(child);
        } catch (error) {
          // Fallback to async if sync fails
          const child = foundry.utils.fromUuid(uuid);
          children.push(child);
        }
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

  get isReference() {
    const ancestors = this.getAncestors();
    for (const ancestor of ancestors) {
      if (ancestor.system.maneuver !== "passive") {
        return true;
      }
    }
    return false;
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
   * Disables the effect, setting its `disabled` property to true.
   * @returns {Promise<void>}
   */
  async disable() {
    await this.update({ disabled: true });
  }

  /**
   * Enables the effect, setting its `disabled` property to false.
   * @returns {Promise<void>}
   */
  async enable() {
    await this.update({ disabled: false });
  }

  /**
   * Toggles the `disabled` state of the effect.
   * If the effect is currently disabled, it will be enabled, and vice versa.
   * @returns {Promise<void>}
   */
  async toggleDisabled() {
    await this.update({ disabled: !this.disabled });
  }

  /**
   * @returns {Promise<void>}
   */
  async forceUpdate() {
    await this.update({ "system.updateCounter": !this.system.updateCounter });
  }
}
