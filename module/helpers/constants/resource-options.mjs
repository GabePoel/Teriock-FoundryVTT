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
      icon: 'xmark-large',
      callback: (resource, result) => { }
    },
    heal: {
      name: "Heal",
      icon: 'hand-holding-medical',
      callback: (resource, amount) => {
        const actor = resource.getActor();
        if (actor) {
          actor.heal(amount);
        }
      }
    },
    revitalize: {
      name: "Revitalize",
      icon: 'hand-holding-droplet',
      callback: (resource, amount) => {
        const actor = resource.getActor();
        if (actor) {
          actor.revitalize(amount);
        }
      }
    },
    takeDamage: {
      name: "Take Damage",
      icon: 'heart',
      callback: (resource, amount) => {
        const actor = resource.getActor();
        if (actor) {
          actor.takeDamage(amount);
        }
      }
    },
    takeDrain: {
      name: "Take Drain",
      icon: 'brain',
      callback: (resource, amount) => {
        const actor = resource.getActor();
        if (actor) {
          actor.takeDrain(amount);
        }
      }
    },
    takeWither: {
      name: "Take Wither",
      icon: 'hourglass-half',
      callback: (resource, amount) => {
        const actor = resource.getActor();
        if (actor) {
          actor.takeWither(amount);
        }
      }
    },
  }
}