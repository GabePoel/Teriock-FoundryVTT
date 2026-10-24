import { mergeMetadata, mixClasses } from "../../../../utils/_module.mjs";
import { BaseSystemMixin, UncommonSystemMixin } from "../../mixins/_module.mjs";

const { TypeDataModel } = foundry.abstract;

/**
 * @extends {TypeDataModel}
 * @mixes BaseSystem
 * @mixes UncommonSystem
 */
export default class BaseMessageSystem extends mixClasses(TypeDataModel, BaseSystemMixin, UncommonSystemMixin) {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    documentName: "ChatMessage",
    icon: TERIOCK.DISPLAY.icons.manifest.ui.chat,
    type: "base",
  });

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
   * @param {object} _options
   * @param {HTMLLIElement} [_options.element]
   */
  async _onRender(_context, _options) {}

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
    const document = this.parent;
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
