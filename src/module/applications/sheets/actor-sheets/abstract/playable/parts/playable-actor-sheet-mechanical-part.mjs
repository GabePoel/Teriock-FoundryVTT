import {
  asInf,
  consolidateWriteOperations,
  createElement,
  makeIconClass,
  toId,
  toKebabCase,
} from "../../../../../../utils/_module.mjs";
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
      await this.actor.run("bag");
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
      if (target.dataset.dealCommands === "false") { options.dealCommands = false; }
      if (target.dataset.dealCommands === "true") { options.dealCommands = true; }
      if (item) { await item.use(options); }
    }

    /**
     * Set the movement action of this actor's tokens.
     * @param {PointerEvent} _event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     */
    static async #onSetMovementAction(_event, target) {
      if (!game.teriock.checkEditable(this)) { return; }
      const tokens = this.document.token ? [this.document.token] : this.document.getActiveTokens(true, true);
      const updates = tokens.map(t => ({ _id: t.id, movementAction: target.dataset.movementAction }));
      await tokens[0]?.parent.updateEmbeddedDocuments("Token", updates);
    }

    /**
     * Take a long rest.
     * @returns {Promise<void>}
     */
    static async #onTakeLongRest() {
      if (!this.isEditable) { return; }
      await this.actor.run("longRest");
    }

    /**
     * Take a short rest.
     * @returns {Promise<void>}
     */
    static async #onTakeShortRest() {
      if (!this.isEditable) { return; }
      await this.actor.run("shortRest");
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
        setMovementAction: this.#onSetMovementAction,
        takeLongRest: this.#onTakeLongRest,
        takeShortRest: this.#onTakeShortRest,
        toggleCondition: { buttons: [0, 2], handler: this.#onToggleCondition },
        toggleDocs: this.#onToggleDocs,
      },
      window: {
        controls: [{
          action: "deathBagPull",
          icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.execution.deathBag, "contextMenu"),
          label: "TERIOCK.SHEETS.Actor.ACTIONS.DeathBagPull.label",
          ownership: "OWNER",
          visible() {
            return this.isEditable;
          },
        }, {
          action: "takeLongRest",
          icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.execution.longRest, "contextMenu"),
          label: "TERIOCK.SHEETS.Actor.ACTIONS.TakeLongRest.label",
          ownership: "OWNER",
          visible() {
            return this.isEditable;
          },
        }, {
          action: "takeShortRest",
          icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.execution.shortRest, "contextMenu"),
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
      for (const key of Object.keys(TERIOCK.CONFIG.character.sense)) {
        context.senses[key] = {
          source: toRangeHTML(this.document.system._source.senses[key]),
          value: toRangeHTML(this.document.system.senses[key]),
        };
      }
      const { heavy, light, max } = this.document.system.carryingCapacity;
      context.carrying = {
        fill: Math.clamp(this.document.system.weight.carried / max, 0, 1) * 100,
        heavy: (heavy / max) * 100,
        level: [light, heavy, max].filter(c => this.document.system.weight.carried >= c).length,
        light: (light / max) * 100,
      };
      context.sizeDetails = {
        reach: toRangeHTML(this.document.system.size.reach),
        space: _loc("TERIOCK.SHEETS.Actor.TABS.Details.size.spaceFormat", {
          length: this.document.system.size.length * game.system.grid.distance,
          unit: _loc("TERIOCK.LENGTH.ft.symbol"),
        }),
      };
      const unit = _loc("TERIOCK.SHEETS.Actor.TABS.Details.movementSpeed.rate");
      context.movementSpeed = {
        data: _loc("TERIOCK.MODELS.BaseUnit.FORMAT", { number: this.document.system.movementSpeed, unit }),
        source: this.document.system._source.movementSpeed === null
          ? null
          : _loc("TERIOCK.MODELS.BaseUnit.FORMAT", { number: this.document.system._source.movementSpeed, unit }),
      };
      context.activeSpeedAdjustments = Object.fromEntries(
        Array.from(this.document.system.activeSpeedAdjustments, k => [k, true]),
      );
      context.terrains = Array.from(this.document.system.terrains, t => TERIOCK.CONFIG.terrain[t]);
      const sourceWeight = this.document.system.weight.self.clone();
      context.weight = {
        data: this.document.system.weight.self.tag,
        source: sourceWeight.isDefault ? null : sourceWeight.tag,
      };
      context.conditions = {};
      for (const key of Object.keys(TERIOCK.STATUSES.conditions)) {
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
    innerText: _loc("TERIOCK.MODELS.BaseUnit.FORMAT", { number: range, unit: _loc("TERIOCK.LENGTH.ft.symbol") }),
  }).outerHTML;
}
