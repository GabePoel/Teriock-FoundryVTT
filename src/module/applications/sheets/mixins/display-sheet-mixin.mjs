import { fancifyFields } from "../../../helpers/utils.mjs";
import { TeriockTextEditor } from "../../ux/_module.mjs";

const { ImagePopout } = foundry.applications.apps;

export default function DisplaySheetMixin(Base) {
  return (
    /**
     * @extends {BaseSheet}
     * @mixin
     */
    class DisplaySheet extends Base {
      /**
       * Open the image for this document.
       * @return {Promise<void>}
       */
      static async #onOpenImage() {
        await new ImagePopout({ src: this.document.img, window: { title: "TERIOCK.SYSTEMS.Child.MENU.imagePreview" } })
          .render(true);
      }

      /** @type {Record<string, HandlebarsTemplatePart>} */
      static CONTENT_PARTS = { content: { template: "teriock/sheets/shared/content" } };

      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          applyButtonUpdate: this._onApplyButtonUpdate,
          openImage: this.#onOpenImage,
          populateField: this._onPopulateField,
        },
      };

      /** @type {Record<string, HandlebarsTemplatePart>} */
      static HEADER_PARTS = { header: { template: "teriock/sheets/shared/top" } };

      /** @type {Record<string, HandlebarsTemplatePart>} */
      static MENU_PARTS = { menu: { template: "teriock/sheets/shared/simple-menu" } };

      /** @type {Record<string, HandlebarsTemplatePart>} */
      static DISPLAY_PARTS = { ...this.HEADER_PARTS, ...this.MENU_PARTS, ...this.CONTENT_PARTS };

      /**
       * Apply a prepared document update from a display button.
       * @param {PointerEvent} _event
       * @param {HTMLElement} target
       * @returns {Promise<void>}
       * @this {DisplaySheet}
       */
      static async _onApplyButtonUpdate(_event, target) {
        if (!this.isEditable || !target.dataset.update) return;
        const entry = this.document.system.displayButtons.find(b => b.button === target.dataset.update);
        if (entry?.update) await this.document.update(entry.update);
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

      /**
       * Expand fancy display fields into their schema and value.
       * @param {Teriock.Sheet.DisplayField[]} fields
       * @returns {(Teriock.Sheet.FancyDisplayField & { schema: DataSchema; value: any })[]}
       */
      #expandFields(fields) {
        return fancifyFields(fields).map(f => {
          const sourceValue = foundry.utils.getProperty(this.document, f.path.replace("system.", "_source.system."));
          const value = foundry.utils.getProperty(this.document, f.path);
          return {
            ...f,
            ...{
              button: f?.button,
              choices: f.choices || this.document.getSchema(f.path)?.choices,
              editable: f.editable === false ? false : (f?.value ?? value) === sourceValue,
              label: f?.label || _loc(this.document.getSchema(f.path)?.label),
              schema: this.document.getSchema(f.path),
              value: f?.value ?? value,
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
          if (typeof t === "string") out.push({ label: _loc(t), tooltip: defaultTooltip });
          else out.push({ label: _loc(t.label), tooltip: _loc(t.tooltip) });
        });
        return out;
      }

      /**
       * @inheritDoc
       * @param {ApplicationRenderOptions} options
       */
      _configureRenderOptions(options) {
        super._configureRenderOptions(options);
        if (this._tab !== "overview") this._removeFromArray(options.parts, "menu");
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        await this._prepareDisplayFields(context);
        return Object.assign(context, {
          displayButtons: this.document.system.displayButtons,
          displayInputs: this.#expandFields(this.document.system.displayInputs),
          displayTags: this.#expandTags(this.document.system.displayTags),
          displayToggles: this.#expandFields(this.document.system.displayToggles),
        });
      }

      /**
       * Prepare display fields.
       * @param {object} context
       * @returns {Promise<void>}
       */
      async _prepareDisplayFields(context) {
        const expandedDisplayFields = this.#expandFields(this.document.system.displayFields);
        context.displayFieldButtons = expandedDisplayFields.filter(f => !f.value).map(f => {
          return { editable: f.editable, fieldPath: f.path, name: f?.button || f?.label || f.schema?.label };
        }).filter(b => b.editable !== false);
        context.displayFields = /** @type {Teriock.Sheet.EnrichedDisplayField[]} */ await Promise.all(
          expandedDisplayFields.filter(f => f.value).map(async f => {
            return { ...f, enriched: await TeriockTextEditor.enrichHTML(f.value, { relativeTo: this.document }) };
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
