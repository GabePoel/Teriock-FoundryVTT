/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function PlayableActorSheetTradecraftsPart(Base) {
  /** @mixin */
  class PlayableActorSheetTradecraftsPart extends Base {
    /**
     * Rolls a tradecraft check with optional advantage/disadvantage.
     * @param {PointerEvent} event
     * @param {HTMLElement} target
     * @returns {Promise<void>}
     */
    static async #onRollTradecraft(event, target) {
      await this.actor.take("tradecraft", { event, tradecraft: target.dataset.tradecraft });
    }

    /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
    static DEFAULT_OPTIONS = { actions: { rollTradecraft: { buttons: [0, 2], handler: this.#onRollTradecraft } } };

    /** @inheritDoc */
    async _prepareContext(options = {}) {
      const context = await super._prepareContext(options);

      /**
       * Builds a field entry with its tradecrafts nested underneath it.
       * @param {Teriock.Keys.Field} fieldKey
       * @returns {object}
       */
      const buildField = fieldKey => {
        const field = foundry.utils.deepClone(TERIOCK.CONFIG.tradecraft.fields[fieldKey]);
        field.tradecrafts = Object.fromEntries(
          Object.entries(TERIOCK.CONFIG.tradecraft.tradecrafts).filter(([_tcKey, tcData]) => tcData.field === fieldKey)
            .map(([tcKey, tcData]) => [tcKey, foundry.utils.deepClone(tcData)]),
        );
        return field;
      };

      const tcFields = {};
      for (const fieldKey of Object.keys(TERIOCK.CONFIG.tradecraft.fields)) {
        if (fieldKey !== "prestige") { tcFields[fieldKey] = buildField(fieldKey); }
      }
      context.tradecraftFields = tcFields;

      const p1 = buildField("prestige");
      const p2 = buildField("prestige");
      delete p1.tradecrafts.tinkerer;
      delete p2.tradecrafts.metaphysicist;
      context.prestigeFields = { p1, p2 };

      const index = game.packs.get("teriock.player").index;
      context.tradecraftMacros = Object.fromEntries(
        Object.keys(TERIOCK.CONFIG.tradecraft.tradecrafts).map(
          tc => [tc, index.getName(`Make ${tc.capitalize()} Check`)?.uuid]
        ),
      );

      // Update score tooltips if more scores amounts defined.
      const scoreLabel = score =>
        _loc(`TERIOCK.SHEETS.Actor.TABS.Tradecrafts.score.levels.${Math.min(Math.max(score ?? 0, -3), 4)}`);
      const competenceIconClass = level =>
        TERIOCK.CONFIG.competence.levels[Math.min(Math.max(level ?? 0, 0), 2)].simpleIconClass;
      context.tradecraftDisplay = Object.fromEntries(
        Object.keys(TERIOCK.CONFIG.tradecraft.tradecrafts).map(key => {
          const tradecraft = this.document.system.tradecrafts[key];
          const source = this.document.system._source.tradecrafts[key];
          return [key, {
            competenceIconClass: competenceIconClass(tradecraft?.competence?.raw),
            scoreLabel: scoreLabel(tradecraft?.score),
            sourceCompetenceIconClass: competenceIconClass(source?.competence?.raw),
          }];
        }),
      );
      return context;
    }
  }

  return PlayableActorSheetTradecraftsPart;
}
