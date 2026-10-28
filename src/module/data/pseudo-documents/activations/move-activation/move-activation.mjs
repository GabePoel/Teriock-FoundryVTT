import { mergeMetadata } from "../../../../utils/_module.mjs";
import { movementActionField } from "../../../fields/tools/builders.mjs";
import { migrateRename } from "../../../fields/tools/migrations.mjs";
import { BaseActivation } from "../abstract/_module.mjs";

const { fields } = foundry.data;
const { Ray } = foundry.canvas.geometry;

/**
 * @import { Point } from "@common/_types.mjs";
 */

export default class MoveActivation extends BaseActivation {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { icon: TERIOCK.DISPLAY.icons.manifest.ui.move, type: "move" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      distance: new fields.NumberField(),
      movementAction: movementActionField({ blank: true, initial: null, nullable: true, required: false }),
      originBarrier: new fields.BooleanField(),
      originUuid: new fields.DocumentUUIDField({ initial: null, nullable: true, type: "Token" }),
      randomDirection: new fields.BooleanField(),
      x: new fields.NumberField({ initial: null, nullable: true }),
      y: new fields.NumberField({ initial: null, nullable: true }),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options) {
    migrateRename(source, "token", "originUuid");
    return super.migrateData(source, options);
  }

  /**
   * Apply movement to all selected tokens.
   * @param {number} distance
   * @returns {Promise<void>}
   */
  async #applyMovements(distance) {
    if (!this.checkTokens()) { return; }
    const origin = this.origin;
    const scene = this.scene;
    if ((!origin && !this.randomDirection) || !scene) { return; }
    const instructions = {};
    const setMovementActionData = [];
    const unsetMovementActionData = [];
    for (const t of this.tokenDocuments) {
      if (t.scene?.uuid !== scene?.uuid) { continue; }
      if (t.x === origin?.x && t.y === origin?.y && !this.randomDirection) { continue; }
      let ray;
      if (this.randomDirection) {
        const angle = Math.random() * 2 * Math.PI;
        ray = Ray.fromAngle(t.x, t.y, angle, distance * scene.dimensions.distancePixels);
      } else {
        const currentRay = Ray.fromArrays([origin.x, origin.y], [t.x, t.y]);
        let fullDistance = -distance * scene.dimensions.distancePixels;
        if (this.originBarrier) {
          fullDistance = Math.min(fullDistance, currentRay.distance - 5 * scene.dimensions.distancePixels);
        }
        ray = Ray.towardsPoint({ x: t.x, y: t.y }, origin, fullDistance);
      }
      if (!ray) { continue; }
      instructions[t.id] = { destination: canvas.tokens.getSnappedPoint(ray.B) };
      if (this.movementAction) {
        setMovementActionData.push({ _id: t.id, movementAction: this.movementAction });
        unsetMovementActionData.push({ _id: t.id, movementAction: t.movementAction });
      }
    }
    if (!Object.keys(instructions).length) { return; }
    if (this.movementAction) { await scene.updateEmbeddedDocuments("Token", setMovementActionData); }
    await scene.moveTokens(instructions);
    if (this.movementAction) { await scene.updateEmbeddedDocuments("Token", unsetMovementActionData); }
  }

  /** @inheritDoc */
  get label() {
    return (this.display.label
      || _loc("TERIOCK.ACTIVATIONS.Move.BUTTON", { distance: this.distance })
      || _loc(this.constructor.typeLabel));
  }

  /**
   * The origin for the movement.
   * @returns {Point|null}
   */
  get origin() {
    let x = null;
    let y = null;
    const token = this.originToken;
    if (token) {
      x = token.x;
      y = token.y;
    }
    if (typeof this.x === "number") { x = this.x; }
    if (typeof this.y === "number") { y = this.y; }
    if (typeof x === "number" && typeof y === "number") { return { x, y }; }
    return null;
  }

  /**
   * The token the movement is relative to.
   * @returns {TeriockTokenDocument|null}
   */
  get originToken() {
    return fromUuidSync(this.originUuid);
  }

  /**
   * The scene this operation happens in.
   * @returns {TeriockScene|null}
   */
  get scene() {
    return this.originToken?.scene ?? canvas.scene;
  }

  /** @inheritDoc */
  async primaryAction() {
    await this.#applyMovements(this.distance);
  }

  /** @inheritDoc */
  async secondaryAction() {
    if (this.randomDirection) {
      ui.notifications.error("TERIOCK.ACTIVATIONS.Move.NOTIFICATIONS.cantReverseRandom", { localize: true });
      return;
    }
    await this.#applyMovements(-this.distance);
  }
}
