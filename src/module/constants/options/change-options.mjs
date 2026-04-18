import { preLocalize } from "../../helpers/localization.mjs";

export const phase = {
  proficiency: {
    hint: "TERIOCK.CHANGES.Phase.proficiency.hint",
    label: "TERIOCK.CHANGES.Phase.proficiency.label",
  },
  fluency: {
    hint: "TERIOCK.CHANGES.Phase.fluency.hint",
    label: "TERIOCK.CHANGES.Phase.fluency.label",
  },
  normal: {
    hint: "TERIOCK.CHANGES.Phase.normal.hint",
    label: "TERIOCK.CHANGES.Phase.normal.label",
  },
  derivation: {
    hint: "TERIOCK.CHANGES.Phase.derivation.hint",
    label: "TERIOCK.CHANGES.Phase.derivation.label",
  },
  completion: {
    hint: "TERIOCK.CHANGES.Phase.completion.hint",
    label: "TERIOCK.CHANGES.Phase.completion.label",
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

preLocalize("options.change.phase", { keys: ["hint", "label"] });
preLocalize("options.change.target");
