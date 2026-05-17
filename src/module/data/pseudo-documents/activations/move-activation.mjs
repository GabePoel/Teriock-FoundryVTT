import { movementActionField } from "../../fields/helpers/builders.mjs";
import { BaseActivation } from "./abstract/_module.mjs";

const { fields } = foundry.data;
const { Ray } = foundry.canvas.geometry;

/**
 * @property {UUID<TeriockTokenDocument>} token
 * @property {boolean} originBarrier
 * @property {boolean} randomDirection
 * @property {number|null} x
 * @property {number|null} y
 * @property {number} distance
 * @property {string} movementAction
 */
export default class MoveActivation extends BaseActivation {
  /** @inheritDoc */
  static get ICON() {
    return TERIOCK.display.icons.ui.move;
  }

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.Move.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "move";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      distance: new fields.NumberField(),
      movementAction: movementActionField({
        nullable: true,
        initial: null,
        required: false,
      }),
      originBarrier: new fields.BooleanField(),
      randomDirection: new fields.BooleanField(),
      token: new fields.DocumentUUIDField({
        type: "Token",
        nullable: true,
        initial: null,
      }),
      x: new fields.NumberField({ nullable: true, initial: null }),
      y: new fields.NumberField({ nullable: true, initial: null }),
    });
  }

  /** @inheritDoc */
  get label() {
    return (
      this.display.label ||
      _loc("TERIOCK.ACTIVATIONS.Move.BUTTON", { distance: this.distance }) ||
      this.constructor.LABEL
    );
  }

  /**
   * The origin for the movement.
   * @returns {Point|null}
   */
  get origin() {
    let x = null;
    let y = null;
    if (this.token) {
      const token = this.tokenDocument;
      if (token) {
        x = token.x;
        y = token.y;
      }
    }
    if (typeof this.x === "number") {
      x = this.x;
    }
    if (typeof this.y === "number") {
      y = this.y;
    }
    if (typeof x === "number" && typeof y === "number") {
      return { x, y };
    }
    return null;
  }

  /**
   * The scene this operation happens in.
   * @returns {TeriockScene|null}
   */
  get scene() {
    const tokenDocument = this.tokenDocument;
    if (tokenDocument) {
      return tokenDocument.scene;
    }
    return canvas.scene;
  }

  /**
   * The token document this is based on.
   * @returns {TeriockTokenDocument|null}
   */
  get tokenDocument() {
    return fromUuidSync(this.token);
  }

  /**
   * Apply movement to all selected tokens.
   * @param {number} distance
   * @returns {Promise<void>}
   */
  async #applyMovements(distance) {
    if (!this.checkTokens()) {
      return;
    }
    const origin = this.origin;
    const scene = this.scene;
    if ((!origin && !this.randomDirection) || !scene) {
      return;
    }
    const instructions = {};
    const setMovementActionData = [];
    const unsetMovementActionData = [];
    for (const t of this.tokenDocuments) {
      if (t.scene?.uuid !== scene?.uuid) {
        continue;
      }
      if (t.x === origin?.x && t.y === origin?.y && !this.randomDirection) {
        continue;
      }
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
      if (!ray) {
        continue;
      }
      instructions[t.id] = {
        destination: canvas.tokens.getSnappedPoint(ray.B),
      };
      if (this.movementAction) {
        setMovementActionData.push({
          _id: t.id,
          movementAction: this.movementAction,
        });
        unsetMovementActionData.push({
          _id: t.id,
          movementAction: t.movementAction,
        });
      }
    }
    if (!Object.keys(instructions).length) {
      return;
    }
    if (this.movementAction) {
      await scene.updateEmbeddedDocuments("Token", setMovementActionData);
    }
    await scene.moveTokens(instructions);
    if (this.movementAction) {
      await scene.updateEmbeddedDocuments("Token", unsetMovementActionData);
    }
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
