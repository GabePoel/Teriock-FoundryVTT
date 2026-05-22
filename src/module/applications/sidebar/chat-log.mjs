import { commands, interpretArguments, parseArguments } from "../../helpers/interaction/_module.mjs";
import { makeIcon } from "../../helpers/utils.mjs";

const { ChatLog } = foundry.applications.sidebar.tabs;

/** @inheritDoc */
export default class TeriockChatLog extends ChatLog {
  /** @inheritDoc */
  static CHAT_COMMANDS = (() => {
    const registry = { ...super.CHAT_COMMANDS };
    for (const [id, command] of Object.entries(commands)) {
      registry[id] = {
        rgx: new RegExp(`^(/${id}(?:\\s+)?)([^]*)`, "i"),
        fn: function(_commandString, match) {
          const argumentString = match[2] ? match[2].trim() : "";
          const argumentArray = command.formula ? [["formula", argumentString]] : parseArguments(argumentString);
          const argumentObject = interpretArguments(argumentArray, command);
          const actors = game.actors.selected;

          if (actors.length > 0) actors.map(actor => command.primary(actor, argumentObject));
          else command.primary(undefined, argumentObject);
          return false;
        },
      };
    }
    return registry;
  })();

  /** @inheritDoc */
  _getEntryContextOptions() {
    return [...super._getEntryContextOptions(), {
      icon: makeIcon(TERIOCK.display.icons.ui.expand, "contextMenu"),
      label: "TERIOCK.MESSAGE.Menu.expandAll",
      onClick: (_ev, li) => {
        li.querySelectorAll(".collapsable").forEach(el => {
          el.classList.toggle("collapsed", false);
        });
      },
      visible: li => !!li.querySelector(".collapsable.collapsed"),
    }, {
      icon: makeIcon(TERIOCK.display.icons.ui.collapse, "contextMenu"),
      label: "TERIOCK.MESSAGE.Menu.collapseAll",
      onClick: (_ev, li) => {
        li.querySelectorAll(".collapsable").forEach(el => {
          el.classList.toggle("collapsed", true);
        });
      },
      visible: li => !!li.querySelector(".collapsable:not(.collapsed)"),
    }, {
      icon: makeIcon(TERIOCK.display.icons.ui.openWindow, "contextMenu"),
      label: "TERIOCK.SYSTEMS.Common.MENU.openSource",
      onClick: async (_ev, li) => {
        const message = game.messages.get(li.dataset.messageId);
        const doc = await fromUuid(message.system._src);
        if (!doc) return;
        if (doc.documentName === "JournalEntryPage") await doc.parent.sheet.render({ force: true, pageId: doc.id });
        else await doc.sheet?.render({ force: true, mode: "view" });
      },
      visible: li => {
        const message = game.messages.get(li.dataset.messageId);
        const src = message.system._src;
        if (!src) return false;
        let doc;
        if (!src.startsWith("Compendium")) doc = fromUuidSync(src);
        else {
          const parsed = foundry.utils.parseUuid(src);
          if (parsed.embedded.length === 0) doc = fromUuidSync(src);
          if (parsed.collection.visible) return true;
        }
        if (!doc) return false;
        return game.user.isGM || game.teriock.getSetting("openChatDocuments") || doc.isViewer;
      },
    }];
  }

  /** @inheritDoc */
  updateTimestamps() {
    super.updateTimestamps();
    for (
      const li of /** @type {NodeListOf<HTMLLIElement>} */ document.querySelectorAll(".chat-message[data-message-id]")
    ) {
      const message = game.messages.get(li.dataset.messageId);
      message.system.collapsePanels(li);
    }
  }
}
