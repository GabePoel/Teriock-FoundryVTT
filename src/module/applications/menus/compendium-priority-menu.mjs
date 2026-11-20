import { makeIconClass, mixClasses } from "../../utils/_module.mjs";
import { DragDropApplicationMixin } from "../api/mixins/_module.mjs";
import { TeriockCompendiumDirectory } from "../sidebar/tabs/_module.mjs";
import BaseMenu from "./base-menu.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

export default class CompendiumPriorityMenu extends mixClasses(BaseMenu, DragDropApplicationMixin) {
  /**
   * Move an identifier source row up or down.
   * @param {PointerEvent} _event
   * @param {HTMLElement} target
   * @this {CompendiumPriorityMenu}
   */
  static #onMoveIdentifierPriority(_event, target) {
    const direction = target?.dataset.identifierPriorityMove;
    /** @type {HTMLLIElement} */
    const row = target?.closest("[data-identifier-priority-row]");
    const collection = row?.dataset.identifierPriorityCollection;
    if (!direction || !collection) { return; }
    if (!this.#moveIdentifierSource(collection, direction)) { return; }
    void this.render();
  }

  /** @type {Partial<ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = {
    actions: { moveIdentifierPriority: this.#onMoveIdentifierPriority, reset: this._onReset },
    position: { width: 500 },
    teriock: { dragDrop: { selectors: { sort: "[data-identifier-priority-row]" } } },
  };

  /**
   * @inheritDoc
   * @this {CompendiumPriorityMenu}
   */
  static async _onReset() {
    super._onReset();
    this.#identifierSourceRows = this.#prepareIdentifierSourceRowContext(
      this.getSettingDefault("identifierSourcePriority"),
    );
    await this.render({ parts: ["identifierSources"] });
  }

  /**
   * The types of documents for whom the compendium collections can be used to establish identifiers.
   * @see {IdentifiersRegistry}
   * @type {Set<string>}
   */
  #collectionDocumentNames = new Set(["ActiveEffect", "Actor", "Item", "JournalEntry"]);

  /**
   * Ordered identifier source rows in current app state.
   * @type {{ collection: string, label: string }[]}
   */
  #identifierSourceRows = [];

  /**
   * Move an identifier source's priority based on the ordered row state.
   * @param {string} collection
   * @param {"up"|"down"} direction
   * @returns {boolean}
   */
  #moveIdentifierSource(collection, direction) {
    const index = this.#identifierSourceRows.findIndex(row => row.collection === collection);
    if (index < 0) { return false; }
    if (direction === "up") {
      if (index === 0) { return false; }
      [this.#identifierSourceRows[index - 1], this.#identifierSourceRows[index]] = [
        this.#identifierSourceRows[index],
        this.#identifierSourceRows[index - 1],
      ];
      return true;
    }
    if (direction === "down") {
      if (index >= this.#identifierSourceRows.length - 1) { return false; }
      [this.#identifierSourceRows[index], this.#identifierSourceRows[index + 1]] = [
        this.#identifierSourceRows[index + 1],
        this.#identifierSourceRows[index],
      ];
      return true;
    }
    return false;
  }

  /**
   * Prepare context for rows based on compendium identifier source priorities.
   * @param {Record<string, number>} sourcePriorities
   * @returns {{ collection: string, label: string, icon: string }[]}
   */
  #prepareIdentifierSourceRowContext(sourcePriorities = {}) {
    const rows = [];
    const packs = game.packs.filter(p => this.#collectionDocumentNames.has(p.documentName));
    for (const pack of packs) {
      rows.push({
        collection: pack.collection,
        icon: makeIconClass(TeriockCompendiumDirectory.getPackIcon(pack), "solid"),
        label: _loc(pack.title),
      });
    }
    return rows.sort((a, b) => {
      const aPriority = sourcePriorities[a.collection] ?? 0;
      const bPriority = sourcePriorities[b.collection] ?? 0;
      if (aPriority !== bPriority) { return bPriority - aPriority; }
      return a.label.localeCompare(b.label, game.i18n.lang);
    });
  }

  /** @inheritDoc */
  _onDragStart(event) {
    event.dataTransfer.effectAllowed = "move";
    super._onDragStart(event);
    const row = event.currentTarget;
    event.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ collection: row.dataset.identifierPriorityCollection, type: "Compendium" }),
    );
  }

  /** @inheritDoc */
  async _onSortDrop({ element }) {
    const order = Array.from(element.parentElement.children, el => el.dataset.identifierPriorityCollection);
    this.#identifierSourceRows.sort((a, b) => order.indexOf(a.collection) - order.indexOf(b.collection));
    await this.render({ parts: ["identifierSources"] });
  }

  /** @inheritDoc */
  _prepareCommitData(event, _form, formData) {
    const merged = super._prepareCommitData(event, _form, formData);
    const identifierSourcePriority = {};
    const rows = this.#identifierSourceRows.length
      ? this.#identifierSourceRows
      : this.#prepareIdentifierSourceRowContext(game.settings.get("teriock", "identifierSourcePriority"));
    const maxPriority = rows.length - 1;
    for (const [index, row] of rows.entries()) {
      const collection = row.collection;
      identifierSourcePriority[collection] = maxPriority - index;
    }
    merged.identifierSourcePriority = identifierSourcePriority;
    return merged;
  }

  /** @inheritDoc */
  async _preparePartContext(partId, context, options) {
    context = await super._preparePartContext(partId, context, options);
    switch (partId) {
      case "identifierSources": {
        if (!this.#identifierSourceRows.length) {
          const sourcePriorities = game.settings.get("teriock", "identifierSourcePriority");
          this.#identifierSourceRows = this.#prepareIdentifierSourceRowContext(sourcePriorities);
        }
        context.identifierSourcePriority = this.#identifierSourceRows.map((row, index) => ({
          ...row,
          priority: index + 1,
        }));
        break;
      }
      default:
        break;
    }
    return context;
  }
}
