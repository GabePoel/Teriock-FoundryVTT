const { DetectionMode } = foundry.canvas.perception;
const { TokenDocument } = foundry.documents;
const { fields } = foundry.data;

/**
 * @import { PointVisionSource } from "@client/canvas/sources/_module.mjs";
 */

/**
 * @property {boolean} ethereal - Can this detect Ethereal creatures from Material?
 * @property {boolean} material - Can this detect Material creatures from Ethereal?
 * @property {boolean} hidden - Can this detect hidden creatures?
 */
export default class BaseDetectionMode extends DetectionMode {
  /**
   * What statuses block what detection types.
   * @type {Record<string, {src: Teriock.Keys.Condition[], tgt:
   *   Teriock.Keys.Condition}>}
   */
  static BLOCKING_STATUSES = {
    move: { src: ["dead", "frozen"], tgt: ["frozen"] },
    scent: { src: ["anosmatic"], tgt: ["odorless"] },
    sight: { src: ["blind"], tgt: ["invisible"] },
    sound: { src: ["deaf"], tgt: ["silent"] },
  };

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      ethereal: new fields.BooleanField({ initial: false }),
      hidden: new fields.BooleanField({ initial: true }),
      material: new fields.BooleanField({ initial: true }),
    });
  }

  /**
   * Whether this detection mode relies on movement.
   * @returns {boolean}
   */
  get isMove() {
    return this.type === DetectionMode.DETECTION_TYPES.MOVE;
  }

  /**
   * Whether this detection mode relies on scent.
   * @returns {boolean}
   */
  get isScent() {
    return false;
  }

  /**
   * Whether this detection mode relies on sight.
   * @returns {boolean}
   */
  get isSight() {
    return this.type === DetectionMode.DETECTION_TYPES.SIGHT;
  }

  /**
   * Whether this detection mode relies on sound.
   * @returns {boolean}
   */
  get isSound() {
    return this.type === DetectionMode.DETECTION_TYPES.SOUND;
  }

  /**
   * @inheritDoc
   * @param {PointVisionSource} visionSource
   * @param {object|null} visionSource.object
   * @param {TeriockTokenDocument} visionSource.object.document
   * @param {object|null} target
   * @param {TeriockTokenDocument} target.document
   * @override
   */
  _canDetect(visionSource, target) {
    const sDoc = visionSource.object.document;
    const tDoc = target?.document;
    if (tDoc instanceof TokenDocument) {
      if (this.isMove && !this._testStatuses("move", sDoc, tDoc)) { return false; }
      if (this.isScent && !this._testStatuses("scent", sDoc, tDoc)) { return false; }
      if (this.isSight && !this._testStatuses("sight", sDoc, tDoc)) { return false; }
      if (this.isSound && !this._testStatuses("sound", sDoc, tDoc)) { return false; }
    }
    if (!this._testEthereal(visionSource.object, target)) { return false; }
    return this._testHidden(sDoc, tDoc);
  }

  /**
   * Verify that a target is visible based on whether it and the source are Ethereal.
   * @param {TeriockToken} sourceToken
   * @param {TeriockToken} [targetToken]
   * @returns {boolean}
   */
  _testEthereal(sourceToken, targetToken) {
    if (targetToken && typeof targetToken?.isEthereal === "boolean") {
      if (sourceToken?.isEthereal === targetToken?.isEthereal) { return true; }
      else if (!sourceToken?.isEthereal && targetToken?.isEthereal) { return this.ethereal; }
      else if (sourceToken?.isEthereal && !targetToken?.isEthereal) { return this.material; }
    }
    return true;
  }

  /**
   * Verify that a target is visible based on whether it is hidden.
   * @param {TeriockTokenDocument} sourceDocument
   * @param {TeriockTokenDocument} [targetDocument]
   */
  _testHidden(sourceDocument, targetDocument) {
    if (this.hidden && targetDocument && targetDocument.hasStatusEffect("hidden")) {
      const srcActor = sourceDocument.actor;
      const tgtActor = targetDocument.actor;
      if (srcActor && tgtActor) {
        return srcActor.system.detection.perceiving >= tgtActor.system.detection.hiding;
      }
    }
    return true;
  }

  /**
   * Check if the source and target have any statuses that interfere with the vision type.
   * @param {string} type
   * @param {TeriockTokenDocument} sourceDocument
   * @param {TeriockTokenDocument} [targetDocument]
   * @returns {boolean}
   */
  _testStatuses(type, sourceDocument, targetDocument) {
    const blockers = this.constructor.BLOCKING_STATUSES;
    if (Object.keys(blockers).includes(type)) {
      for (const status of blockers[type].src) { if (sourceDocument.hasStatusEffect(status)) { return false; } }
      if (targetDocument) {
        for (const status of blockers[type].tgt) { if (targetDocument.hasStatusEffect(status)) { return false; } }
      }
    }
    return true;
  }
}
