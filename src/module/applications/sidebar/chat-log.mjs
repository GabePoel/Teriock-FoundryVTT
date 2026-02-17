import { makeIcon } from "../../helpers/utils.mjs";

const { ChatLog } = foundry.applications.sidebar.tabs;

export default class TeriockChatLog extends ChatLog {
  /** @inheritDoc */
  _getEntryContextOptions() {
    return [
      ...super._getEntryContextOptions(),
      {
        name: "Expand All",
        icon: makeIcon(TERIOCK.display.icons.ui.expand, "contextMenu"),
        callback: (li) => {
          li.querySelectorAll(".collapsable").forEach((el) => {
            el.classList.toggle("collapsed", false);
          });
        },
        condition: (li) => !!li.querySelector(".collapsable.collapsed"),
      },
      {
        name: "Collapse All",
        icon: makeIcon(TERIOCK.display.icons.ui.collapse, "contextMenu"),
        callback: (li) => {
          li.querySelectorAll(".collapsable").forEach((el) => {
            el.classList.toggle("collapsed", true);
          });
        },
        condition: (li) => !!li.querySelector(".collapsable:not(.collapsed)"),
      },
    ];
  }

  /** @inheritDoc */
  updateTimestamps() {
    super.updateTimestamps();
    for (const li of /** @type {NodeListOf<HTMLLIElement>} */ document.querySelectorAll(
      ".chat-message[data-message-id]",
    )) {
      const message = game.messages.get(li.dataset.messageId);
      message.system.collapsePanels(li);
    }
  }
}
