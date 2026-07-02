import { makeIconClass } from "../../../helpers/icon.mjs";

const { ChatPopout } = foundry.applications.sidebar.apps;

/** @inheritDoc */
export default class TeriockChatPopout extends ChatPopout {
  /** @type {Partial<ApplicationConfiguration>} */
  static DEFAULT_OPTIONS = { window: { icon: makeIconClass(CONFIG.ChatMessage.sidebarIcon, "title") } };

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
