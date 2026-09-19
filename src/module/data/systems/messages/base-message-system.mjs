import { mixClasses } from "../../../helpers/construction.mjs";
import { BaseSystemMixin, UncommonSystemMixin } from "../mixins/_module.mjs";

const { TypeDataModel } = foundry.abstract;

/**
 * @mixes BaseSystem
 * @mixes UncommonSystem
 */
export default class BaseMessageSystem extends mixClasses(TypeDataModel, BaseSystemMixin, UncommonSystemMixin) {
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
    const document = this.getNearestDocument();
    const speakerToken = document.speakerToken;
    return {
      hasSpeakerInteraction: Boolean(speakerToken || document.constructor.getSpeakerActor(document.speaker)?.visible),
      isContentVisible: document.isContentVisible,
      speakerImg: document.speakerImg,
      speakerToken,
      system: this,
      TERIOCK,
      type: document.type,
      writer: document.alias !== document.author?.name ? document.author?.name : null,
      ...options,
    };
  }
}
