import TeriockTextEditor from "./text-editor.mjs";

const { DragDrop } = foundry.applications.ux;

/**
 * @typedef {object} SheetState
 * @property {ApplicationV2|null} sheet
 * @property {boolean} wasMinimized
 */

/** @inheritDoc */
export default class TeriockDragDrop extends DragDrop {
  /** @type {SheetState} */
  static #dragSheet = { sheet: null, wasMinimized: false };

  /** @type {SheetState} */
  static #dropSheet = { sheet: null, wasMinimized: false };

  /**
   * Whether a drag is currently being tracked.
   * @type {boolean}
   */
  static #initialized = false;

  /** @type {Teriock.Sheet.DropData<AnyCommonDocument>|null} */
  static #payload = null;

  /**
   * Release everything tracked for a drag.
   */
  static #endDrag() {
    TeriockDragDrop.#minimizeEnd();
    TeriockDragDrop.clearDropSheet();
    TeriockDragDrop.clearDragSheet();
    TeriockDragDrop.#initialized = false;
    TeriockDragDrop.#payload = null;
  }

  /**
   * Maximize the sheet a drag started from.
   * @returns {Promise<void>}
   */
  static async #minimizeEnd() {
    if (!this.#dragSheet.wasMinimized) { await this.#dragSheet.sheet?.maximize(); }
  }

  /**
   * Minimize the sheet a drag started from.
   * @returns {Promise<void>}
   */
  static async #minimizeStart() {
    const sheet = this.#dragSheet.sheet;
    if (sheet && sheet.hasFrame && !sheet.minimized) { await sheet.minimize(); }
  }

  /**
   * Helper to set data.
   * @param {DragEvent} event
   * @param {object} [data]
   */
  static #setData(event, data = {}) {
    event.dataTransfer.setData("text/plain", JSON.stringify(data));
    TeriockDragDrop.#payload = data;
  }

  /** @type {string} */
  static DROP_SHEET_CLASS = "teriock-drop-target";

  /**
   * The payload of the drag currentFly in progress.
   * @returns {Teriock.Sheet.DropData<AnyCommonDocument>|null}
   */
  static get payload() {
    return TeriockDragDrop.#payload;
  }

  /**
   * Clear the drag sheet.
   */
  static clearDragSheet() {
    this.#dragSheet.sheet = null;
    this.#dragSheet.wasMinimized = false;
  }

  /**
   * Clear the drop sheet.
   */
  static clearDropSheet() {
    this.#dropSheet.sheet?.window.content?.classList.remove(this.DROP_SHEET_CLASS);
    this.#dropSheet.sheet = null;
    this.#dropSheet.wasMinimized = false;
  }

  /**
   * Start tracking a drag,
   * @param {DragEvent} event
   * @param {ApplicationV2} [startSheet]
   */
  static initializeDrag(event, startSheet = null) {
    if (TeriockDragDrop.#initialized) { return; }
    TeriockDragDrop.#initialized = true;
    TeriockDragDrop.setDragSheet(startSheet);
    setTimeout(() => {
      game.tooltip.deactivate();
      if (TeriockDragDrop.#initialized) { TeriockDragDrop.#minimizeStart(); }
    }, 100);
    event.target?.addEventListener("dragend", () => TeriockDragDrop.#endDrag(), { once: true });
  }

  /**
   * Resolve how a drop should be performed.
   * @param {Teriock.Sheet.DropBehavior} defaultBehavior
   * @param {Teriock.Sheet.DropData<AnyCommonDocument>} [dropData]
   * @returns {Teriock.Sheet.DropBehavior}
   */
  static resolveBehavior(defaultBehavior, dropData = {}) {
    if (!dropData.invertBehavior) { return defaultBehavior; }
    return defaultBehavior === "move" ? "copy" : "move";
  }

  /**
   * Ensure all the required drag event data is set.
   * @param {DragEvent} event
   * @param {object} [data]
   */
  static setDefaultDragEventData(event, data = {}) {
    const dragData = Object.assign(TeriockTextEditor.getDragEventData(event), data);
    dragData.interactive ??= !game.keyboard.isModifierActive("CONTROL");
    dragData.invertBehavior ??= game.keyboard.isModifierActive("ALT");
    TeriockDragDrop.#setData(event, dragData);
    if (dragData.uuid) {
      fromUuid(dragData.uuid).then(d => {
        dragData.identifier ??= d?.typedIdentifier;
        dragData.systemType ??= d?.type;
        TeriockDragDrop.#setData(event, dragData);
      });
    }
  }

  /**
   * Set a drag sheet.
   * @param {ApplicationV2} [sheet]
   */
  static setDragSheet(sheet = null) {
    this.#dragSheet.sheet = sheet;
    this.#dragSheet.wasMinimized = Boolean(sheet?.minimized);
  }

  /**
   * Set a drop sheet.
   * @param {ApplicationV2} sheet
   */
  static setDropSheet(sheet) {
    if (sheet === this.#dropSheet.sheet || sheet === this.#dragSheet.sheet) { return; }
    if (this.#dropSheet.wasMinimized) { this.#dropSheet.sheet?.minimize(); }
    this.#dropSheet.sheet = sheet;
    sheet.bringToFront();
    this.#dropSheet.wasMinimized = sheet.hasFrame && sheet.minimized;
    if (this.#dropSheet.wasMinimized) { sheet.maximize(); }
    sheet.window.content?.classList.add(this.DROP_SHEET_CLASS);
    foundry.applications.instances.values().forEach((app) => {
      if (app !== sheet) {
        app.window.content?.classList.remove(this.DROP_SHEET_CLASS);
      }
    });
  }

  /** @inheritDoc */
  _handleDragStart(event) {
    super._handleDragStart(event);
    TeriockDragDrop.initializeDrag(event);
    TeriockDragDrop.setDefaultDragEventData(event);
  }
}
