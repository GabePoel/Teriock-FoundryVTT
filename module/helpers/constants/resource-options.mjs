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
      callback: (resource, amount) => {
        const actor = resource.getActor();
        if (actor) {
          actor.takeHeal(amount);
        }
      },
    },
    takeRevitalize: {
      name: "Revitalize",
      icon: "hand-holding-droplet",
      callback: (resource, amount) => {
        const actor = resource.getActor();
        if (actor) {
          actor.takeRevitalize(amount);
        }
      },
    },
    takeDamage: {
      name: "Damage",
      icon: "heart",
      callback: (resource, amount) => {
        const actor = resource.getActor();
        if (actor) {
          actor.takeDamage(amount);
        }
      },
    },
    takeDrain: {
      name: "Drain",
      icon: "brain",
      callback: (resource, amount) => {
        const actor = resource.getActor();
        if (actor) {
          actor.takeDrain(amount);
        }
      },
    },
    takeWither: {
      name: "Wither",
      icon: "hourglass-half",
      callback: (resource, amount) => {
        const actor = resource.getActor();
        if (actor) {
          actor.takeWither(amount);
        }
      },
    },
  },
};
