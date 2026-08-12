declare module "./base-expiration/base-expiration.mjs" {
  export default interface BaseExpiration {
    method: "automatic" | "roll";
    result: "delete" | "disable";
    roll: {
      comparison: Teriock.Keys.Comparison;
      formula: Teriock.System.FormulaString;
      threshold: Teriock.System.FormulaString;
    };
  }
}

export {};
