import { TeriockDialog } from "../../../../../../applications/api/_module.mjs";
import { makeIcon, makeIconClass } from "../../../../../../utils/_module.mjs";
import { speciesMorphFields } from "../../../../../fields/tools/morph-fields.mjs";

const { fields } = foundry.data;

/**
 * @import { ActorMorphPart } from "../../../../actors/abstract/base-actor-system/parts/morph-part/actor-morph-part.mjs";
 * @import { MorphSystemMixin } from "../../../../mixins/morph-system-mixin/morph-system-mixin.mjs";
 */

/**
 * Species data model mixin that handles morph behavior.
 *
 * Relevant wiki pages:
 * - [Transformed](https://wiki.teriock.com/index.php/Condition:Transformed)
 *
 * @template {MixinBase} T
 * @param {T} Base
 * @see {ActorMorphPart}
 * @see {MorphSystemMixin}
 * @category Morph
 */
export default function SpeciesMorphPart(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.SpeciesMorphPartData}
   * @property {TeriockItem<"species">} parent
   */
  class SpeciesMorphPart extends /** @type {InitializedDataModel<T, Teriock.Models.SpeciesMorphPartData>} */ (Base) {
    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), { morph: new fields.SchemaField(speciesMorphFields()) });
    }

    /** @inheritDoc */
    static migrateData(source, options) {
      foundry.abstract.Document._addDataFieldMigration(source, "transformation", "morph");
      return super.migrateData(source, options);
    }

    /** @inheritDoc */
    get _displayInputs() {
      return [
        ...super._displayInputs,
        ...["system.morph.img", "system.morph.ringImg"].map(path => ({ group: "morph", path })),
      ];
    }

    /**
     * Whether this is part of an inactive morph.
     * @returns {boolean}
     */
    get _isInactiveMorph() {
      return this.isMorph && this.morphEffect && !this.morphEffect.active;
    }

    /**
     * Whether this is part of a morph.
     * @returns {boolean}
     */
    get isMorph() {
      return Boolean(this.morphEffect);
    }

    /**
     * Whether this is a primary morph species.
     * @returns {boolean}
     */
    get isPrimaryMorph() {
      if (this.isMorph) {
        const morphEffect = this.morphEffect;
        if (morphEffect?.system.isPrimaryMorph) { return true; }
      }
      return false;
    }

    /**
     * Morph that provides this.
     * @returns {TeriockActiveEffect<"condition"|"consequence"|"holiday">|null}
     */
    get morphEffect() {
      if (!this.actor) { return null; }
      if (!this.parent.dependee?.system.isMorph) { return null; }
      return this.parent.dependee ?? null;
    }

    /** @inheritDoc */
    _canToggleStatDice(stat) {
      return super._canToggleStatDice(stat) && !this._isInactiveMorph;
    }

    /** @inheritDoc */
    _getTipSuppressions() {
      return Object.assign(super._getTipSuppressions(), {
        inactiveMorph: this._isSuppressedMorphInactive.bind(this),
        notPrimary: this._isSuppressedMorphSecondary.bind(this),
      });
    }

    /**
     * If this is suppressed due to its morph effect being inactive.
     * @returns {boolean}
     */
    _isSuppressedMorphInactive() {
      return Boolean(this.isMorph && this.parent.actor && this.morphEffect && !this.morphEffect.active);
    }

    /**
     * If this is suppressed due to not being the primary morph species.
     * @returns {boolean}
     */
    _isSuppressedMorphSecondary() {
      return Boolean(this.isMorph && this.parent.actor && !this.isPrimaryMorph);
    }

    /** @inheritDoc */
    _onDelete(options, userId) {
      super._onDelete(options, userId);
      if (options.interactive && this.morphEffect && this.getNearestDocument().checkEditor(userId)) {
        TeriockDialog.confirm({
          content: _loc("TERIOCK.SYSTEMS.Species.DIALOG.deleteEffect.content"),
          modal: true,
          rejectClose: false,
          window: {
            icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.effect.morph, "title"),
            title: _loc("TERIOCK.SYSTEMS.Species.DIALOG.deleteEffect.title"),
          },
        }).then((p) => {
          if (p) { this.morphEffect.delete(); }
        });
      }
    }

    /** @inheritDoc */
    getEmbedContextMenuEntries(doc) {
      const isPrimarySpecies = this.morphEffect?.system.primarySpecies === this.parent;
      return [...super.getEmbedContextMenuEntries(doc), {
        group: "control",
        icon: makeIcon(TERIOCK.DISPLAY.icons.manifest.effect.morph, "contextMenu"),
        label: _loc("TERIOCK.SYSTEMS.Species.MENU.setPrimaryMorph"),
        onClick: this.setPrimaryMorph.bind(this),
        visible: this.isMorph && !(this.isPrimaryMorph && isPrimarySpecies),
      }];
    }

    /** @inheritDoc */
    getLocalRollData() {
      const data = super.getLocalRollData();
      Object.assign(data, { morph: Number(this.isMorph), "morph.primary": Number(this.isPrimaryMorph) });
      return data;
    }

    /** @inheritDoc */
    prepareBaseData() {
      super.prepareBaseData();
      this.morph.ring = null;
      if (this.morph.ringImg) { this.morph.ring = true; }
      else if (this.morph.img) { this.morph.ring = false; }
    }

    /**
     * Set the effects controlling this morph as the primary morph and this as its primary species.
     * @returns {Promise<void>}
     */
    async setPrimaryMorph() {
      await this.morphEffect?.system.setPrimaryMorph(this.parent);
    }
  }

  return SpeciesMorphPart;
}
