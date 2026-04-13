import { icons } from "../../constants/display/icons.mjs";
import { toCamelCase, toKebabCase } from "../../helpers/string.mjs";
import { makeIcon } from "../../helpers/utils.mjs";

const wikiContextMenuOptions = [
  {
    label: "TERIOCK.SYSTEMS.Common.MENU.viewOnWiki",
    icon: makeIcon(icons.ui.wiki, "contextMenu"),
    onClick: (_ev, target) => {
      const address = target.dataset.wikiAddress;
      if (address) {
        window.open(address, "_blank", "noopener,noreferrer");
      }
    },
    visible: () => game.teriock.getSetting("systemLinks"),
  },
  {
    label: "TERIOCK.SYSTEMS.Common.MENU.viewInFoundry",
    icon: makeIcon(icons.ui.openWindow, "contextMenu"),
    onClick: async (_ev, target) => {
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
    visible: () => !game.teriock.getSetting("systemLinks"),
  },
  {
    label: "TERIOCK.COMMANDS.Status.toggleUnnamed",
    icon: makeIcon(icons.ui.toggle, "contextMenu"),
    onClick: async (_ev, target) => {
      const condition = toCamelCase(
        target.dataset.tooltip.split("Condition: ")[1],
      );
      await game.actors.default.toggleStatusEffect(condition);
    },
    visible: (target) =>
      target.dataset.tooltip?.startsWith("Condition: ") &&
      Object.keys(TERIOCK.data.conditions).includes(
        toCamelCase(target.dataset.tooltip.split("Condition: ")[1]),
      ) &&
      game.actors.default,
  },
  {
    label: "TERIOCK.EFFECTS.Common.bag",
    icon: makeIcon(icons.ui.deathBag, "contextMenu"),
    onClick: async () => {
      await game.actors.default.system.deathBagPull();
    },
    visible: (target) =>
      ["Condition: Dead", "Core: Death Bag"].includes(target.dataset.tooltip) &&
      game.actors.default,
  },
  {
    label: "TERIOCK.EFFECTS.Common.heal",
    icon: makeIcon(icons.effect.heal, "contextMenu"),
    onClick: async () => {
      await game.actors.default.system.takeHeal();
    },
    visible: (target) =>
      target.dataset.tooltip === "Core: Healing" && game.actors.default,
  },
  {
    label: "TERIOCK.EFFECTS.Common.revitalize",
    icon: makeIcon(icons.effect.heal, "contextMenu"),
    onClick: async () => {
      await game.actors.default.system.takeRevitalize();
    },
    visible: (target) =>
      target.dataset.tooltip === "Core: Revitalizing" && game.actors.default,
  },
  {
    label: "TERIOCK.EFFECTS.Common.awaken",
    icon: makeIcon(icons.effect.awaken, "contextMenu"),
    onClick: async () => {
      await game.actors.default.system.takeAwaken();
    },
    visible: (target) =>
      target.dataset.tooltip === "Keyword: Awaken" && game.actors.default,
  },
  {
    label: "TERIOCK.ROLLS.Resist.button",
    icon: makeIcon(icons.effect.resist, "contextMenu"),
    onClick: async () => {
      await game.actors.default.system.rollResistance();
    },
    visible: (target) =>
      ["Keyword: Resistance", "Keyword: Hexproof"].includes(
        target.dataset.tooltip,
      ) && game.actors.default,
  },
  {
    label: "TERIOCK.COMMANDS.UseAbility.useResist",
    icon: makeIcon(icons.document.ability, "contextMenu"),
    onClick: async () => {
      await game.actors.default.useDocument("ability:resist");
    },
    visible: (target) =>
      ["Keyword: Resistance", "Keyword: Hexproof"].includes(
        target.dataset.tooltip,
      ) && game.actors.default,
  },
  {
    label: "TERIOCK.COMMANDS.UseAbility.useUnnamed",
    icon: makeIcon(icons.document.ability, "contextMenu"),
    onClick: async (_ev, target) => {
      const abilityName = target.dataset.tooltip.split("Ability: ")[1];
      await game.actors.default.useDocument(
        `ability:${toKebabCase(abilityName)}`,
      );
    },
    visible: (target) =>
      target.dataset.tooltip?.startsWith("Ability: ") && game.actors.default,
  },
];

export default wikiContextMenuOptions;
