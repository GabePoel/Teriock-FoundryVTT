import { attributePanel } from "../../../../../helpers/html.mjs";
import { getIcon } from "../../../../../helpers/path.mjs";
import { TeriockTextEditor } from "../../../../ux/_module.mjs";

export default (Base) =>
  class RollingActorSheetPart extends Base {
    static DEFAULT_OPTIONS = {
      actions: {
        rollFeatSave: this._rollFeatSave,
        rollImmunity: this._rollImmunity,
        rollResistance: this._rollResistance,
        rollStatDie: this._rollStatDie,
      },
    };

    /**
     * Rolls a feat save with optional advantage/disadvantage.
     * @param {MouseEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when feat save is rolled.
     * @static
     */
    static async _rollFeatSave(event, target) {
      const attribute = target.dataset.attribute;
      const options = {};
      if (event.altKey) {
        options.advantage = true;
      }
      if (event.shiftKey) {
        options.disadvantage = true;
      }
      await this.actor.system.rollFeatSave(attribute, options);
    }

    /**
     * Rolls immunity with optional advantage/disadvantage.
     * @param {MouseEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when immunity is rolled.
     * @static
     */
    static async _rollImmunity(event, target) {
      event.stopPropagation();
      let messageParts;
      if (target.classList.contains("tcard-image")) {
        const tcard = target.closest(".tcard");
        const img = target.querySelector("img");
        messageParts = {};
        messageParts.image = img.src;
        messageParts.name = "Immunity";
        messageParts.bars = [
          {
            icon: "fa-shield",
            label: "Immunity",
            wrappers: [
              tcard.querySelector(".tcard-title").textContent,
              tcard.querySelector(".tcard-subtitle").textContent,
            ],
          },
        ];
        messageParts.blocks = [
          {
            title: "Immunity",
            text: TERIOCK.content.keywords.immunity,
          },
        ];
        messageParts.icon = "shield-halved";
        messageParts.label = "Protection";
      }
      const panels = messageParts
        ? [await TeriockTextEditor.enrichPanel(messageParts)]
        : [];
      /** @type {Teriock.RollOptions.CommonRoll} */
      const options = {
        advantage: event.altKey,
        disadvantage: event.shiftKey,
        panels: panels,
      };
      await this.actor.system.rollImmunity(options);
    }

    /**
     * Rolls resistance with optional advantage/disadvantage.
     * @param {MouseEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when resistance is rolled.
     * @static
     */
    static async _rollResistance(event, target) {
      event.stopPropagation();
      let messageParts;
      /** @type {Teriock.MessageData.MessagePanel} */
      if (target.classList.contains("tcard-image")) {
        const tcard = target.closest(".tcard");
        const img = target.querySelector("img");
        messageParts = {};
        messageParts.image = img.src || getIcon("effect-types", "Resistance");
        messageParts.name = "Resistance";
        messageParts.bars = [
          {
            icon: "fa-shield",
            label: "Resistance",
            wrappers: [
              tcard.querySelector(".tcard-title").textContent || "",
              tcard.querySelector(".tcard-subtitle").textContent || "",
            ],
          },
        ];
        messageParts.blocks = [
          {
            title: "Resistance",
            text: TERIOCK.content.keywords.resistance,
          },
        ];
        messageParts.icon = "shield-halved";
        messageParts.label = "Protection";
      }
      const panels = messageParts
        ? [await TeriockTextEditor.enrichPanel(messageParts)]
        : [];
      const options = {
        advantage: event.altKey,
        disadvantage: event.shiftKey,
        panels: panels,
      };
      await this.actor.system.rollResistance(options);
    }

    async _prepareContext(options) {
      const context = await super._prepareContext(options);
      context.attributeTooltips = {};
      for (const attribute of Object.keys(TERIOCK.index.attributes)) {
        context.attributeTooltips[attribute] =
          await TeriockTextEditor.makeTooltip(await attributePanel(attribute));
      }
      return context;
    }
  };
