import {
  AbilityMacroAutomation,
  DurationAutomation,
  StatusAutomation,
  UseAbilityAutomation,
} from "../data/pseudo-documents/automations/_module.mjs";

const automationConfig = {
  abilityMacro: {
    label: "Macro",
    documentClass: AbilityMacroAutomation,
  },
  duration: {
    label: "Duration",
    documentClass: DurationAutomation,
  },
  status: {
    label: "Condition",
    documentClass: StatusAutomation,
  },
  useAbility: {
    label: "Use Ability",
    documentClass: UseAbilityAutomation,
  },
};

export default automationConfig;
