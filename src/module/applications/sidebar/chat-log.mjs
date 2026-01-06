import { makeIcon } from "../../helpers/utils.mjs";

const { ChatLog } = foundry.applications.sidebar.tabs;

export default class TeriockChatLog extends ChatLog {
  /** @inheritDoc */
  _getEntryContextOptions() {
    return [
      ...super._getEntryContextOptions(),
      {
        name: "Expand All",
        icon: makeIcon("expand", "contextMenu"),
        callback: (li) => {
          li.querySelectorAll(".collapsable").forEach((el) => {
            el.classList.toggle("collapsed", false);
          });
        },
        condition: (li) => !!li.querySelector(".collapsable.collapsed"),
      },
      {
        name: "Collapse All",
        icon: makeIcon("compress", "contextMenu"),
        callback: (li) => {
          li.querySelectorAll(".collapsable").forEach((el) => {
            el.classList.toggle("collapsed", true);
          });
        },
        condition: (li) => !!li.querySelector(".collapsable:not(.collapsed)"),
      },
    ];
  }
}
