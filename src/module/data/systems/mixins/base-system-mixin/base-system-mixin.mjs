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

      /**
       * Cached pseudo-document collections map.
       * @type {Record<string, TypeCollection>}
       */
      #pseudoCollections;

      /**
       * Custom buttons to activate things from sheet menus. Should not toggle HTML fields.
       * @returns {Teriock.Display.DisplayButton[]}
       */
      get _displayButtons() {
        return [];
      }

      /**
       * HTML fields to display on sheets and in panels.
       * @returns {Teriock.Display.DisplayField[]}
       */
      get _displayFields() {
        return [];
      }

      /**
       * Inputs to display in sheet menus.
       * @returns {Teriock.Display.DisplayField[]}
       */
      get _displayInputs() {
        return [];
      }

      /**
       * Tags to display on sheets below the menu.
       * @returns {Teriock.Display.DisplayTag[]}
       */
      get _displayTags() {
        return [];
      }

      /**
       * Toggles to display in sheet menus.
       * @returns {Teriock.Display.DisplayField[]}
       */
      get _displayToggles() {
        return [];
      }

      /**
       * A string to display following a colon after a document's name. Used for documents where there's one key scaling
       * parameter that is always important to see with the document.
       * @returns {string}
       */
      get _nameBadge() {
        return "";
      }

      /**
       * Tags to display in parentheses after a document's name. Used for things that distinguish variations on some
       * modified document.
       * @returns {string[]}
       */
      get _nameTags() {
        return [];
      }

      /**
       * Bars to show in a panel.
       * @returns {Teriock.Panels.PanelBar[]}
       */
      get _panelBars() {
        return [];
      }

      /**
       * Blocks to show in a panel.
       * @returns {Teriock.Panels.PanelBlock[]}
       */
      get _panelBlocks() {
        return fancifyFields(this._displayFields).map(f => {
          const schema = this.parent.getFieldForProperty(f.path);
          let value = foundry.utils.getProperty(this.parent._source, f.path);
          if (!value) { value = foundry.utils.getProperty(this.parent, f.path); }
          if (value && !schema.gmOnly) { return { classes: f.classes, text: value, title: f.label || schema.label }; }
        }).filter(f => f);
      }

      /**
       * A color to display around the icon for this document.
       * @returns {string|null}
       */
      get color() {
        return null;
      }

      /**
       * A string containing the document's name and any other additional adjustments that go along with it.
       * @returns {string}
       */
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

      /**
       * Whether this document shouldn't have basic information about where it came from visible.
       * @return {boolean}
       */
      get isSecret() {
        return false;
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
        if (!this.#pseudoCollections) {
          this.#pseudoCollections = {};
          const pseudoMap = this.metadata?.pseudos ?? {};
          for (const [documentName, path] of Object.entries(pseudoMap)) {
            this.#pseudoCollections[documentName] = foundry.utils.getProperty(this.parent, path);
          }
        }
        return this.#pseudoCollections;
      }

      /**
       * Parts of a panel.
       * @returns {Promise<Partial<Teriock.Panels.PanelParts>>}
       */
      async getPanelParts() {
        return {
          associations: /** @type {Teriock.Panels.PanelAssociation[]} */ [],
          bars: this._panelBars,
          blocks: this._panelBlocks,
        };
      }
    }
  );
}
