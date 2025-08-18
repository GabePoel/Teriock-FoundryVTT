export const resourceOptions = {
  restorationHooks: {
    none: "None",
    shortRest: "Short Rest",
    longRest: "Long Rest",
    dawn: "Dawn",
  },
  resourceTypes: {
    other: "Other",
    manaStoring: "Mana Storing",
  },
  functionHooks: {
    none: {
      name: "None",
      icon: "xmark-large",
      callback: (resource, result) => {},
    },
    takeHeal: {
      name: "Heal",
      icon: "hand-holding-medical",
      callback: async (resource, amount) => {
        const actor = resource.actor;
        if (actor) {
          await actor.takeHeal(amount);
        }
      },
    },
    takeRevitalize: {
      name: "Revitalize",
      icon: "hand-holding-droplet",
      callback: async (resource, amount) => {
        const actor = resource.actor;
        if (actor) {
          await actor.takeRevitalize(amount);
        }
      },
    },
    takeDamage: {
      name: "Damage",
      icon: "heart",
      callback: async (resource, amount) => {
        const actor = resource.actor;
        if (actor) {
          await actor.takeDamage(amount);
        }
      },
    },
    takeDrain: {
      name: "Drain",
      icon: "brain",
      callback: async (resource, amount) => {
        const actor = resource.actor;
        if (actor) {
          await actor.takeDrain(amount);
        }
      },
    },
    takeWither: {
      name: "Wither",
      icon: "hourglass-half",
      callback: async (resource, amount) => {
        const actor = resource.actor;
        if (actor) {
          await actor.takeWither(amount);
        }
      },
    },
  },
};
