const { ux } = foundry.applications;
import { makeIcon } from "./utils.mjs";
import TeriockImageSheet from "../sheets/misc-sheets/image-sheet/image-sheet.mjs";

export default function connectEmbedded(document, element, editable = true) {
  const iconStyle = CONFIG.TERIOCK.iconStyles.contextMenu;
  element.querySelectorAll(".tcard").forEach((el) => {
    const id = el.getAttribute("data-id");
    const parentId = el.getAttribute("data-parent-id");
    const embedded =
      document.items?.get(id) ||
      document.effects?.get(id) ||
      document.items?.get(parentId)?.effects.get(id) ||
      document.parent?.getEmbeddedDocument("ActiveEffect", id);
    if (embedded) {
      new ux.ContextMenu(
        el,
        ".tcard",
        [
          // Non-item Entries
          {
            name: "Enable",
            icon: makeIcon("check", iconStyle),
            callback: async () => {
              embedded.enable();
            },
            condition: () => {
              if (embedded.documentName === "ActiveEffect") {
                return embedded.disabled;
              } else if (embedded.type === "equipment") {
                return false;
              } else {
                return embedded.system.disabled;
              }
            },
          },
          {
            name: "Disable",
            icon: makeIcon("xmark", iconStyle),
            callback: async () => {
              embedded.disable();
            },
            condition: () => {
              if (embedded.documentName === "ActiveEffect") {
                return !embedded.disabled;
              } else if (embedded.type === "equipment") {
                return false;
              } else {
                return !embedded.system.disabled;
              }
            },
          },
          // Item Entries
          {
            name: "Equip",
            icon: makeIcon("check", iconStyle),
            callback: async () => {
              await embedded.system.equip();
            },
            condition: () => {
              return embedded.type === "equipment" && !embedded.system.equipped;
            },
          },
          {
            name: "Unequip",
            icon: makeIcon("xmark", iconStyle),
            callback: async () => {
              await embedded.system.unequip();
            },
            condition: () => {
              return embedded.type === "equipment" && embedded.system.equipped;
            },
          },
          {
            name: "Attune",
            icon: makeIcon("handshake-simple", iconStyle),
            callback: async () => {
              await embedded.system.attune();
            },
            condition: () => {
              return embedded.type === "equipment" && !embedded.system.attuned;
            },
          },
          {
            name: "Deattune",
            icon: makeIcon("handshake-simple-slash", iconStyle),
            callback: async () => {
              await embedded.system.deattune();
            },
            condition: () => {
              return embedded.type === "equipment" && embedded.system.attuned;
            },
          },
          {
            name: "Glue",
            icon: makeIcon("link", iconStyle),
            callback: async () => {
              await embedded.update({
                "system.glued": !embedded.system.glued,
              });
            },
            condition: () => {
              return embedded.type === "equipment" && !embedded.system.glued;
            },
          },
          {
            name: "Unglue",
            icon: makeIcon("link-slash", iconStyle),
            callback: async () => {
              await embedded.update({
                "system.glued": !embedded.system.glued,
              });
            },
            condition: () => {
              return embedded.type === "equipment" && embedded.system.glued;
            },
          },
          {
            name: "Shatter",
            icon: makeIcon("wine-glass-crack", iconStyle),
            callback: async () => {
              await embedded.system.shatter();
            },
            condition: () => {
              return embedded.type === "equipment" && !embedded.system.shattered;
            },
          },
          {
            name: "Repair",
            icon: makeIcon("wine-glass", iconStyle),
            callback: async () => {
              await embedded.system.repair();
            },
            condition: () => {
              return embedded.type === "equipment" && embedded.system.shattered;
            },
          },
          {
            name: "Dampen",
            icon: makeIcon("bell-slash", iconStyle),
            callback: async () => {
              await embedded.system.dampen();
            },
            condition: () => {
              return embedded.type === "equipment" && !embedded.system.dampened;
            },
          },
          {
            name: "Undampen",
            icon: makeIcon("bell", iconStyle),
            callback: async () => {
              await embedded.system.undampen();
            },
            condition: () => {
              return embedded.type === "equipment" && embedded.system.dampened;
            },
          },
          // General Entries
          {
            name: "Open Source",
            icon: makeIcon("arrow-up-right-from-square", iconStyle),
            callback: () => {
              const source = embedded.getSource();
              if (source) {
                source.sheet.render(true);
              }
            },
            condition: () => {
              return embedded.documentName === "ActiveEffect" && embedded.getSource() !== document;
            },
          },
          {
            name: "Open Image",
            icon: makeIcon("image", iconStyle),
            callback: async (target) => {
              const img = target.getAttribute("data-img");
              if (img && img.length > 0) {
                const image = new TeriockImageSheet(img);
                image.render(true);
              }
            },
          },
          {
            name: "Share Image",
            icon: makeIcon("share", iconStyle),
            callback: async (target) => {
              await embedded.chatImage();
            },
          },
          {
            name: "Delete",
            icon: makeIcon("trash", iconStyle),
            callback: async () => {
              const parent = embedded.parent;
              await embedded.delete();
              await parent.forceUpdate();
            },
            condition: () => {
              return editable && embedded.isOwner;
            },
          },
          {
            name: "Duplicate",
            icon: makeIcon("copy", iconStyle),
            callback: async () => {
              await embedded.duplicate();
            },
            condition: () => {
              return editable && embedded.isOwner;
            },
          },
          {
            name: "Make Unidentified Copy",
            icon: makeIcon("eye-slash", iconStyle),
            callback: async () => {
              await embedded.system.unidentify();
            },
            condition: () => {
              return (
                editable &&
                embedded.isOwner &&
                embedded.type === "equipment" &&
                embedded.system.identified &&
                game.user.isGM
              );
            },
          },
          {
            name: "Identify",
            icon: makeIcon("eye", iconStyle),
            callback: async () => {
              await embedded.system.identify();
            },
            condition: () => {
              return (
                editable &&
                embedded.isOwner &&
                embedded.type === "equipment" &&
                !embedded.system.identified &&
                embedded.system.reference
              );
            },
          },
          {
            name: "Read Magic",
            icon: makeIcon("hand", iconStyle),
            callback: async () => {
              await embedded.system.readMagic();
            },
            condition: () => {
              return (
                editable &&
                embedded.isOwner &&
                embedded.type === "equipment" &&
                !embedded.system.identified &&
                embedded.system.reference &&
                embedded.system.powerLevel === "unknown"
              );
            },
          },
        ],
        {
          eventName: "contextmenu",
          jQuery: false,
          fixed: true,
        },
      );
      el.querySelectorAll('[data-action="useOneDoc"]').forEach((actionEl) => {
        actionEl.addEventListener("contextmenu", (event) => {
          event.stopPropagation();
          embedded.system.gainOne();
        });
      });
    }
  });
}
