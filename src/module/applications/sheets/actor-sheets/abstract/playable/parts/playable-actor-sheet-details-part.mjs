import { asInf, createElement } from "../../../../../../utils/_module.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 * @import { HandlebarsTemplatePart } from "@client/applications/api/handlebars-application.mjs";
 */

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function PlayableActorSheetDetailsPart(Base) {
  /** @mixin */
  class PlayableActorSheetDetailsPart extends Base {
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

    /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
    static DEFAULT_OPTIONS = { actions: { setMovementAction: this.#onSetMovementAction } };

    /** @type {Record<string, HandlebarsTemplatePart & Teriock.Sheet._TemplatePart>} */
    static PARTS = {
      ...super.PARTS,
      details: { scrollable: [""], template: "teriock/sheets/actors/tabs/details-tab" },
    };

    /** @inheritDoc */
    async _preparePartContext(partId, context, options) {
      context = await super._preparePartContext(partId, context, options);
      if (partId !== "details") { return context; }
      context.senses = {};
      for (const key of Object.keys(TERIOCK.CONFIG.actor.senses)) {
        context.senses[key] = {
          source: toRangeHTML(this.document.system._source.senses[key]),
          value: toRangeHTML(this.document.system.senses[key]),
        };
      }
      context.sizeDetails = {
        reach: toRangeHTML(this.document.system.size.reach),
        space: _loc("TERIOCK.SHEETS.Actor.Details.size.spaceFormat", {
          length: this.document.system.size.length * game.system.grid.distance,
          unit: _loc("TERIOCK.LENGTH.ft.symbol"),
        }),
      };
      const unit = _loc("TERIOCK.SHEETS.Actor.Details.movementSpeed.rate");
      context.movementSpeed = {
        data: _loc("TERIOCK.MODELS.BaseUnit.FORMAT", { number: this.document.system.movementSpeed, unit }),
        source: this.document.system._source.movementSpeed === null
          ? null
          : _loc("TERIOCK.MODELS.BaseUnit.FORMAT", { number: this.document.system._source.movementSpeed, unit }),
      };
      const activeSpeedAdjustments = this.document.system.activeSpeedAdjustments;
      const hasToken = Boolean(this.document.defaultToken);
      context.speedAdjustments = Object.fromEntries(
        Object.entries(TERIOCK.CONFIG.actor.movement).map(([k, v]) => {
          return [k, {
            active: hasToken && activeSpeedAdjustments.has(k),
            canSet: hasToken && Boolean(v.movementAction),
            icon: v.icon,
            label: v.label,
            movementAction: v.movementAction,
            tooltip: _loc("TERIOCK.SHEETS.Actor.Details.movementSpeed.tooltip", {
              name: _loc(CONFIG.Token.movement.actions[v.movementAction]?.label ?? "COMMON.No"),
            }),
          }];
        }),
      );
      context.terrains = Array.from(this.document.system.terrains, t => TERIOCK.CONFIG.terrain.terrains[t]);
      context.taxonomy = this.document.system._taxonomyTags.map(t => ({ ...t, tooltip: _loc(t.tooltip) }));
      const sourceWeight = this.document.system.weight.self.clone();
      context.weight = {
        data: this.document.system.weight.self.tag,
        source: sourceWeight.isDefault ? null : sourceWeight.tag,
      };
      return context;
    }
  }

  return PlayableActorSheetDetailsPart;
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
