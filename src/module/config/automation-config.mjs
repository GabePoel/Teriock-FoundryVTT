import {
  AbilityMacroAutomation,
  ChangesAutomation,
  CheckAutomation,
  DurationAutomation,
  FeatAutomation,
  StatusAutomation,
  UseAbilityAutomation,
} from "../data/pseudo-documents/automations/_module.mjs";
import CombatExpirationAutomation from "../data/pseudo-documents/automations/combat-expiration-automation.mjs";

const automationConfig = {
  abilityMacro: {
    label: "Macro",
    documentClass: AbilityMacroAutomation,
  },
  changes: {
    label: "Changes",
    documentClass: ChangesAutomation,
  },
  check: {
    documentClass: CheckAutomation,
    label: "Tradecraft Check",
  },
  combatExpiration: {
    documentClass: CombatExpirationAutomation,
    label: "Combat Expiration",
  },
  duration: {
    label: "Duration",
    documentClass: DurationAutomation,
  },
  feat: {
    documentClass: FeatAutomation,
    label: "Feat Save",
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
