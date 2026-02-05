import { icons } from "../../constants/display/icons.mjs";
import { makeIcon } from "../../helpers/utils.mjs";

const wikiContextMenuOptions = [
  {
    name: "View on Wiki",
    icon: makeIcon(icons.ui.wiki, "contextMenu"),
    callback: /** @param {HTMLElement} target */ (target) => {
      const address = target.dataset.wikiAddress;
      if (address) {
        window.open(address, "_blank", "noopener,noreferrer");
      }
    },
    condition: () => game.settings.get("teriock", "systemLinks"),
  },
  {
    name: "View in Foundry",
    icon: makeIcon(icons.ui.openWindow, "contextMenu"),
    callback: /** @param {HTMLElement} target */ async (target) => {
      const uuid = target.dataset.uuid;
      if (uuid) {
        const doc = await fromUuid(uuid);
        if (doc) {
          if (doc.documentName === "JournalEntryPage") {
            const journalEntry = doc.parent;
            await journalEntry.sheet.render(true);
            journalEntry.sheet.goToPage(doc.id);
          } else {
            await doc.sheet.render(true);
          }
        }
      }
    },
    condition: () => !game.settings.get("teriock", "systemLinks"),
  },
];
export default wikiContextMenuOptions;
