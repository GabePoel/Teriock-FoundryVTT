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
   * Whether this message is visible.
   * @return {boolean}
   */
  get visible() {
    return true;
  }

  /**
   * Perform subtype-specific alterations to the final chat message HTML.
   * @param {object} _context
   * @param {object} options
   * @param {HTMLLIElement} [options.element]
   */
  async _onRender(_context, options) {
    if (!options.element) { return; }

    // Connect target interactions
    options.element.querySelectorAll("[data-action='selectTarget']").forEach((el) => {
      el.addEventListener("pointerover", (ev) => {
        /** @type {TeriockToken} */
        const token = fromUuidSync(ev.currentTarget.dataset.tokenUuid)?.object;
        if (token && token?.isVisible) { token._onHoverIn(ev); }
      });
      el.addEventListener("pointerout", (ev) => {
        /** @type {TeriockToken} */
        const token = fromUuidSync(ev.currentTarget.dataset.tokenUuid)?.object;
        if (token && token?.isVisible) { token._onHoverOut(ev); }
      });
    });
  }

  /**
   * Stuff that happens when timestamp is updated.
   */
  _onUpdateTimestamp() {}

  /**
   * Prepare chat message render context.
   * @param {object} options
   * @returns {Promise<object>}
   */
  async _prepareContext(options = {}) {
    const speakerToken = this.document.speakerToken;
    return {
      hasSpeakerInteraction: Boolean(
        speakerToken || this.document.constructor.getSpeakerActor(this.document.speaker)?.visible,
      ),
      isContentVisible: this.document.isContentVisible,
      speakerImg: this.document.speakerImg,
      speakerToken,
      system: this,
      TERIOCK,
      type: this.document.type,
      writer: this.document.alias !== this.document.author?.name ? this.document.author?.name : null,
      ...options,
    };
  }
}
