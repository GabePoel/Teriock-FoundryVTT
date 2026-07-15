import { mixClasses } from "../../../helpers/construction.mjs";
import { TeriockTextEditor } from "../../ux/_module.mjs";
import ConnectionSheetMixin from "./connection-sheet-mixin.mjs";
import DocumentCreationSheetMixin from "./document-creation-sheet-mixin.mjs";
import DragDropSheetMixin from "./drag-drop-sheet-mixin.mjs";
import FieldsSheetMixin from "./fields-sheet-mixin.mjs";
import ImageEditingSheetMixin from "./image-editing-sheet-mixin.mjs";
import LockingSheetMixin from "./locking-sheet-mixin.mjs";
import MechanicsSheetMixin from "./mechanics-sheet-mixin.mjs";
import MechanicsTabsSheetMixin from "./mechanics-tabs-sheet-mixin.mjs";
import PreviewSheetMixin from "./preview-sheet-mixin.mjs";
import SourceRefreshButtonSheetMixin from "./source-refresh-button-sheet-mixin.mjs";
import StatDiceSheetMixin from "./stat-dice-sheet-mixin.mjs";
import SystemSettingsButtonSheetMixin from "./system-settings-button-sheet-mixin.mjs";

/**
 * {@link AnyCommonDocument} sheet mixin.
 * @param {typeof TeriockDocumentSheet} Base - The base application class to mix in with.
 */
export default function CommonSheetMixin(Base) {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixes ConnectionSheet
     * @mixes DocumentCreationSheet
     * @mixes DragDropSheet
     * @mixes FieldsSheet
     * @mixes ImageEditingSheet
     * @mixes LockingSheet
     * @mixes MechanicsSheet
     * @mixes MechanicsTabsSheet
     * @mixes PreviewSheet
     * @mixes SourceRefreshButtonSheet
     * @mixes StatDiceSheet
     * @mixes SystemSettingsButtonSheet
     * @mixin
     * @property {AnyCommonDocument} document
     */
    class CommonSheet
      extends mixClasses(
        Base,
        SystemSettingsButtonSheetMixin,
        ConnectionSheetMixin,
        DragDropSheetMixin,
        DocumentCreationSheetMixin,
        FieldsSheetMixin,
        ImageEditingSheetMixin,
        MechanicsTabsSheetMixin,
        LockingSheetMixin,
        StatDiceSheetMixin,
        PreviewSheetMixin,
        MechanicsSheetMixin,
        SourceRefreshButtonSheetMixin,
      )
    {
      /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
      static DEFAULT_OPTIONS = {
        classes: ["common"],
        form: { closeOnSubmit: false, submitOnChange: true },
        position: { height: 600, width: 580 },
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
          metadata: this.document.metadata,
          settings: this.settings,
        });
      }
    }
  );
}
