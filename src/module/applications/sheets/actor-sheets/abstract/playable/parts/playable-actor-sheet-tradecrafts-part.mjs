/**
 * @param {typeof BaseActorSheet} Base
 */
export default function PlayableActorSheetTradecraftsPart(Base) {
  return (
    /**
     * @extends {BaseActorSheet}
     * @mixin
     */
    class PlayableActorSheetTradecraftsPart extends Base {
      /**
       * Rolls a tradecraft check with optional advantage/disadvantage.
       * @param {PointerEvent} event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
       */
      static async #onRollTradecraft(event, target) {
        await this.actor.system.rollTradecraft(target.dataset.tradecraft, { event });
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
          const field = foundry.utils.deepClone(TERIOCK.config.tradecraft.fields[fieldKey]);
          field.tradecrafts = Object.fromEntries(
            Object.entries(TERIOCK.config.tradecraft.tradecrafts).filter(([_tcKey, tcData]) =>
              tcData.field === fieldKey
            ).map(([tcKey, tcData]) => [tcKey, foundry.utils.deepClone(tcData)]),
          );
          return field;
        };

        const tcFields = {};
        for (const fieldKey of Object.keys(TERIOCK.config.tradecraft.fields)) {
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
          Object.entries(TERIOCK.index.tradecrafts).map((
            [tc, name],
          ) => [tc, index.getName(`Make ${name} Check`)?.uuid]),
        );

        const scoreIconClass = score => {
          if (score >= 3) { return "fa-fw fa-light mic ms-check-circle"; }
          if (score >= 2) { return "fa-fw fa-regular fa-check-double"; }
          if (score >= 1) { return "fa-fw fa-regular fa-check"; }
          return "fa-fw fa-regular fa-xmark";
        };
        const scoreLabel = score =>
          _loc(`TERIOCK.SHEETS.Actor.TABS.Tradecrafts.score.${Math.min(Math.max(score ?? 0, 0), 3)}`);
        const competenceIconClass = level =>
          TERIOCK.config.competence.levels[Math.min(Math.max(level ?? 0, 0), 2)].simpleIconClass;
        context.tradecraftDisplay = Object.fromEntries(
          Object.keys(TERIOCK.index.tradecrafts).map(key => {
            const tradecraft = this.document.system.tradecrafts[key];
            const source = this.document.system._source.tradecrafts[key];
            const score = tradecraft?.score ?? 0;
            const sourceScore = source?.score ?? 0;
            return [key, {
              competenceIconClass: competenceIconClass(tradecraft?.competence?.raw),
              scoreIconClass: scoreIconClass(score),
              scoreLabel: scoreLabel(score),
              sourceCompetenceIconClass: competenceIconClass(source?.competence?.raw),
              sourceScoreIconClass: scoreIconClass(sourceScore),
            }];
          }),
        );
        return context;
      }
    }
  );
}
