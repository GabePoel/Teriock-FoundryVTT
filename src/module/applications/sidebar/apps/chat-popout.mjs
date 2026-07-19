import { makeIconClass } from "../../../helpers/icon.mjs";
import { ChatMessageConnectionMixin } from "../../shared/_module.mjs";

const { ChatPopout } = foundry.applications.sidebar.apps;

/**
 * @extends {ChatPopout}
 * @mixes ChatMessageConnection
 */
export default class TeriockChatPopout extends ChatMessageConnectionMixin(ChatPopout) {
  /**
   * Handle toggling the expanded state of a roll breakdown.
   * @this {ChatLog}
   * @type {ApplicationClickAction}
   */
  static #onExpandRoll(event, target) {
    event.preventDefault();
    target.classList.toggle("expanded");
  }

  /** @type {Partial<ApplicationConfiguration & Teriock.Application._ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = {
    actions: { expandRoll: this.#onExpandRoll },
    teriock: { minimizeOnDragStart: true },
    window: { icon: makeIconClass(CONFIG.ChatMessage.sidebarIcon, "title") },
  };

  /** @inheritDoc */
  get title() {
    return _loc("TYPES.ChatMessage.message");
  }

  /** @inheritDoc */
  _onPosition(position) {
    super._prePosition(position);
    // Explicitly set height or else minimizing and maximizing will mess up the height if the message has panels.
    this.element.style.height = "fit-content";
  }
}
