import { TeriockDialog } from "../../../../../../applications/api/_module.mjs";
import statConfig from "../../../../../../constants/config/stat-config.mjs";
import { makeIcon, makeIconClass } from "../../../../../../helpers/icon.mjs";
import { speciesTransformationFields } from "../../../../../fields/tools/transformation-fields.mjs";

const { fields } = foundry.data;

const POOL_STATS = Object.keys(statConfig).filter(k => statConfig[k].pool?.enabled);

/**
 * @import { ActorTransformationPart } from "../../../../actors/base-actor-system/parts/transformation-part/actor-transformation-part.mjs";
 * @import { TransformationSystemMixin } from "../../../../mixins/transformation-system-mixin/transformation-system-mixin.mjs";
 */

/**
 * Species data model mixin that handles transformation behavior.
 *
 * Relevant wiki pages:
 * - [Transformed](https://wiki.teriock.com/index.php/Condition:Transformed)
 *
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, SpeciesTransformationPart & Teriock.Models.SpeciesTransformationPartData>}
 * @see {ActorTransformationPart}
 * @see {TransformationSystemMixin}
 */
export default function SpeciesTransformationPart(Base) {
  /**
   * @implements {Teriock.Models.SpeciesTransformationPartData}
   * @mixin
   * @property {TeriockSpecies} parent
   */
  class SpeciesTransformationPart extends Base {
    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        transformation: new fields.SchemaField(speciesTransformationFields()),
      });
    }

    /** @inheritDoc */
    get _color() {
      if (this.isTransformation) {
        if (this.transformationEffect.system.transformation.level === "minor") {
          return TERIOCK.display.colors.palette.blue;
        }
        if (this.transformationEffect.system.transformation.level === "full") {
          return TERIOCK.display.colors.palette.green;
        }
        if (this.transformationEffect.system.transformation.level === "greater") {
          return TERIOCK.display.colors.palette.purple;
        }
      }
      return super._color;
    }

    /** @inheritDoc */
    get _displayInputs() {
      return [...super._displayInputs, "system.transformation.img", "system.transformation.ringImg"];
    }

    /**
     * Whether this is part of an inactive transformation.
     * @returns {boolean}
     */
    get _isInactiveTransformation() {
      return this.isTransformation && this.transformationEffect && !this.transformationEffect.active;
    }

    /** @inheritDoc */
    get _traitTags() {
      const tags = super._traitTags;
      if (this.transformationEffect?.system.transformation.level) {
        tags.push({
          label: TERIOCK.config.transformation.level[this.transformationEffect.system.transformation.level],
          tooltip: "TERIOCK.SYSTEMS.Species.FIELDS.transformationLevel.label",
        });
      }
      return tags;
    }

    /**
     * Whether this is a primary transformation species.
     * @returns {boolean}
     */
    get isPrimaryTransformation() {
      if (this.isTransformation) {
        const transformationEffect = this.transformationEffect;
        if (transformationEffect && transformationEffect.system.isPrimaryTransformation) { return true; }
      }
      return false;
    }

    /**
     * Whether this is part of a transformation.
     * @returns {boolean}
     */
    get isTransformation() {
      return Boolean(this.transformationEffect) && this.transformationEffect.system.isTransformation;
    }

    /**
     * Transformation that provides this.
     * @returns {TeriockLingering|null}
     */
    get transformationEffect() {
      if (!this.actor) { return null; }
      return this.parent.dependee ?? null;
    }

    /** @inheritDoc */
    _canToggleStatDice(stat) {
      return super._canToggleStatDice(stat) && !this._isInactiveTransformation;
    }

    /** @inheritDoc */
    _getTipSuppressions() {
      return Object.assign(super._getTipSuppressions(), {
        inactiveTransformation: this._isSuppressedTransformationInactive.bind(this),
        notPrimary: this._isSuppressedTransformationSecondary.bind(this),
      });
    }

    /**
     * If this is suppressed due to its transformation effect being inactive.
     * @returns {boolean}
     */
    _isSuppressedTransformationInactive() {
      return Boolean(
        this.isTransformation && this.parent.actor && this.transformationEffect && !this.transformationEffect.active,
      );
    }

    /**
     * If this is suppressed due to not being the primary transformation species.
     * @returns {boolean}
     */
    _isSuppressedTransformationSecondary() {
      return Boolean(this.isTransformation && this.parent.actor && !this.isPrimaryTransformation);
    }

    /** @inheritDoc */
    _onDelete(options, userId) {
      super._onDelete(options, userId);
      if (options.interactive && this.transformationEffect && this.document.checkEditor(userId)) {
        TeriockDialog.confirm({
          content: _loc("TERIOCK.SYSTEMS.Species.DIALOG.deleteEffect.content"),
          modal: true,
          rejectClose: false,
          window: {
            icon: makeIconClass(TERIOCK.display.icons.effect.transform, "title"),
            title: _loc("TERIOCK.SYSTEMS.Species.DIALOG.deleteEffect.title"),
          },
        }).then((p) => {
          if (p) { this.transformationEffect.delete(); }
        });
      }
    }

    /** @inheritDoc */
    getEmbedContextMenuEntries(doc) {
      const isPrimarySpecies = this.transformationEffect?.system.primarySpecies === this.parent;
      return [...super.getEmbedContextMenuEntries(doc), {
        group: "control",
        icon: makeIcon(TERIOCK.display.icons.effect.transform, "contextMenu"),
        label: _loc("TERIOCK.SYSTEMS.Species.MENU.setPrimaryTransformation"),
        onClick: this.setPrimaryTransformation.bind(this),
        visible: this.isTransformation && !(this.isPrimaryTransformation && isPrimarySpecies),
      }];
    }

    /** @inheritDoc */
    getLocalRollData() {
      const data = super.getLocalRollData();
      Object.assign(data, {
        transformation: Number(this.isTransformation),
        ["transformation.level"]: this.transformationEffect?.system.transformation.level || 0,
        "transformation.primary": Number(this.isPrimaryTransformation),
      });
      return data;
    }

    /** @inheritDoc */
    prepareBaseData() {
      super.prepareBaseData();
      this.transformation.ring = null;
      if (this.transformation.ringImg) { this.transformation.ring = true; }
      else if (this.transformation.img) { this.transformation.ring = false; }
      // Abilities from minor transformations are not proficient.
      if (this.isTransformation && this.transformationEffect?.system.transformation.level === "minor") {
        this.parent.abilities.forEach((a) => a.system.competence.raw = 0);
      }
    }

    /** @inheritDoc */
    prepareDerivedData() {
      super.prepareDerivedData();
      if (this._isInactiveTransformation) {
        for (const stat of POOL_STATS) { this.statDice[stat].disabled = true; }
      }
    }

    /**
     * Set the effects controlling this transformation as the primary transformation and this as its primary species.
     * @returns {Promise<void>}
     */
    async setPrimaryTransformation() {
      await this.transformationEffect?.system.setPrimaryTransformation(this.parent);
    }
  }

  return SpeciesTransformationPart;
}
