import * as createEffects from "../../../../../helpers/create-effects.mjs";
import {
  selectAbilityDialog,
  selectPropertyDialog,
  selectTradecraftDialog,
} from "../../../../dialogs/select-dialog.mjs";

export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {DocumentSheetV2}
     * @property {TeriockCommon} document
     */
    class DocumentCreationCommonSheetPart extends Base {
      static DEFAULT_OPTIONS = {
        actions: {
          createAbility: this._createAbility,
          createBaseEffect: this._createBaseEffect,
          createFluency: this._createFluency,
          createProperty: this._createProperty,
          createResource: this._createResource,
        },
      };

      /**
       * Creates a new ability for the current document.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} _target - The target element.
       * @returns {Promise<void>} Promise that resolves to the created ability.
       */
      static async _createAbility(_event, _target) {
        const abilityKey = await selectAbilityDialog();
        let abilityName = "New Ability";
        if (abilityKey) {
          if (abilityKey !== "other") {
            abilityName = TERIOCK.index.abilities[abilityKey];
            await tm.fetch.importAbility(this.document, abilityName);
          } else {
            await createEffects.createAbility(this.document, abilityName);
          }
        }
      }

      /**
       * Creates a new base effect for the current document.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} _target - The target element.
       * @returns {Promise<void>} Promise that resolves to the created fluency.
       */
      static async _createBaseEffect(_event, _target) {
        await createEffects.createBaseEffect(this.document);
      }

      /**
       * Creates new fluency for the current document.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} _target - The target element.
       * @returns {Promise<void>} Promise that resolves to the created fluency.
       */
      static async _createFluency(_event, _target) {
        const tradecraft = await selectTradecraftDialog();
        if (tradecraft) {
          await createEffects.createFluency(this.document, tradecraft);
        }
      }

      /**
       * Creates a new property for the current document.
       * Shows a dialog to select a property type or create a new one.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} _target - The target element.
       * @returns {Promise<void>} Promise that resolves to the created property.
       */
      static async _createProperty(_event, _target) {
        const propertyKey = await selectPropertyDialog();
        let propertyName = "New Property";
        if (propertyKey) {
          if (propertyKey !== "other") {
            propertyName = TERIOCK.index.properties[propertyKey];
            await tm.fetch.importProperty(this.document, propertyName);
          } else {
            await createEffects.createProperty(this.document, propertyName);
          }
        }
      }

      /**
       * Creates a new resource for the current document.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} _target - The target element.
       * @returns {Promise<void>} Promise that resolves to the created resource.
       */
      static async _createResource(_event, _target) {
        await createEffects.createResource(this.document);
      }
    }
  );
};
