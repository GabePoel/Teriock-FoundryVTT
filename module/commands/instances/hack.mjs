import TeriockCommand from "../command.mjs";

/**
 * Check if the provided string is a valid body part.
 * @param {string} bodyPart
 * @returns {boolean}
 */
function checkBodyPart(bodyPart) {
  const validParts = ["arm", "leg", "body", "eye", "ear", "mouth", "nose"];
  if (!validParts.includes(bodyPart)) {
    ui.notifications.warn(`Invalid body part. Valid parts: ${validParts.join(", ")}`);
    return false;
  }
  return true;
}

export const hack = new TeriockCommand(
  "hack",
  "Increase hack level on a specific body part of targeted tokens. Usage: /hack <body_part> [amount]",
  async ({ args, chatData, actors }) => {
    if (args.length === 0) {
      ui.notifications.warn("Usage: /hack <body_part> [amount]. Body parts: arm, leg, body, eye, ear, mouth, nose");
      return;
    }
    const bodyPart = args[0].toLowerCase();
    if (!checkBodyPart(bodyPart)) {
      return;
    }
    const amount = args.length > 1 ? parseInt(args[1]) || 1 : 1;
    for (const actor of actors) {
      for (let i = 0; i < amount; i++) {
        await actor.takeHack(bodyPart);
      }
    }

    ui.notifications.info(`Applied ${amount} hack(s) to ${bodyPart} on ${actors.length} target(s).`);
  },
  {
    category: "damage",
    requiresTarget: true,
  },
);

export const unhack = new TeriockCommand(
  "unhack",
  "Decrease hack level on a specific body part of targeted tokens. Usage: /unhack <body_part> [amount]",
  async ({ args, chatData, actors }) => {
    if (args.length === 0) {
      ui.notifications.warn("Usage: /unhack <body_part> [amount]. Body parts: arm, leg, body, eye, ear, mouth, nose");
      return;
    }
    const bodyPart = args[0].toLowerCase();
    if (!checkBodyPart(bodyPart)) {
      return;
    }
    const amount = args.length > 1 ? parseInt(args[1]) || 1 : 1;
    for (const actor of actors) {
      for (let i = 0; i < amount; i++) {
        await actor.takeUnhack(bodyPart);
      }
    }

    ui.notifications.info(`Removed ${amount} hack(s) from ${bodyPart} on ${actors.length} target(s).`);
  },
  {
    category: "support",
    requiresTarget: true,
  },
);
