import { RegionDurationUnitModel } from "../../data/models/unit-models/_module.mjs";
import { batchWrite, mixClasses } from "../../utils/_module.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

/**
 * @import * as hookEvents from "@client/hooks.mjs";
 */

const { RegionDocument } = foundry.documents;

/**
 * @extends {RegionDocument}
 * @mixes BaseDocument
 */
export default class TeriockRegionDocument extends mixClasses(RegionDocument, BaseDocumentMixin) {
  /** @type {RegionDurationUnitModel} */
  duration;

  /**
   * Whether the duration has elapsed.
   * @returns {boolean}
   */
  get isExpired() {
    return this.secondsRemaining <= 0;
  }

  /**
   * Seconds until the duration elapses.
   * @returns {number}
   */
  get secondsRemaining() {
    const startTime = this.getFlag("teriock", "startTime") ?? game.time.worldTime;
    return startTime + this.duration.value - game.time.worldTime;
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    const yes = await super._preCreate(data, options, user);
    if (yes === false) { return false; }

    if (!Number.isFinite(this.getFlag("teriock", "startTime"))) {
      this.updateSource({ "flags.teriock.startTime": game.time.worldTime });
    }
  }

  /**
   * Get active behaviors that are qualified for a given token.
   * @param {string} type
   * @param {TeriockTokenDocument} token
   * @returns {TeriockRegionBehavior[]}
   */
  getQualifiedBehaviors(type, token) {
    return (this.behaviors.documentsByType[type] ?? []).filter(b => b.active && b.checkQualifier(token));
  }

  /** @inheritDoc */
  prepareBaseData() {
    super.prepareBaseData();
    this.duration = new RegionDurationUnitModel(this.getFlag("teriock", "duration"));
  }
}

/**
 * Update or delete all regions with durations.
 * @see {@link hookEvents.updateWorldTime}
 */
async function updateRegionDurations() {
  if (!game.user.isActiveGM) { return; }
  const operations = [];
  for (const scene of game.scenes) {
    const ids = scene.regions.filter(r => r.isExpired).map(r => r.id);
    if (ids.length) { operations.push({ action: "delete", documentName: "Region", ids, parent: scene }); }
  }
  await batchWrite(operations);
}
Hooks.on("updateWorldTime", updateRegionDurations);
