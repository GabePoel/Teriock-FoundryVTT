/**
 * Creates a context menu for selecting piercing type.
 * Provides options for none, AV0, and UB piercing types.
 * @param {TeriockActor} actor - The actor to create the context menu for.
 * @returns {Teriock.Foundry.ContextMenuEntry[]}
 */
export function piercingContextMenu(actor) {
  return [
    {
      name: "None",
      icon: '<i class="fa-solid fa-xmark"></i>',
      callback: async () => {
        await actor.update({
          "system.offense.piercing": "none",
        });
      },
    },
    {
      name: "AV0",
      icon: '<i class="fa-solid fa-a"></i>',
      callback: async () => {
        await actor.update({
          "system.offense.piercing": "av0",
        });
      },
    },
    {
      name: "UB",
      icon: '<i class="fa-solid fa-u"></i>',
      callback: async () => {
        await actor.update({
          "system.offense.piercing": "ub",
        });
      },
    },
  ];
}

/**
 * Creates a context menu for selecting scaling type.
 * @param {TeriockActor} actor
 * @returns {Teriock.Foundry.ContextMenuEntry[]}
 */
export function scalingContextMenu(actor) {
  return [
    {
      name: "Scale P and F off LVL",
      icon: '<i class="fa-solid fa-wreath-laurel"></i>',
      callback: async () => {
        await actor.update({
          "system.scaling.brScale": false,
        });
      },
    },
    {
      name: "Scale P and F off BR",
      icon: '<i class="fa-solid fa-swords"></i>',
      callback: async () => {
        await actor.update({
          "system.scaling.brScale": true,
        });
      },
    },
  ];
}
