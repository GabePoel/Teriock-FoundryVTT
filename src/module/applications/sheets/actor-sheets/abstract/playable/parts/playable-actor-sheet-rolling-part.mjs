import { FakeAffinityModel } from "../../../../../../data/models/_module.mjs";

/**
 * @param {typeof BaseActorSheet} Base
 */
export default function PlayableActorSheetRollingPart(Base) {
  return (
    /**
     * @extends {BaseActorSheet}
     * @mixin
     */
    class PlayableActorSheetRollingPart extends Base {
      /**
       * Rolls an affinity.
       * @param {PointerEvent} event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
       */
      static async #onRollAffinity(event, target) {
        const [fakeName, id] = (target.closest(".teriock-block")?.dataset.uuid ?? "").split(".");
        const affinity = fakeName === FakeAffinityModel.FAKE_NAME ? this.actor.system.derivedAffinities[id] : null;
        const type = affinity?.type ?? target.closest("[data-affinity-type]")?.dataset.affinityType;
        if (!type) { return; }
        await this.actor.system.rollAffinity(type, { affinity, event });
      }

      /**
       * Rolls a feat save.
       * @param {PointerEvent} event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
       */
      static async #onRollFeatSave(event, target) {
        await this.actor.system.rollFeatSave(target.dataset.attribute, { event });
      }

      /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          rollAffinity: { buttons: [0, 2], handler: this.#onRollAffinity },
          rollFeatSave: { buttons: [0, 2], handler: this.#onRollFeatSave },
          rollStatDie: { buttons: [0], handler: this._onRollStatDie },
        },
      };

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        const index = game.packs.get("teriock.player").index;
        context.attributeMacros = Object.fromEntries(
          Object.keys(TERIOCK.index.attributesFull).map(
            att => [att, index.getName(`Make ${att.toUpperCase()} Feat Save`)?.uuid]
          ),
        );
        const competenceIconClass = level =>
          TERIOCK.config.competence.levels[Math.min(Math.max(level ?? 0, 0), 2)].simpleIconClass;
        context.attributeDisplay = Object.fromEntries(
          Object.keys(TERIOCK.index.attributesFull).map(key => {
            const attribute = this.document.system.attributes[key];
            const source = this.document.system._source.attributes[key];
            return [key, {
              competenceIconClass: competenceIconClass(attribute?.competence?.raw),
              sourceCompetenceIconClass: competenceIconClass(source?.competence?.raw),
            }];
          }),
        );
        return context;
      }
    }
  );
}
