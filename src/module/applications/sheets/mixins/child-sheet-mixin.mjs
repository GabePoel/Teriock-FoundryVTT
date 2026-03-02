import { icons } from "../../../constants/display/icons.mjs";
import { systemPath } from "../../../helpers/path.mjs";
import { fancifyFields, makeIconClass } from "../../../helpers/utils.mjs";
import { TeriockTextEditor } from "../../ux/_module.mjs";

/**
 * {@link TeriockChild} sheet mixin.
 * @param {typeof CommonSheet} Base
 */
export default function ChildSheetMixin(Base) {
  return (
    /**
     * @extends {CommonSheet}
     * @mixes ConfigButtonSheet
     * @mixin
     * @property {TeriockChild} document
     */
    class ChildSheet extends Base {
      /** @type {string[]} */
      static BARS = [];

      /** @type {Record<string, HandlebarsTemplatePart>} */
      static CONTENT_PARTS = {
        content: {
          template: systemPath("templates/sheets/shared/content.hbs"),
        },
      };

      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          populateField: this._onPopulateField,
          openSource: this.#onOpenSource,
        },
        window: {
          controls: [
            {
              action: "deleteThis",
              icon: makeIconClass(icons.ui.delete, "contextMenu"),
              label: "TERIOCK.SYSTEMS.Common.MENU.delete",
              ownership: "OWNER",
            },
            {
              action: "openSource",
              icon: makeIconClass(icons.ui.openWindow, "contextMenu"),
              label: "TERIOCK.SYSTEMS.Common.MENU.openSource",
            },
          ],
        },
      };

      /** @type {Record<string, HandlebarsTemplatePart>} */
      static HEADER_PARTS = {
        header: {
          template: systemPath("templates/sheets/shared/top.hbs"),
        },
      };

      /** @type {Record<string, HandlebarsTemplatePart>} */
      static MENU_PARTS = {
        menu: {
          template: systemPath("templates/sheets/shared/simple-menu.hbs"),
        },
      };

      /** @type {Record<string, HandlebarsTemplatePart>} */
      static PARTS = {
        ...this.HEADER_PARTS,
        ...this.MENU_PARTS,
        ...this.CONTENT_PARTS,
      };

      /**
       * Open this document's elder if it exists.
       * @returns {Promise<void>}
       */
      static async #onOpenSource() {
        await this.document.elder?.sheet.render(true);
      }

      /**
       * Populate a display field.
       * @param {PointerEvent} _event
       * @param {HTMLElement} target
       * @returns {Promise<void>}
       */
      static async _onPopulateField(_event, target) {
        await this.document.update({
          [target.dataset.path]:
            `<p>${game.i18n.localize("TERIOCK.SHEETS.Child.DEFAULTS.populateField")}</p>`,
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
        return fancifyFields(fields).map((f) => {
          return {
            ...f,
            ...{
              schema: this.document.getSchema(f.path),
              value: foundry.utils.getProperty(
                this.document,
                f.path.replace(".system.", "._schema.system."),
              ),
              label: f?.label || this.document.getSchema(f.path)?.label,
              button: f?.button,
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
        let out = [];
        const defaultTooltip = game.i18n.localize(
          "TERIOCK.SHEETS.Child.DISPLAY.defaultTagTooltip",
        );
        tags.forEach((t) => {
          if (typeof t === "string") {
            out.push({
              label: game.i18n.localize(t),
              tooltip: defaultTooltip,
            });
          } else {
            out.push({
              label: game.i18n.localize(t.label),
              tooltip: game.i18n.localize(t.tooltip),
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
        if (!this.isEditable) return;
        for (const [selector, update] of Object.entries(this._buttonUpdates)) {
          this.element.querySelectorAll(selector).forEach((el) => {
            el.addEventListener("click", () => this.document.update(update));
          });
        }
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        await this._prepareDisplayFields(context);
        context.displayToggles = this.#expandFields(
          this.document.system.displayToggles,
        );
        context.displayTags = this.#expandTags(
          this.document.system.displayTags,
        );
        return context;
      }

      /**
       * Prepare display fields.
       * @param {object} context
       * @returns {Promise<void>}
       */
      async _prepareDisplayFields(context) {
        const expandedDisplayFields = this.#expandFields(
          this.document.system.displayFields,
        );
        const displayFieldButtons = expandedDisplayFields
          .filter((f) => !f.value)
          .map((f) => {
            return {
              fieldPath: f.path,
              name: f?.button || f?.label || f.schema?.label,
              editable: f.editable,
            };
          });
        context.displayFields =
          /** @type {Teriock.Sheet.EnrichedDisplayField[]} */ await Promise.all(
            expandedDisplayFields
              .filter((f) => f.value)
              .map(async (f) => {
                return {
                  ...f,
                  enriched: await TeriockTextEditor.enrichHTML(f.value, {
                    relativeTo: this.document,
                  }),
                };
              }),
          );
        context.displayFieldButtons = displayFieldButtons;
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
