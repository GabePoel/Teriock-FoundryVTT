import { icons } from "../../constants/display/icons.mjs";
import { toCamelCase } from "../../helpers/string.mjs";
import { makeIcon } from "../../helpers/utils.mjs";

const wikiContextMenuOptions = [
  {
    name: "TERIOCK.SYSTEMS.Common.MENU.viewOnWiki",
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
    name: "TERIOCK.SYSTEMS.Common.MENU.viewInFoundry",
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
  {
    name: "TERIOCK.COMMANDS.Status.toggleUnnamed",
    icon: makeIcon(icons.ui.toggle, "contextMenu"),
    callback: async (target) => {
      const condition = toCamelCase(
        target.dataset.tooltip.split("Condition: ")[1],
      );
      await game.actors.default.toggleStatusEffect(condition);
    },
    condition: (target) =>
      target.dataset.tooltip?.startsWith("Condition: ") &&
      Object.keys(TERIOCK.data.conditions).includes(
        toCamelCase(target.dataset.tooltip.split("Condition: ")[1]),
      ) &&
      game.actors.default,
  },
  {
    name: "TERIOCK.EFFECTS.Common.bag",
    icon: makeIcon(icons.ui.deathBag, "contextMenu"),
    callback: async () => {
      await game.actors.default.system.deathBagPull();
    },
    condition: (target) =>
      ["Condition: Dead", "Core: Death Bag"].includes(target.dataset.tooltip) &&
      game.actors.default,
  },
  {
    name: "TERIOCK.EFFECTS.Common.heal",
    icon: makeIcon(icons.effect.heal, "contextMenu"),
    callback: async () => {
      await game.actors.default.system.takeHeal();
    },
    condition: (target) =>
      target.dataset.tooltip === "Core: Healing" && game.actors.default,
  },
  {
    name: "TERIOCK.EFFECTS.Common.revitalize",
    icon: makeIcon(icons.effect.heal, "contextMenu"),
    callback: async () => {
      await game.actors.default.system.takeRevitalize();
    },
    condition: (target) =>
      target.dataset.tooltip === "Core: Revitalizing" && game.actors.default,
  },
  {
    name: "TERIOCK.EFFECTS.Common.awaken",
    icon: makeIcon(icons.effect.awaken, "contextMenu"),
    callback: async () => {
      await game.actors.default.system.takeAwaken();
    },
    condition: (target) =>
      target.dataset.tooltip === "Keyword: Awaken" && game.actors.default,
  },
  {
    name: "TERIOCK.ROLLS.Resist.button",
    icon: makeIcon(icons.effect.resist, "contextMenu"),
    callback: async () => {
      await game.actors.default.system.rollResistance();
    },
    condition: (target) =>
      ["Keyword: Resistance", "Keyword: Hexproof"].includes(
        target.dataset.tooltip,
      ) && game.actors.default,
  },
  {
    name: "TERIOCK.COMMANDS.UseAbility.useResist",
    icon: makeIcon(icons.document.ability, "contextMenu"),
    callback: async () => {
      await game.actors.default.useAbility("Resist");
    },
    condition: (target) =>
      ["Keyword: Resistance", "Keyword: Hexproof"].includes(
        target.dataset.tooltip,
      ) && game.actors.default,
  },
  {
    name: "TERIOCK.COMMANDS.UseAbility.useUnnamed",
    icon: makeIcon(icons.document.ability, "contextMenu"),
    callback: async (target) => {
      const abilityName = target.dataset.tooltip.split("Ability: ")[1];
      await game.actors.default.useAbility(abilityName);
    },
    condition: (target) =>
      target.dataset.tooltip?.startsWith("Ability: ") && game.actors.default,
  },
];

export default wikiContextMenuOptions;
