import { makeIcon } from "../../helpers/utils.mjs";

const wikiContextMenuOptions = [
  {
    name: "View on Wiki",
    icon: makeIcon("globe", "contextMenu"),
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
    icon: makeIcon("arrow-up-right-from-square", "contextMenu"),
    callback: /** @param {HTMLElement} target */ async (target) => {
      const uuid = target.dataset.uuid;
      if (uuid) {
        const doc = await fromUuid(uuid);
        if (doc) {
          doc.sheet.render(true);
        }
      }
    },
    condition: () => !game.settings.get("teriock", "systemLinks"),
  },
];
export default wikiContextMenuOptions;
