import { preLocalize } from "../../helpers/localization.mjs";

export const phase = {
  normal: {
    hint: "TERIOCK.CHANGES.Phase.normal.hint",
    label: "TERIOCK.CHANGES.Phase.normal.label",
  },
};

export const target = {
  Actor: "TERIOCK.CHANGES.Target.Actor",
  parent: "TERIOCK.CHANGES.Target.parent",
  ability: "TERIOCK.CHANGES.Target.ability",
  armament: "TERIOCK.CHANGES.Target.armament",
  body: "TERIOCK.CHANGES.Target.body",
  equipment: "TERIOCK.CHANGES.Target.equipment",
};

preLocalize("config.change.phase", { keys: ["hint", "label"] });
preLocalize("config.change.target");
