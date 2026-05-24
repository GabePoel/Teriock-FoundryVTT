import { ConfigButtonSheetMixin, IndexButtonSheetMixin } from "../_module.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { TeriockTextEditor } from "../../../ux/_module.mjs";
import BaseSheetMixin from "../base-sheet-mixin.mjs";
import * as parts from "./parts/_module.mjs";

/**
 * {@link AnyCommonDocument} sheet mixin.
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
     * @mixes FrameCommonSheetPart
     * @mixes ImageEditingCommonSheetPart
     * @mixes AutomationsTabsCommonSheetPart
     * @mixes LockingCommonSheetPart
     * @mixes MenuCommonSheetPart
     * @mixes StatDiceCommonSheetPart
     * @mixes ToggleCommonSheetPart
     * @mixin
     * @property {AnyCommonDocument} document
     */
    class CommonSheet
      extends mixClasses(
        Base,
        BaseSheetMixin,
        ConfigButtonSheetMixin,
        parts.ConnectionCommonSheetPart,
        parts.DragDropCommonSheetPart,
        parts.DocumentCreationCommonSheetPart,
        parts.FieldsCommonSheetPart,
        parts.ImageEditingCommonSheetPart,
        parts.AutomationsTabsCommonSheetPart,
        parts.LockingCommonSheetPart,
        parts.MenuCommonSheetPart,
        parts.StatDiceCommonSheetPart,
        parts.ToggleCommonSheetPart,
        parts.AutomationsCommonSheetPart,
        parts.FrameCommonSheetPart,
        IndexButtonSheetMixin,
      )
    {
      /** @type {Partial<ApplicationConfiguration>} */
      static DEFAULT_OPTIONS = /** @type {Partial<ApplicationConfiguration>} */ {
        form: { closeOnSubmit: false, submitOnChange: true },
        position: { height: 600, width: 560 },
        window: { resizable: true },
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
       * Enriches HTML content for display.
       * @param {string} parameter - The HTML content to enrich.
       * @returns {Promise<string|undefined>} Promise that resolves to the enriched HTML or undefined.
       */
      async _enrich(parameter) {
        return parameter?.length
          ? await TeriockTextEditor.enrichHTML(parameter, { relativeTo: this.document })
          : undefined;
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        return Object.assign(await super._prepareContext(options), {
          enriched: {},
          imgPath: "img",
          metadata: this.document.metadata,
          settings: this.settings,
        });
      }
    }
  );
}
