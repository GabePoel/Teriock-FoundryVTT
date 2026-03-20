import { mix } from "../../../../helpers/utils.mjs";
import { TeriockTextEditor } from "../../../ux/_module.mjs";
import { ConfigButtonSheetMixin, IndexButtonSheetMixin } from "../_module.mjs";
import BaseSheetMixin from "../base-sheet-mixin.mjs";
import * as parts from "./parts/_module.mjs";

/**
 * {@link CommonDocument} sheet mixin.
 * @param {typeof TeriockDocumentSheet} Base - The base application class to mix in with.
 */
export default function CommonSheetMixin(Base) {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixes BaseSheet
     * @mixes DocumentCreationCommonSheetPart
     * @mixes DragDropCommonSheetPart
     * @mixes FieldsCommonSheetPart
     * @mixes GmNotesCommonSheetPart
     * @mixes ImageEditingCommonSheetPart
     * @mixes AutomationsTabsCommonSheetPart
     * @mixes InteractionCommonSheetPart
     * @mixes LockingCommonSheetPart
     * @mixes MenuCommonSheetPart
     * @mixes StatDiceCommonSheetPart
     * @mixes ToggleCommonSheetPart
     * @mixin
     * @property {AnyCommonDocument} document
     */
    class CommonSheet extends mix(
      Base,
      BaseSheetMixin,
      ConfigButtonSheetMixin,
      parts.ConnectionCommonSheetPart,
      parts.DragDropCommonSheetPart,
      parts.DocumentCreationCommonSheetPart,
      parts.FieldsCommonSheetPart,
      parts.GmNotesCommonSheetPart,
      parts.ImageEditingCommonSheetPart,
      parts.AutomationsTabsCommonSheetPart,
      parts.InteractionCommonSheetPart,
      parts.LockingCommonSheetPart,
      parts.MenuCommonSheetPart,
      parts.StatDiceCommonSheetPart,
      parts.ToggleCommonSheetPart,
      parts.AutomationsCommonSheetPart,
      IndexButtonSheetMixin,
    ) {
      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS =
        /** @type {Partial<ApplicationConfiguration>} */ {
          actions: {
            openDoc: this._onOpenDoc,
          },
          form: {
            closeOnSubmit: false,
            submitOnChange: true,
          },
          position: {
            height: 600,
            width: 560,
          },
          window: {
            resizable: true,
          },
        };

      /**
       * Creates a new Teriock sheet instance.
       * Initializes sheet state including settings.
       * @param {...any} args - Arguments to pass to the base constructor.
       */
      constructor(...args) {
        super(...args);
        this.settings = {};
      }

      /**
       * Open a linked document.
       * @param {PointerEvent} _event
       * @param {HTMLEmbedElement} target
       * @returns {Promise<void>}
       */
      static async _onOpenDoc(_event, target) {
        const uuid = target.dataset.uuid;
        const doc = await fromUuid(uuid);
        await doc.sheet.render(true);
      }

      /**
       * Enriches HTML content for display.
       * @param {string} parameter - The HTML content to enrich.
       * @returns {Promise<string|undefined>} Promise that resolves to the enriched HTML or undefined.
       */
      async _enrich(parameter) {
        return parameter?.length
          ? await TeriockTextEditor.enrichHTML(parameter, {
              relativeTo: this.document,
            })
          : undefined;
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        this._connect("[data-debug]", "contextmenu", () => {
          if (game.teriock.getSetting("developerMode")) {
            console.log("Debug", this.document, this);
          }
        });
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        Object.assign(context, {
          enriched: {},
          hasMenu: true,
          imgPath: "img",
          metadata: this.document.metadata,
          settings: this.settings,
        });
        return context;
      }

      /** @inheritDoc */
      async _renderFrame(options = {}) {
        const frame = await super._renderFrame(options);
        if (this.document.inCompendium) {
          this.window.header.style.backgroundColor =
            "var(--compendium-sheet-header-background-color)";
        }
        return frame;
      }
    }
  );
}
