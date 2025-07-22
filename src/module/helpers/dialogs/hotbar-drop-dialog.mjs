const { DialogV2 } = foundry.applications.api;

/**
 * Dialog to select what type of macro to make.
 *
 * @param {TeriockItem|TeriockEffect} doc
 * @returns {Promise<{searchTerm: string, command: string}>}
 */
export default async function hotbarDropDialog(doc) {
  let macroType = "linked";
  if (doc.type === "ability") {
  macroType = "general";
    try {
      await new DialogV2({
        window: { title: `Making ${doc.name} Macro` },
        modal: true,
        content:
          'Do you want to create a "general" macro or a "linked" macro? A "general" macro doesn\'t refer to the specific instance of the ability you\'re dropping. Rather, it checks whether any actor that\'s selected has that ability and makes them all use it. A "linked" macro connects to this specific instance of the ability on this actor.',
        buttons: [
          {
            action: "general",
            label: "General",
            default: true,
            callback: () => (macroType = "general"),
          },
          {
            action: "linked",
            label: "Linked",
            callback: () => (macroType = "linked"),
          },
        ],
      });
    } catch {}
  }
  if (macroType === "general") {
    return {
      searchTerm: `// ABILITY: ${doc.name}`,
      command: `// ABILITY: ${doc.name}
const tokens = game.canvas.tokens.controlled;
const actors = tokens.map(t => t.actor);
const options = {
  advantage: window.event?.altKey,
  disadvantage: window.event?.shiftKey,
  twoHanded: window.event?.ctrlKey,
}
for (const actor of actors) {
  await actor.useAbility("${doc.name}", options);
}`,
    };
  } else {
    return {
      searchTerm: `// UUID: ${doc.uuid}`,
      command: `// UUID: ${doc.uuid}
const item = await fromUuid("${doc.uuid}");
if (!item) return ui.notifications.warn("Document not found: ${doc.name}");
const options = {
  advantage: window.event?.altKey,
  disadvantage: window.event?.shiftKey,
  twoHanded: window.event?.ctrlKey,
};
await item.use(options);`,
    };
  }
}
