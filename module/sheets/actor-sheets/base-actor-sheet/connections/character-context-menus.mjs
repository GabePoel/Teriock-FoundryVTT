/**
 * Creates a context menu for selecting the primary blocker from equipped items.
 * Filters equipped items with blocking value (bv) and sorts them by bv in descending order.
 * @param {TeriockActor} actor - The actor to create the context menu for.
 * @param {Array} options - The array to populate with context menu options.
 * @returns {Array} The populated options array with blocker selection items.
 */
export function primaryBlockerContextMenu(actor, options) {
  const equipped = actor.itemTypes.equipment.filter((i) => i.system.equipped && i.system.bv);
  equipped.sort((a, b) => (b.system.bv ?? 0) - (a.system.bv ?? 0));
  const blockerOptions = [];
  for (const item of equipped) {
    const bv = item.system.bv ?? 0;
    const icon = `<i class="fa-solid fa-${bv}"></i>`;
    blockerOptions.push({
      name: item.name,
      icon: icon,
      callback: () => {
        actor.update({
          "system.wielding.blocker.raw": item._id,
        });
      },
    });
  }
  options.length = 0;
  options.push(...blockerOptions);
  return options;
}

/**
 * Creates a context menu for selecting the primary attacker from equipped items.
 * Filters equipped items with damage and provides appropriate icons based on damage value.
 * @param {TeriockActor} actor - The actor to create the context menu for.
 * @param {Array} options - The array to populate with context menu options.
 * @returns {Array} The populated options array with attacker selection items.
 */
export function primaryAttackContextMenu(actor, options) {
  const equipped = actor.itemTypes.equipment.filter(
    (i) => i.system.equipped && i.system.damage && i.system.damage !== "0",
  );
  const attackOptions = [];
  for (const item of equipped) {
    let icon = "";
    if (item.system.damage !== "1") {
      icon = '<i class="fa-solid fa-sword"></i>';
    } else {
      icon = '<i class="fa-solid fa-staff"></i>';
    }
    attackOptions.push({
      name: item.name,
      icon: icon,
      callback: () => {
        actor.update({
          "system.wielding.attacker.raw": item._id,
        });
      },
    });
  }
  options.length = 0;
  options.push(...attackOptions);
  return options;
}

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
      icon: '<i class="fa-solid fa-xmark"></i>',
      callback: () => {
        actor.update({
          "system.piercing": "none",
        });
      },
    },
    {
      name: "AV0",
      icon: '<i class="fa-solid fa-a"></i>',
      callback: () => {
        actor.update({
          "system.piercing": "av0",
        });
      },
    },
    {
      name: "UB",
      icon: '<i class="fa-solid fa-u"></i>',
      callback: () => {
        actor.update({
          "system.piercing": "ub",
        });
      },
    },
  ];
}
