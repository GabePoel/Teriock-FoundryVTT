import { mixClasses } from "../../../../helpers/construction.mjs";
import * as systemMixins from "../../mixins/_module.mjs";

const { TypeDataModel } = foundry.abstract;

/**
 * @extends {TypeDataModel}
 * @extends {Teriock.Models.BaseMessageSystemData}
 * @extends {Teriock.Data.BaseMessageData}
 * @mixes BaseSystem
 */
export default class BaseMessageSystem extends mixClasses(TypeDataModel, systemMixins.BaseSystemMixin) {
  /** @returns {TeriockActor|null} */
  get actor() {
    return game.actors.default;
  }

  /** @returns {TeriockChatMessage} */
  get document() {
    return this.parent;
  }

  /**
   * Perform subtype-specific alterations to the final chat message HTML.
   * @param {object} _context
   * @param {object} options
   * @param {HTMLLIElement} [options.element]
   */
  async _onRender(_context, options) {
    // Add roll context menus
    if (options.element && this.document.isContentVisible) {
      for (const roll of this.document.rolls) { roll.bindContextMenus(options.element); }
    }
  }

  /**
   * Prepare chat message render context.
   * @param {object} options
   * @returns {Promise<object>}
   */
  async _prepareContext(options = {}) {
    return {
      isContentVisible: this.document.isContentVisible,
      speakerImg: this.document.speakerImg,
      system: this,
      TERIOCK,
      writer: this.document.alias !== this.document.author?.name ? this.document.author?.name : null,
      ...options,
    };
  }
}
