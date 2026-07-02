import { TeriockDialog } from "../../../../../../applications/api/_module.mjs";
import { makeIcon, makeIconClass } from "../../../../../../helpers/icon.mjs";
import { speciesTransformationFields } from "../../../../../fields/helpers/transformation-fields.mjs";

const { fields } = foundry.data;

/**
 * Species data model mixin that handles transformation behavior.
 * @param {typeof SpeciesSystem} Base
 */
export default function SpeciesTransformationPart(Base) {
  return (
    /**
     * @extends {BaseItemSystem}
     * @extends {Teriock.Models.SpeciesTransformationPartData}
     * @mixin
     */
    class SpeciesTransformationPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          transformation: new fields.SchemaField(speciesTransformationFields()),
        });
      }

      /** @inheritDoc */
      get _canToggleHpDice() {
        return super._canToggleHpDice && !this._isInactiveTransformation;
      }

      /** @inheritDoc */
      get _canToggleMpDice() {
        return super._canToggleMpDice && !this._isInactiveTransformation;
      }

      /** @inheritDoc */
      get _displayInputs() {
        return [...super._displayInputs, "system.transformation.img"];
      }

      /** @inheritDoc */
      get _displayMessagesSuppression() {
        const messages = super._displayMessagesSuppression;
        if (this._isSuppressedTransformationInactive) { this._addSuppressionMessage(
            "inactiveTransformation",
            messages,
          ); }
        if (this._isSuppressedTransformationSecondary) { this._addSuppressionMessage("notPrimary", messages); }
        return messages;
      }

      /** @inheritDoc */
      get _displayToggles() {
        return ["system.transformation.ring", ...super._displayToggles];
      }

      /**
       * Whether this is part of an inactive transformation.
       * @returns {boolean}
       */
      get _isInactiveTransformation() {
        return this.isTransformation && this.transformationEffect && !this.transformationEffect.active;
      }

      /**
       * If this is suppressed due to its transformation effect being inactive.
       * @returns {boolean}
       */
      get _isSuppressedTransformationInactive() {
        return Boolean(
          this.isTransformation && this.parent.actor && this.transformationEffect && !this.transformationEffect.active,
        );
      }

      /**
       * If this is suppressed due to not being the primary transformation species.
       * @returns {boolean}
       */
      get _isSuppressedTransformationSecondary() {
        return Boolean(this.isTransformation && this.parent.actor && !this.isPrimaryTransformation);
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

      /** @inheritDoc */
      get color() {
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
        return super.color;
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

      /** @inheritDoc */
      get makeSuppressed() {
        return super.makeSuppressed
          || this._isSuppressedTransformationInactive
          || this._isSuppressedTransformationSecondary;
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
      async deleteThis() {
        if (this.transformationEffect) {
          const proceed = await TeriockDialog.confirm({
            content: _loc("TERIOCK.SYSTEMS.Species.DIALOG.deleteEffect.content"),
            modal: true,
            rejectClose: false,
            window: {
              icon: makeIconClass(TERIOCK.display.icons.effect.transform, "title"),
              title: _loc("TERIOCK.SYSTEMS.Species.DIALOG.deleteEffect.title"),
            },
          });
          if (proceed) { await this.transformationEffect.delete(); }
          else { await super.deleteThis(); }
        } else {
          await super.deleteThis();
        }
      }

      /** @inheritDoc */
      getCardContextMenuEntries(doc) {
        return [...super.getCardContextMenuEntries(doc), {
          group: "control",
          icon: makeIcon(TERIOCK.display.icons.effect.transform, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Species.MENU.setPrimaryTransformation"),
          onClick: this.setPrimaryTransformation.bind(this),
          visible: this.isTransformation && !this.isPrimaryTransformation,
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
      prepareDerivedData() {
        super.prepareDerivedData();
        if (this._isInactiveTransformation) {
          this.statDice.hp.disabled = true;
          this.statDice.mp.disabled = true;
        }
      }

      /**
       * Set the effects controlling this transformation as the primary transformation.
       * @returns {Promise<void>}
       */
      async setPrimaryTransformation() {
        await this.transformationEffect?.system.setPrimaryTransformation();
      }
    }
  );
}
