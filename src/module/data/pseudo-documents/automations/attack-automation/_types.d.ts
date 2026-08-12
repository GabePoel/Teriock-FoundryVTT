declare module "./attack-automation.mjs" {
  export default interface AttackAutomation {
    attackPenalty: Teriock.System.FormulaString;
    consumeAmmunition: boolean | null;
    limb: boolean | null;
    sb: boolean | null;
    useArmament: boolean;
    keepArmament: boolean;
    vitals: boolean | null;
    warded: boolean | null;
  }
}

export {};
