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
    if (!options.element) { return; }

    // Add roll context menus
    if (this.document.isContentVisible) {
      for (const roll of this.document.rolls) { roll.bindContextMenus(options.element); }
    }

    // Connect target interactions
    options.element.querySelectorAll("[data-action='selectTarget']").forEach((el) => {
      const tokenDocument = fromUuidSync(el.dataset.tokenUuid);
      if (tokenDocument?.visible) {
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
      } else {
        el.classList.remove("selectable");
        el.dataset.tooltip = "TERIOCK.MESSAGE.Roll.target";
        delete el.dataset.action;
        delete el.dataset.double;
        delete el.dataset.tokenUuid;
        delete el.dataset.actorUuid;
      }
    });
  }

  /**
   * Prepare chat message render context.
   * @param {object} options
   * @returns {Promise<object>}
   */
  async _prepareContext(options = {}) {
    const speakerToken = this.document.speakerToken;
    return {
      hasSpeakerInteraction: Boolean(speakerToken?.visible || this.document.speakerActor?.visible),
      isContentVisible: this.document.isContentVisible,
      speakerImg: this.document.speakerImg,
      speakerToken,
      system: this,
      TERIOCK,
      writer: this.document.alias !== this.document.author?.name ? this.document.author?.name : null,
      ...options,
    };
  }
}
