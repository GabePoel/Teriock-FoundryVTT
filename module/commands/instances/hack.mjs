import TeriockCommand from "../command.mjs";

export const hack = new TeriockCommand(
  "hack",
  "Increase hack level on a specific body part of targeted tokens. Usage: /hack <body_part> [amount]",
  async ({ args, chatData, actors }) => {
    if (args.length === 0) {
      ui.notifications.warn("Usage: /hack <body_part> [amount]. Body parts: arm, leg, body, eye, ear, mouth, nose");
      return;
    }

    const bodyPart = args[0].toLowerCase();
    const amount = args.length > 1 ? parseInt(args[1]) || 1 : 1;

    const validParts = ["arm", "leg", "body", "eye", "ear", "mouth", "nose"];
    if (!validParts.includes(bodyPart)) {
      ui.notifications.warn(`Invalid body part. Valid parts: ${validParts.join(", ")}`);
      return;
    }

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
