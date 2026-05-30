import { fancifyFields } from "../../../../helpers/utils.mjs";

const { fields } = foundry.data;

/**
 * @param {typeof TypeDataModel} Base
 */
export default function BaseSystemMixin(Base) {
  return (
    /**
     * @extends {TypeDataModel}
     * @extends {Teriock.Models.BaseSystemData}
     * @mixin
     */
    class BaseSystem extends Base {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [];

      /** @returns {Partial<Teriock.Documents.ModelMetadata>} */
      static get metadata() {
        return {};
      }

      /** @inheritDoc */
      static defineSchema() {
        return { _src: new fields.DocumentUUIDField({ initial: null, nullable: true }) };
      }

      /** @returns {string} */
      get _nameBadge() {
        return "";
      }

      /** @returns {string[]} */
      get _nameTags() {
        return [];
      }

      /** @returns {Teriock.Sheet.DisplayButton[]} */
      get displayButtons() {
        return [];
      }

      /** @returns {Teriock.Sheet.DisplayField[]} */
      get displayFields() {
        return [];
      }

      /** @returns {Teriock.Sheet.DisplayField[]} */
      get displayInputs() {
        return [];
      }

      /** @returns {Teriock.Sheet.DisplayTag[]} */
      get displayTags() {
        return [];
      }

      /** @returns {Teriock.Sheet.DisplayField[]} */
      get displayToggles() {
        return [];
      }

      /** @returns {string} */
      get fullName() {
        let name = this.parent?.name ?? "";
        if (this._nameBadge) {
          name = _loc("TERIOCK.SYSTEMS.Base.EMBED.valueNameString", { name, value: this._nameBadge.trim() });
        }
        if (this._nameTags.length > 0) {
          name = _loc("TERIOCK.SYSTEMS.Base.EMBED.taggedNameString", {
            name,
            tags: this._nameTags.join(_loc("TERIOCK.SYSTEMS.Base.EMBED.valueSeparator")),
          });
        }
        return name.trim();
      }

      /** @return {boolean} */
      get isSecret() {
        return false;
      }

      /** @returns {Teriock.Messages.MessageBar[]} */
      get messageBars() {
        return [];
      }

      /** @returns {Teriock.Messages.MessageBlock[]} */
      get messageBlocks() {
        return fancifyFields(this.displayFields).map(f => {
          const schema = this.parent.getFieldForProperty(f.path);
          let value = foundry.utils.getProperty(this.parent._source, f.path);
          if (!value) { value = foundry.utils.getProperty(this.parent, f.path); }
          if (value && !schema.gmOnly) { return { classes: f.classes, text: value, title: f.label || schema.label }; }
        }).filter(f => f);
      }

      /** @returns {Partial<Teriock.Documents.ModelMetadata>} */
      get metadata() {
        return this.constructor.metadata;
      }

      /**
       * The pseudo-document collections.
       * @returns {Record<string, TypeCollection>}
       */
      get pseudoCollections() {
        return {};
      }

      /** @returns {Promise<Partial<Teriock.Messages.MessagePanel>>} */
      async getPanelParts() {
        return {
          associations: /** @type {Teriock.Messages.MessageAssociation[]} */ [],
          bars: this.messageBars,
          blocks: this.messageBlocks,
        };
      }
    }
  );
}
