/**
 * Creates a context menu for selecting piercing type.
 * Provides options for none, AV0, and UB piercing types.
 * @param {TeriockActor} actor - The actor to create the context menu for.
 * @returns {Array} Array of context menu options for piercing selection.
 */
export function piercingContextMenu(actor) {
  return [
    {
      name: "None",
      icon: "<i class=\"fa-solid fa-xmark\"></i>",
      callback: async () => {
        await actor.update({
          "system.offense.piercing": "none",
        });
      },
    },
    {
      name: "AV0",
      icon: "<i class=\"fa-solid fa-a\"></i>",
      callback: async () => {
        await actor.update({
          "system.offense.piercing": "av0",
        });
      },
    },
    {
      name: "UB",
      icon: "<i class=\"fa-solid fa-u\"></i>",
      callback: async () => {
        await actor.update({
          "system.offense.piercing": "ub",
        });
      },
    },
  ];
}
