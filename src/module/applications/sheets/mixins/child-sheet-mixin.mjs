import { fancifyFields } from "../../../helpers/utils.mjs";
import { TeriockTextEditor } from "../../ux/_module.mjs";

const { ImagePopout } = foundry.applications.apps;

/**
 * {@link ChildDocument} sheet mixin.
 * @param {typeof CommonSheet} Base
 */
export default function ChildSheetMixin(Base) {
  return (
    /**
     * @extends {CommonSheet}
     * @mixes ConfigButtonSheet
     * @mixin
     * @property {ChildDocument} document
     */
    class ChildSheet extends Base {
      /** @type {string[]} */
      static BARS = [];

      /** @type {Record<string, HandlebarsTemplatePart>} */
      static CONTENT_PARTS = {
        content: { template: "teriock/sheets/shared/content" },
      };

      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          openImage: this.#onOpenImage,
          openSource: this.#onOpenSource,
          populateField: this._onPopulateField,
        },
      };

      /** @type {Record<string, HandlebarsTemplatePart>} */
      static HEADER_PARTS = {
        header: { template: "teriock/sheets/shared/top" },
      };

      /** @type {Record<string, HandlebarsTemplatePart>} */
      static MENU_PARTS = {
        menu: { template: "teriock/sheets/shared/simple-menu" },
      };

      /** @type {Record<string, HandlebarsTemplatePart>} */
      static PARTS = {
        ...this.HEADER_PARTS,
        ...this.MENU_PARTS,
        ...this.CONTENT_PARTS,
      };

      /**
       * Open the image for this document.
       * @return {Promise<void>}
       */
      static async #onOpenImage() {
        await new ImagePopout({
          src: this.document.img,
          window: {
            title: "TERIOCK.SYSTEMS.Child.MENU.imagePreview",
          },
        }).render(true);
      }

      /**
       * Open this document's elder if it exists.
       * @returns {Promise<void>}
       */
      static async #onOpenSource() {
        await this.document.master?.sheet.render(true);
      }

      /**
       * Populate a display field.
       * @param {PointerEvent} _event
       * @param {HTMLElement} target
       * @returns {Promise<void>}
       */
      static async _onPopulateField(_event, target) {
        await this.document.update({
          [target.dataset.path]: `<p>${_loc("TERIOCK.SHEETS.Child.DEFAULTS.populateField")}</p>`,
        });
      }

      /** @type {Record<string, object>} */
      get _buttonUpdates() {
        return {};
      }

      /**
       * Expand fancy display fields into their schema and value.
       * @param {Teriock.Sheet.FancyDisplayField[]} fields
       * @returns {(Teriock.Sheet.FancyDisplayField & { schema: DataSchema; value: any })[]}
       */
      #expandFields(fields) {
        return fancifyFields(fields).map(f => {
          const sourceValue = foundry.utils.getProperty(this.document, f.path.replace("system.", "_source.system."));
          const value = foundry.utils.getProperty(this.document, f.path);
          return {
            ...f,
            ...{
              schema: this.document.getSchema(f.path),
              value,
              label: f?.label || _loc(this.document.getSchema(f.path)?.label),
              button: f?.button,
              editable: f.editable === false ? false : value === sourceValue,
            },
          };
        });
      }

      /**
       * Prepare display tags.
       * @param {Teriock.Sheet.DisplayTag[]} tags
       * @returns {Teriock.Sheet.FancyDisplayTag[]}
       */
      #expandTags(tags) {
        /** @type {Teriock.Sheet.FancyDisplayTag[]} */
        const out = [];
        const defaultTooltip = _loc("TERIOCK.SHEETS.Child.DISPLAY.defaultTagTooltip");
        tags.forEach(t => {
          if (typeof t === "string") {
            out.push({
              label: _loc(t),
              tooltip: defaultTooltip,
            });
          } else {
            out.push({
              label: _loc(t.label),
              tooltip: _loc(t.tooltip),
            });
          }
        });
        return out;
      }

      /**
       * @inheritDoc
       * @param {ApplicationRenderOptions} options
       */
      _configureRenderOptions(options) {
        super._configureRenderOptions(options);
        if (this._tab !== "overview") {
          this._removeFromArray(options.parts, "menu");
        }
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        if (!this.isEditable) {
          return;
        }
        for (const [selector, update] of Object.entries(this._buttonUpdates)) {
          this.element.querySelectorAll(selector).forEach(el => {
            el.addEventListener("click", () => this.document.update(update));
          });
        }
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        await this._prepareDisplayFields(context);
        context.displayToggles = this.#expandFields(this.document.system.displayToggles);
        context.displayTags = this.#expandTags(this.document.system.displayTags);
        return context;
      }

      /**
       * Prepare display fields.
       * @param {object} context
       * @returns {Promise<void>}
       */
      async _prepareDisplayFields(context) {
        const expandedDisplayFields = this.#expandFields(this.document.system.displayFields);
        context.displayFieldButtons = expandedDisplayFields
          .filter(f => !f.value)
          .map(f => {
            return {
              fieldPath: f.path,
              name: f?.button || f?.label || f.schema?.label,
              editable: f.editable,
            };
          })
          .filter(b => b.editable !== false);
        context.displayFields = /** @type {Teriock.Sheet.EnrichedDisplayField[]} */ await Promise.all(
          expandedDisplayFields
            .filter(f => f.value)
            .map(async f => {
              return {
                ...f,
                enriched: await TeriockTextEditor.enrichHTML(f.value, {
                  relativeTo: this.document,
                }),
              };
            }),
        );
        context.bars = this._tab === "overview" ? this.constructor.BARS : [];
      }

      /**
       * Remove an element from an array.
       * @param {string[]} arr
       * @param {*} el
       */
      _removeFromArray(arr, el) {
        const s = new Set(arr);
        s.delete(el);
        arr.length = 0;
        arr.push(...Array.from(s));
      }
    }
  );
}
