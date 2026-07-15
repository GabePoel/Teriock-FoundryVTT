import { ThresholdRoll } from "../../../../../../dice/rolls/_module.mjs";

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
       * Rolls a feat save with optional advantage/disadvantage.
       * @param {PointerEvent} event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
       */
      static async #onRollFeatSave(event, target) {
        await this.actor.system.rollFeatSave(target.dataset.attribute, { event });
      }

      /**
       * Rolls hexproof resistance with optional advantage/disadvantage.
       * @param {PointerEvent} event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
       */
      static async #onRollHexproof(event, target) {
        await this.actor.system.rollResistance(Object.assign(protectionOptions(event, target), { hex: true }));
      }

      /**
       * Rolls hexseal immunity.
       * @param {PointerEvent} event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
       */
      static async #onRollHexseal(event, target) {
        await this.actor.system.rollImmunity(Object.assign(protectionOptions(event, target), { hex: true }));
      }

      /**
       * Rolls immunity.
       * @param {PointerEvent} event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
       */
      static async #onRollImmunity(event, target) {
        await this.actor.system.rollImmunity(protectionOptions(event, target));
      }

      /**
       * Rolls resistance with optional advantage/disadvantage.
       * @param {PointerEvent} event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
       */
      static async #onRollResistance(event, target) {
        await this.actor.system.rollResistance(protectionOptions(event, target));
      }

      /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          rollFeatSave: { buttons: [0, 2], handler: this.#onRollFeatSave },
          rollHexproof: { buttons: [0, 2], handler: this.#onRollHexproof },
          rollHexseal: { buttons: [0, 2], handler: this.#onRollHexseal },
          rollImmunity: { buttons: [0, 2], handler: this.#onRollImmunity },
          rollResistance: { buttons: [0, 2], handler: this.#onRollResistance },
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

/**
 * Get the protection options for a target.
 * @param {PointerEvent} event - The event object.
 * @param {HTMLElement} target
 * @returns {Partial<Teriock.Execution.ImmunityExecutionOptions>}
 */
function protectionOptions(event, target) {
  const img = target.querySelector("img");
  const block = target.closest(".teriock-block");
  const options = {
    wrappers: [
      block?.querySelector(".teriock-block-title")?.textContent || "",
      block?.querySelector(".teriock-block-subtitle")?.textContent || "",
    ],
  };
  if (img?.src) { options.img = img.src; }
  return Object.assign(options, ThresholdRoll.parseEvent(event));
}
