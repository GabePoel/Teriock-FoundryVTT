import { icons } from "../../../../../../constants/display/_module.mjs";
import { createElement } from "../../../../../../helpers/html.mjs";
import { asInf, makeIconClass } from "../../../../../../helpers/icon.mjs";
import { toId, toKebabCase } from "../../../../../../helpers/string.mjs";
import { consolidateWriteOperations } from "../../../../../../helpers/utils.mjs";
import { DocumentSelector } from "../../../../../dialogs/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function PlayableActorSheetMechanicalPart(Base) {
  /** @mixin */
  class PlayableActorSheetMechanicalPart extends Base {
    /**
     * Pull from the Death Bag.
     * @returns {Promise<void>}
     */
    static async #onDeathBagPull() {
      if (!this.isEditable) { return; }
      await this.actor.system.deathBagPull();
    }

    /**
     * Quickly uses an item with optional modifiers.
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     */
    static async #onQuickUse(event, target) {
      const id = target.dataset.id;
      const item = this.document.items.get(id);
      const options = { event };
      if (target.dataset.dealImpacts === "false") { options.dealImpacts = false; }
      if (target.dataset.dealImpacts === "true") { options.dealImpacts = true; }
      if (item) { await item.use(options); }
    }

    /**
     * Take a dawn.
     * @returns {Promise<void>}
     */
    static async #onTakeDawn() {
      if (!this.isEditable) { return; }
      await this.actor.system.takeDawn();
    }

    /**
     * Take a dusk.
     * @returns {Promise<void>}
     */
    static async #onTakeDusk() {
      if (!this.isEditable) { return; }
      await this.actor.system.takeDusk();
    }

    /**
     * Take a long rest.
     * @returns {Promise<void>}
     */
    static async #onTakeLongRest() {
      if (!this.isEditable) { return; }
      await this.actor.system.takeLongRest();
    }

    /**
     * Take a short rest.
     * @returns {Promise<void>}
     */
    static async #onTakeShortRest() {
      if (!this.isEditable) { return; }
      await this.actor.system.takeShortRest();
    }

    /**
     * Toggles a condition.
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     */
    static async #onToggleCondition(event, target) {
      if (event.button === 2) {
        const document = await teriock.fromIdentifier(`condition:${toKebabCase(target.dataset.condition)}`);
        await document?.sheet.render(true);
      }
      if (event.button === 0) {
        if (!game.teriock.checkEditable(this)) { return; }
        await this.document.toggleStatusEffect(target.dataset.condition);
      }
    }

    /**
     * Toggle Documents to be enabled or disabled.
     * @param {PointerEvent} _event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     */
    static async #onToggleDocs(_event, target) {
      if (!game.teriock.checkEditable(this)) { return; }
      const docs = foundry.utils.getProperty(this.document, target.dataset.path) ?? [];
      const enabled = await DocumentSelector.selectMulti(docs, {
        checked: docs.filter(d => !d.disabled).map(r => r.uuid),
        reportCancel: true,
      });
      if (!enabled) { return; }
      const freeOps = docs.filter(d => d.metadata.disabledPath).map(d => {
        return {
          action: "update",
          documentName: d.documentName,
          pack: d.pack,
          parent: d.parent,
          updates: [{ _id: d.id, [d.metadata.disabledPath]: !enabled.includes(d) }],
        };
      });
      await foundry.documents.modifyBatch(consolidateWriteOperations(freeOps));
    }

    /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
    static DEFAULT_OPTIONS = {
      actions: {
        deathBagPull: this.#onDeathBagPull,
        quickUse: { buttons: [0, 2], handler: this.#onQuickUse },
        takeDawn: this.#onTakeDawn,
        takeDusk: this.#onTakeDusk,
        takeLongRest: this.#onTakeLongRest,
        takeShortRest: this.#onTakeShortRest,
        toggleCondition: { buttons: [0, 2], handler: this.#onToggleCondition },
        toggleDocs: this.#onToggleDocs,
      },
      window: {
        controls: [{
          action: "deathBagPull",
          icon: makeIconClass(icons.manifest.execution.deathBag, "contextMenu"),
          label: "TERIOCK.SHEETS.Actor.ACTIONS.DeathBagPull.label",
          ownership: "OWNER",
          visible() {
            return this.isEditable;
          },
        }, {
          action: "takeLongRest",
          icon: makeIconClass(icons.manifest.execution.longRest, "contextMenu"),
          label: "TERIOCK.SHEETS.Actor.ACTIONS.TakeLongRest.label",
          ownership: "OWNER",
          visible() {
            return this.isEditable;
          },
        }, {
          action: "takeShortRest",
          icon: makeIconClass(icons.manifest.execution.shortRest, "contextMenu"),
          label: "TERIOCK.SHEETS.Actor.ACTIONS.TakeShortRest.label",
          ownership: "OWNER",
          visible() {
            return this.isEditable;
          },
        }],
      },
    };

    /** @inheritDoc */
    async _prepareContext(options = {}) {
      const context = await super._prepareContext(options);
      context.senses = {};
      for (const key of Object.keys(TERIOCK.config.character.sense)) {
        context.senses[key] = {
          source: toRangeHTML(this.document.system._source.senses[key]),
          value: toRangeHTML(this.document.system.senses[key]),
        };
      }
      context.conditions = {};
      for (const key of Object.keys(TERIOCK.statuses.conditions)) {
        const id = toId(key);
        context.conditions[key] = Boolean(this.document.effects.get(id)?.isStatus);
      }
      return context;
    }
  }

  return PlayableActorSheetMechanicalPart;
}

/**
 * @param {number|null} range
 * @returns {string}
 */
function toRangeHTML(range) {
  if ([Infinity, null].includes(range)) { return asInf(range); }
  return createElement("span", {
    innerText: _loc("TERIOCK.MODELS.BaseUnit.FORMAT", {
      number: range,
      unit: _loc("TERIOCK.MODELS.LengthUnit.UNITS.ft.symbol"),
    }),
  }).outerHTML;
}
