import { PseudoCollectionField } from "../../../fields/_module.mjs";
import { Tracker } from "../../../pseudo-documents/_module.mjs";

/**
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, TrackableSystem & Teriock.Models.TrackableSystemData>}
 */
export default function TrackableSystemMixin(Base) {
  /**
   * @implements {Teriock.Models.TrackableSystemData}
   * @mixin
   */
  class TrackableSystem extends Base {
    /** @inheritDoc */
    static get metadata() {
      return foundry.utils.mergeObject(super.metadata, { pseudos: { Tracker: "system.trackers" } });
    }

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { trackers: new PseudoCollectionField(Tracker) });
    }

    #cachedGroupIds = new Set();

    /**
     * Add trackers to registry.
     */
    #track() {
      for (const tracker of this.trackers) {
        if (tracker.shouldTrackInRegistry) {
          game.teriock.statusGroups.track(tracker.groupId, this.actor.uuid);
          this.#cachedGroupIds.add(tracker.groupId);
        }
      }
    }

    /**
     * Remove trackers from registry.
     */
    #untrack() {
      for (const groupId of this.#cachedGroupIds) {
        game.teriock.statusGroups.untrack(groupId, this.actor.uuid);
      }
      this.#cachedGroupIds.clear();
    }

    /** @inheritDoc */
    _onDelete(options, userId) {
      super._onDelete(options, userId);
      this.#untrack();
    }

    /**
     * Documents this is associated with.
     * @return {Promise<TeriockDocument[]>}
     */
    async getAssociatedDocuments() {
      const promises = [];
      const trackers = this.trackers.filter(t => !t.status);
      for (const t of trackers) { promises.push(t.getAssociatedDocuments()); }
      return Array.from(new Set((await Promise.all(promises)).flat()));
    }

    /** @inheritDoc */
    async getPanelParts() {
      const parts = await super.getPanelParts();
      const associatedDocuments = await this.getAssociatedDocuments();
      const association = {
        cards: associatedDocuments.map(d => {
          return { color: d.system?.color, img: d.img, name: d.name, uuid: d.uuid };
        }),
        icon: TERIOCK.display.icons.ui.document,
        title: _loc("TERIOCK.SYSTEMS.Trackable.PANELS.associations"),
      };
      parts.associations.push(association);
      return parts;
    }

    /** @inheritDoc */
    prepareCleanupData() {
      this.#untrack();
      super.prepareCleanupData();
      if (this.parent.active) { this.#track(); }
    }
  }

  return TrackableSystem;
}
