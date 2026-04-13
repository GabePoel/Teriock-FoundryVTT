import { makeIcon } from "../../helpers/utils.mjs";

const { ChatLog } = foundry.applications.sidebar.tabs;

export default class TeriockChatLog extends ChatLog {
  /** @inheritDoc */
  _getEntryContextOptions() {
    return [
      ...super._getEntryContextOptions(),
      {
        label: "TERIOCK.MESSAGE.Menu.expandAll",
        icon: makeIcon(TERIOCK.display.icons.ui.expand, "contextMenu"),
        onClick: (_ev, li) => {
          li.querySelectorAll(".collapsable").forEach((el) => {
            el.classList.toggle("collapsed", false);
          });
        },
        visible: (li) => !!li.querySelector(".collapsable.collapsed"),
      },
      {
        label: "TERIOCK.MESSAGE.Menu.collapseAll",
        icon: makeIcon(TERIOCK.display.icons.ui.collapse, "contextMenu"),
        onClick: (_ev, li) => {
          li.querySelectorAll(".collapsable").forEach((el) => {
            el.classList.toggle("collapsed", true);
          });
        },
        visible: (li) => !!li.querySelector(".collapsable:not(.collapsed)"),
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
