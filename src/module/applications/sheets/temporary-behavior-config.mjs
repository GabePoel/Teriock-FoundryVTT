import TeriockRegionBehaviorConfig from "./region-behavior-config.mjs";

/**
 * Edits a region behavior that isn't embedded in a region.
 */
export default class TemporaryBehaviorConfig extends TeriockRegionBehaviorConfig {
  /** @inheritDoc */
  static DEFAULT_OPTIONS = { viewPermission: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE };

  /** @inheritDoc */
  get isEditable() {
    return this.options.editable ?? super.isEditable;
  }

  /**
   * @inheritDoc
   * @version 370
   */
  async _processSubmitData(_event, _form, submitData, _options) {
    this.document.updateSource(submitData);
    await this.options.onChange?.(this.document.toObject());
  }
}
