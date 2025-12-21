const { DetectionMode } = foundry.canvas.perception;
const { Token } = foundry.canvas.placeables;
const { fields } = foundry.data;

/**
 * @property {boolean} ethereal - Can this detect ethereal creatures from material?
 * @property {boolean} material - Can this detect material creatures from ethereal?
 * @property {boolean} hidden - Can this detect hidden creatures?
 */
export default class BaseDetectionMode extends DetectionMode {
  /**
   * What statuses block what detection types.
   * @type {Record<string, {src: Teriock.Parameters.Condition.ConditionKey[], tgt:
   *   Teriock.Parameters.Condition.ConditionKey}>}
   */
  static BLOCKING_STATUSES = {
    move: {
      src: ["dead", "frozen"],
      tgt: ["frozen"],
    },
    scent: {
      src: ["anosmatic", "ethereal"],
      tgt: ["odorless"],
    },
    sight: {
      src: ["blind"],
      tgt: ["invisible"],
    },
    sound: {
      src: ["deaf"],
      tgt: ["silent"],
    },
  };

  /** @inheritDoc */
  static defineSchema() {
    const schema = super.defineSchema();
    Object.assign(schema, {
      ethereal: new fields.BooleanField({ initial: false }),
      hidden: new fields.BooleanField({ initial: true }),
      material: new fields.BooleanField({ initial: true }),
    });
    //noinspection JSValidateTypes
    return schema;
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
    const src = visionSource.object.document;
    let tgt;
    if (target instanceof Token) {
      tgt = target.document;
    }
    if (this.isSight && !this._testStatuses("sight", src, tgt)) {
      return false;
    }
    if (this.isSound && !this._testStatuses("sound", src, tgt)) {
      return false;
    }
    if (this.isMove && !this._testStatuses("move", src, tgt)) {
      return false;
    }
    if (this.isScent && !this._testStatuses("scent", src, tgt)) {
      return false;
    }
    if (!this._testEthereal(src, tgt)) {
      return false;
    }
    return this._testHidden(src, tgt);
  }

  /**
   * Verify that a target is visible based on whether it and the source are Ethereal.
   * @param {TeriockTokenDocument} src
   * @param {TeriockTokenDocument} [tgt]
   * @returns {boolean}
   */
  _testEthereal(src, tgt) {
    if (tgt) {
      if (src.hasStatusEffect("ethereal") === tgt.hasStatusEffect("ethereal")) {
        return true;
      } else if (
        !src.hasStatusEffect("ethereal") &&
        tgt.hasStatusEffect("ethereal")
      ) {
        return this.ethereal;
      } else if (
        src.hasStatusEffect("ethereal") &&
        !tgt.hasStatusEffect("ethereal")
      ) {
        return this.material;
      }
    }
    return true;
  }

  /**
   * Verify that a target is visible based on whether it is hidden.
   * @param {TeriockTokenDocument} src
   * @param {TeriockTokenDocument} [tgt]
   */
  _testHidden(src, tgt) {
    if (this.hidden && tgt && tgt.hasStatusEffect("hidden")) {
      const srcActor = src.actor;
      const tgtActor = tgt.actor;
      if (srcActor && tgtActor) {
        return (
          srcActor.system.detection.perceiving.value >
          tgtActor.system.detection.hiding.value
        );
      }
    }
    return true;
  }

  /**
   * Check if the source and target have any statuses that interfere with the vision type.
   * @param {string} type
   * @param {TeriockTokenDocument} src
   * @param {TeriockTokenDocument} [tgt]
   * @returns {boolean}
   */
  _testStatuses(type, src, tgt) {
    const blockers = this.constructor.BLOCKING_STATUSES;
    if (Object.keys(blockers).includes(type)) {
      for (const status of blockers[type].src) {
        if (src.hasStatusEffect(status)) {
          return false;
        }
      }
      if (tgt) {
        for (const status of blockers[type].tgt) {
          if (tgt.hasStatusEffect(status)) {
            return false;
          }
        }
      }
    }
    return true;
  }
}
