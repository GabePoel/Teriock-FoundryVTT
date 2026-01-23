import { TeriockRoll } from "../../dice/_module.mjs";

const { MeasuredTemplate } = foundry.canvas.placeables;

/**
 * @property {MeasuredTemplateDocument} document
 */
export default class TeriockAbilityTemplate extends MeasuredTemplate {
  /**
   * A factory method to create an AbilityTemplate instance using provided data from an Activity instance.
   * @param {AbilityExecution} execution - The roll config to construct the template from.
   * @param {object} [options={}] - Options to modify the created template.
   * @returns {TeriockAbilityTemplate|null} The template objects, or null if the item does not produce a template.
   */
  static fromExecution(execution, options = {}) {
    const templateShape =
      TERIOCK.options.delivery[execution.source.system.delivery.base]?.template;
    if (!templateShape) {
      return null;
    }
    const source = execution.executor || execution.actor?.defaultToken;
    if (!source) {
      return null;
    }
    let distance = TeriockRoll.meanValue(
      execution.source.system.range.formula,
      execution.rollData,
    );
    if (source && execution.source.system.isAoe) {
      distance += source.document.radius;
    }
    const templateData = foundry.utils.mergeObject(
      {
        t: templateShape,
        user: game.user.id,
        distance: distance,
        direction: 0,
        x: source?.center.x || 0,
        y: source?.center.y || 0,
        fillColor: game.user.color,
        flags: {
          teriock: {
            deleteOnTurnChange: true,
          },
        },
      },
      options,
    );
    switch (templateShape) {
      case "cone":
        templateData.angle = CONFIG.MeasuredTemplate.defaults.angle;
        break;
      default:
        break;
    }
    if (
      foundry.helpers.Hooks.call(
        "teriock.preCreateAbilityTemplate",
        execution,
        templateData,
      ) === false
    ) {
      return null;
    }
    const cls = CONFIG.MeasuredTemplate.documentClass;
    const template = new cls(foundry.utils.deepClone(templateData), {
      parent: canvas.scene,
    });
    const object = new this(template);
    object.execution = execution;
    object.ability = execution.source;
    object.actorSheet = execution.actor?.sheet || null;
    foundry.helpers.Hooks.callAll(
      "teriock.createAbilityTemplate",
      execution,
      object,
    );
    return object;
  }

  /**
   * Track the bound event handlers so they can be properly canceled later.
   * @type {object}
   */
  #events;

  /**
   * The initially active CanvasLayer to re-activate after the workflow is complete.
   * @type {CanvasLayer}
   */
  #initialLayer;

  /**
   * Track the timestamp when the last mouse move event was captured.
   * @type {number}
   */
  #moveTime = 0;

  /**
   * Shared code for when template placement ends by being confirmed or canceled.
   * @param {Event} event  Triggering event that ended the placement.
   */
  async _finishPlacement(event) {
    this.layer._onDragLeftCancel(event);
    if (this.#events.move) {
      canvas.stage.off("mousemove", this.#events.move);
    }
    canvas.stage.off("mouseup", this.#events.confirm);
    canvas.app.view.oncontextmenu = null;
    canvas.app.view.onwheel = null;
    this.#initialLayer.activate();
    await this.actorSheet?.maximize();
  }

  /**
   * Cancel placement when the right mouse button is clicked.
   * @param {Event} event - Triggering mouse event.
   */
  async _onCancelPlacement(event) {
    await this._finishPlacement(event);
    this.#events.reject();
  }

  /**
   * Confirm placement when the left mouse button is clicked.
   * @param {Event} event  Triggering mouse event.
   */
  async _onConfirmPlacement(event) {
    await this._finishPlacement(event);
    const destination = canvas.templates.getSnappedPoint({
      x: this.document.x,
      y: this.document.y,
    });
    this.document.updateSource(destination);
    this.#events.resolve(
      canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [
        this.document.toObject(),
      ]),
    );
  }

  /**
   * Move the template preview when the mouse moves.
   * @param {Event} event  Triggering mouse event.
   */
  _onMovePlacement(event) {
    event.stopPropagation();

    // Apply a 20ms throttle
    const now = Date.now();
    if (now - this.#moveTime <= 20) {
      return;
    }

    const center = event.data.getLocalPosition(this.layer);
    const updates = this.getSnappedPosition(center);
    this.document.updateSource(updates);
    this.refresh();
    this.#moveTime = now;
  }

  /**
   * Rotate the template preview by 3˚ increments when the mouse wheel is rotated.
   * @param {WheelEvent} event - Triggering mouse event.
   */
  _onRotatePlacement(event) {
    if (event.ctrlKey) {
      event.preventDefault();
    }
    // Avoid zooming the browser window
    event.stopPropagation();
    const delta = canvas.grid.type > CONST.GRID_TYPES.SQUARE ? 30 : 15;
    const snap = event.shiftKey ? delta : 5;
    const update = {
      direction: this.document.direction + snap * Math.sign(event.deltaY),
    };
    this.document.updateSource(update);
    this.refresh();
  }

  /**
   * Activate listeners for the template preview
   * @param {CanvasLayer} initialLayer - The initially active CanvasLayer to re-activate after the workflow is complete
   * @returns {Promise<void>} - A promise that resolves with the final measured template if created.
   */
  activatePreviewListeners(initialLayer) {
    return new Promise((resolve, reject) => {
      this.#initialLayer = initialLayer;
      this.#events = {
        cancel: this._onCancelPlacement.bind(this),
        confirm: this._onConfirmPlacement.bind(this),
        resolve,
        reject,
        rotate: this._onRotatePlacement.bind(this),
      };
      if (this.execution.source.system.expansion.type === "detonate") {
        this.#events.move = this._onMovePlacement.bind(this);
        canvas.stage.on("mousemove", this.#events.move);
      }

      // Activate listeners
      canvas.stage.on("mouseup", this.#events.confirm);
      canvas.app.view.oncontextmenu = this.#events.cancel;
      canvas.app.view.onwheel = this.#events.rotate;
    });
  }

  /**
   * Creates a preview of the ability template.
   * @returns {Promise<void>} A promise that resolves with the final measured template if created.
   */
  async drawPreview() {
    const initialLayer = canvas.activeLayer;
    if (this.execution.source.system.delivery.base === "cone") {
      // Draw the template and switch to the template layer
      await this.draw();
      this.layer.activate();
      this.layer.preview.addChild(this);

      // Hide the sheet that originated the preview
      await this.actorSheet?.minimize();

      // Activate interactivity
      return this.activatePreviewListeners(initialLayer);
    } else {
      const destination = canvas.templates.getSnappedPoint({
        x: this.document.x,
        y: this.document.y,
      });
      this.document.updateSource(destination);
      await canvas.scene.createEmbeddedDocuments("MeasuredTemplate", [
        this.document.toObject(),
      ]);
    }
  }
}
