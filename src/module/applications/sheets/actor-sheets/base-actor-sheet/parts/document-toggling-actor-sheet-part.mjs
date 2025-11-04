import _embeddedFromCard from "../../../mixins/common-sheet-mixin/methods/_embedded-from-card.mjs";

export default (Base) =>
  class DocumentTogglingActorSheetPart extends Base {
    static DEFAULT_OPTIONS = {
      actions: {
        deattuneDoc: this._deattuneDoc,
        setPrimaryTransformation: this._setPrimaryTransformation,
        toggleAttunedDoc: this._toggleAttunedDoc,
        toggleDampenedDoc: this._toggleDampenedDoc,
        toggleDisabledDoc: this._toggleDisabledDoc,
        toggleEquippedDoc: this._toggleEquippedDoc,
        toggleGluedDoc: this._toggleGluedDoc,
        toggleMountedDoc: this._toggleMountedDoc,
        toggleShatteredDoc: this._toggleShatteredDoc,
      },
    };

    /**
     * Deattunes an attunement effect.
     * @param {MouseEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when attunement is removed.
     * @static
     */
    static async _deattuneDoc(event, target) {
      event.stopPropagation();
      const attunement = this.actor.effects.get(target.dataset.id);
      if (attunement) {
        await attunement.delete();
      }
    }

    /**
     * Sets the primary transformation.
     * @param {MouseEvent} event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when primary transformation is set.
     * @private
     */
    static async _setPrimaryTransformation(event, target) {
      event.stopPropagation();
      let transformation = this.actor.effects.get(target.dataset.id);
      if (!transformation) {
        transformation = this.items.get(target.dataset.id).system
          .transformationEffect;
      }
      if (transformation) {
        await transformation.system.setPrimaryTransformation();
      }
    }

    /**
     * Toggles the attuned state of an embedded document.
     * @param {MouseEvent} _event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when toggle is complete.
     * @static
     */
    static async _toggleAttunedDoc(_event, target) {
      const embedded =
        /** @type {TeriockEquipment|null} */
        await _embeddedFromCard(this, target);
      if (embedded.system.isAttuned) {
        await embedded.system.deattune();
      } else {
        await embedded.system.attune();
      }
    }

    /**
     * Toggles the dampened state of an embedded document.
     * @param {MouseEvent} _event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when toggle is complete.
     * @static
     */
    static async _toggleDampenedDoc(_event, target) {
      const embedded =
        /** @type {TeriockEquipment|null} */
        await _embeddedFromCard(this, target);
      if (embedded.system.dampened) {
        await embedded.system.undampen();
      } else {
        await embedded.system.dampen();
      }
    }

    /**
     * Toggles the disabled state of an embedded document.
     * @param {MouseEvent} _event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when toggle is complete.
     * @static
     */
    static async _toggleDisabledDoc(_event, target) {
      const embedded = await _embeddedFromCard(this, target);
      await embedded?.toggleDisabled();
    }

    /**
     * Toggles the equipped state of an embedded document.
     * @param {MouseEvent} _event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when toggle is complete.
     * @static
     */
    static async _toggleEquippedDoc(_event, target) {
      const embedded =
        /** @type {TeriockEquipment|null} */
        await _embeddedFromCard(this, target);
      if (embedded.system.equipped) {
        await embedded.system.unequip();
      } else {
        await embedded.system.equip();
      }
    }

    /**
     * Toggles the glued state of an embedded document.
     * @param {MouseEvent} _event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when toggle is complete.
     * @static
     */
    static async _toggleGluedDoc(_event, target) {
      const embedded =
        /** @type {TeriockEquipment|null} */
        await _embeddedFromCard(this, target);
      if (embedded.system.glued) {
        await embedded.system.unglue();
      } else {
        await embedded.system.glue();
      }
    }

    /**
     * Toggles the mounted state of an embedded document.
     * @param {MouseEvent} _event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when toggle is complete.
     * @static
     */
    static async _toggleMountedDoc(_event, target) {
      const embedded =
        /** @type {TeriockMount|null} */
        await _embeddedFromCard(this, target);
      if (embedded.system.mounted) {
        await embedded.system.unmount();
      } else {
        await embedded.system.mount();
      }
    }

    /**
     * Toggles the shattered state of an embedded document.
     * @param {MouseEvent} _event - The event object.
     * @param {HTMLElement} target - The target element.
     * @returns {Promise<void>} Promise that resolves when toggle is complete.
     * @static
     */
    static async _toggleShatteredDoc(_event, target) {
      const embedded =
        /** @type {TeriockEquipment|null} */
        await _embeddedFromCard(this, target);
      if (embedded.system.shattered) {
        await embedded.system.repair();
      } else {
        await embedded.system.shatter();
      }
    }
  };
