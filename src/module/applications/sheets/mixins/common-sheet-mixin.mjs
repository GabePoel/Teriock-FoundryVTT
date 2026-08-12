import { mixClasses } from "../../../helpers/construction.mjs";
import { TeriockTextEditor } from "../../ux/_module.mjs";
import DocumentCreationSheetMixin from "./document-creation-sheet-mixin.mjs";
import DragDropSheetMixin from "./drag-drop-sheet-mixin.mjs";
import FieldsSheetMixin from "./fields-sheet-mixin.mjs";
import ImageEditingSheetMixin from "./image-editing-sheet-mixin.mjs";
import LockingSheetMixin from "./locking-sheet-mixin.mjs";
import PreviewSheetMixin from "./preview-sheet-mixin.mjs";
import SourceRefreshButtonSheetMixin from "./source-refresh-button-sheet-mixin.mjs";
import SystemSettingsButtonSheetMixin from "./system-settings-button-sheet-mixin.mjs";

/**
 * @import { ApplicationConfiguration } from "@client/applications/_types.mjs";
 */

/**
 * {@link AnyCommonDocument} sheet mixin.
 * @template {AnyConstructor} T
 * @param {T} Base - The base application class to mix in with.
 * @returns {MixinResult<T, CommonSheet>}
 */
export default function CommonSheetMixin(Base) {
  /**
   * @mixes DocumentCreationSheet
   * @mixes DragDropSheet
   * @mixes FieldsSheet
   * @mixes ImageEditingSheet
   * @mixes LockingSheet
   * @mixes PreviewSheet
   * @mixes SourceRefreshButtonSheet
   * @mixes SystemSettingsButtonSheet
   * @mixin
   * @property {AnyCommonDocument} document
   */
  class CommonSheet
    extends mixClasses(
      Base,
      SystemSettingsButtonSheetMixin,
      DragDropSheetMixin,
      DocumentCreationSheetMixin,
      FieldsSheetMixin,
      ImageEditingSheetMixin,
      LockingSheetMixin,
      PreviewSheetMixin,
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
      return Object.assign(await super._prepareContext(options), { enriched: {}, metadata: this.document.metadata });
    }
  }

  return CommonSheet;
}
