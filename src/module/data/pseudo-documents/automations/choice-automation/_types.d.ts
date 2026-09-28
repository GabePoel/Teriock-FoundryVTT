declare module "./choice-automation.mjs" {
  export default interface ChoiceAutomation {
    choices: Record<string, ChoiceEntry>;
    description: string;
    name: string;
    namespace: string | null;
  }
}

type ChoiceEntry = { label: string, value: string };

export {};
