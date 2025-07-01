import { ChildDocumentMixin } from "./mixins/child-mixin.mjs";

/**
 * @extends {foundry.documents.ActiveEffect}
 */
export default class TeriockEffect extends ChildDocumentMixin(foundry.documents.ActiveEffect) {
  /**
   * Prepares derived data for the effect, handling ability-specific logic and attunement changes.
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
   * Checks if the effect is suppressed, combining system suppression with parent suppression.
   * @override
   * @returns {boolean} True if the effect is suppressed, false otherwise.
   */
  get isSuppressed() {
    let suppressed = super.isSuppressed;
    return this.system.suppressed || suppressed;
  }

  /**
   * Gets the parent effect that provides this effect, if there is one.
   * @returns {TeriockEffect|null} The parent effect or null if no parent exists.
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

  /**
   * Gets the parent effect synchronously using the embedded document system.
   * @returns {TeriockEffect|null} The parent effect or null if no parent exists.
   */
  getParentSync() {
    if (this.system.parentUuid) {
      return this.parent.getEmbeddedDocument("ActiveEffect", this.system.parentId);
    }
    return null;
  }

  /**
   * Gets the top level ancestor effect that provides this effect, if there is one.
   * @returns {TeriockEffect|null} The top level ancestor effect or null if no ancestor exists.
   */
  getAncestor() {
    let ancestor = this.getParent();
    if (ancestor) {
      ancestor = ancestor.getParent() || ancestor;
    }
    return ancestor;
  }

  /**
   * Gets all ancestor effects in the hierarchy, starting from the immediate parent.
   * @returns {TeriockEffect[]} Array of ancestor effects, ordered from immediate parent to top level.
   */
  getAncestors() {
    const ancestors = [];
    let ancestor = this.getParent();
    if (ancestor) {
      ancestors.push(ancestor);
      ancestors.push(...ancestor.getAncestors());
    }
    return ancestors;
  }

  /**
   * Gets all ancestor effects synchronously using the embedded document system.
   * @returns {TeriockEffect[]} Array of ancestor effects, ordered from immediate parent to top level.
   */
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
   * Gets the document that most directly applies this effect. If it's an ability, returns that.
   * Otherwise, gets what Foundry considers to be the parent.
   * @returns {Document} The source document that applies this effect.
   */
  getSource() {
    let source = this.getParent();
    if (!source) {
      source = this.parent;
    }
    return source;
  }

  /**
   * Gets all child effects that are derived from this effect.
   * @returns {ActiveEffect[]} Array of child effects.
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
   * Gets all child effects asynchronously using UUID resolution.
   * @returns {Promise<ActiveEffect[]>} Promise that resolves to an array of child effects.
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
   * Checks if this effect is a reference effect by examining its ancestors for non-passive maneuvers.
   * @returns {boolean} True if this is a reference effect, false otherwise.
   */
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
   * Saves the family relationships by updating child UUIDs and parent UUID.
   * @returns {Promise<void>} Promise that resolves when the family data is saved.
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
   * Removes family relationships by clearing child UUIDs and parent UUID.
   * @returns {Promise<void>} Promise that resolves when the family data is cleared.
   */
  async unsaveFamily() {
    await this.update({
      "system.childUuids": [],
      "system.parentUuid": null,
    });
  }

  /**
   * Duplicates the effect and updates parent-child relationships.
   * @todo Create addChild and setParent methods to handle this more generally.
   * @override
   * @returns {Promise<TeriockEffect>} Promise that resolves to the duplicated effect.
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
   * Gets all descendant effects (children, grandchildren, etc.) in a recursive manner.
   * @returns {ActiveEffect[]} Array of all descendant effects.
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
   * Deletes all child effects and clears the child IDs from this effect.
   * @returns {Promise<void>} Promise that resolves when all children are deleted.
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
   * Disables the effect by setting its `disabled` property to true.
   * @returns {Promise<void>} Promise that resolves when the effect is disabled.
   */
  async disable() {
    await this.update({ disabled: true });
  }

  /**
   * Enables the effect by setting its `disabled` property to false.
   * @returns {Promise<void>} Promise that resolves when the effect is enabled.
   */
  async enable() {
    await this.update({ disabled: false });
  }

  /**
   * Toggles the `disabled` state of the effect.
   * If the effect is currently disabled, it will be enabled, and vice versa.
   * @returns {Promise<void>} Promise that resolves when the disabled state is toggled.
   */
  async toggleDisabled() {
    await this.update({ disabled: !this.disabled });
  }

  /**
   * Forces an update of the effect by toggling the update counter.
   * This is useful for triggering reactive updates in the UI.
   * @returns {Promise<void>} Promise that resolves when the effect is updated.
   */
  async forceUpdate() {
    await this.update({ "system.updateCounter": !this.system.updateCounter });
  }
}
