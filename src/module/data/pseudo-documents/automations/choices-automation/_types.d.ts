declare module "./choices-automation.mjs" {
  export default interface ChoicesAutomation {
    allowNone: boolean;
    choiceType: "formula" | "number" | "select";
    choices: Record<string, ChoiceEntry>;
    description: string;
    initialFormula: Teriock.System.FormulaString;
    initialNumber: number | null;
    integer: boolean;
    max: number | null;
    min: number | null;
    name: string;
    namespace: string | null;
    preset: "" | Teriock.Keys.Category;
  }
}

type ChoiceEntry = { label: string, value: string };

export {};
