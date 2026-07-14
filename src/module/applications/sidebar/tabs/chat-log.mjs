import { mixClasses } from "../../../helpers/construction.mjs";
import { makeIcon } from "../../../helpers/icon.mjs";
import { buildCommandOptions, commands } from "../../../helpers/interaction/_module.mjs";
import { BaseApplicationMixin } from "../../api/mixins/_module.mjs";
import { ChatMessageConnectionMixin } from "../../shared/_module.mjs";

const { ChatLog } = foundry.applications.sidebar.tabs;

/**
 * @extends {ChatLog}
 * @mixes BaseApplication
 * @mixes ChatMessageConnection
 */
export default class TeriockChatLog extends mixClasses(ChatLog, BaseApplicationMixin, ChatMessageConnectionMixin) {
  /** @inheritDoc */
  static CHAT_COMMANDS = (() => {
    const registry = { ...super.CHAT_COMMANDS };
    for (const [id, command] of Object.entries(commands)) {
      registry[id] = {
        rgx: new RegExp(`^(/${id}(?:\\s+)?)([^]*)`, "i"),
        fn(_commandString, match) {
          const payload = match[2] ? match[2].trim() : "";
          const commandOptions = buildCommandOptions(payload, command);
          const actors = game.actors.selected;
          if (!actors.length) { actors.push(null); }
          actors.forEach(actor => command.primary(actor, commandOptions));
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
        li.querySelectorAll(".collapsible[data-collapsible-id]").forEach(el => {
          this._toggleCollapsed(el.dataset.collapsibleId, false);
        });
      },
      visible: li => Boolean(li.querySelector(".collapsible.collapsed")),
    }, {
      icon: makeIcon(TERIOCK.display.icons.ui.collapse, "contextMenu"),
      label: "TERIOCK.MESSAGE.Menu.collapseAll",
      onClick: (_ev, li) => {
        li.querySelectorAll(".collapsible[data-collapsible-id]").forEach(el => {
          this._toggleCollapsed(el.dataset.collapsibleId, true);
        });
      },
      visible: li => Boolean(li.querySelector(".collapsible:not(.collapsed)")),
    }, {
      icon: makeIcon(TERIOCK.display.icons.ui.openWindow, "contextMenu"),
      label: "TERIOCK.SYSTEMS.Common.MENU.openSource",
      onClick: async (_ev, li) => {
        const message = game.messages.get(li.dataset.messageId);
        const doc = await fromUuid(message.system._src);
        if (!doc) { return; }
        if (doc.documentName === "JournalEntryPage") { await doc.parent.sheet.render({ force: true, pageId: doc.id }); }
        else { await doc.sheet?.render({ force: true, mode: "view" }); }
      },
      visible: li => {
        const message = game.messages.get(li.dataset.messageId);
        const src = message.system._src;
        if (!src) { return false; }
        let doc;
        if (!src.startsWith("Compendium")) { doc = fromUuidSync(src); }
        else {
          const parsed = foundry.utils.parseUuid(src);
          if (parsed.embedded.length === 0) { doc = fromUuidSync(src); }
          if (parsed.collection.visible) { return true; }
        }
        if (!doc) { return false; }
        return game.user.isGM || game.settings.get("teriock", "openChatDocuments") || doc.isViewer;
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
      if (typeof message.system.collapsePanels === "function") { message.system.collapsePanels(li); }
    }
  }
}
