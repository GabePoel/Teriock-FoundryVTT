declare module "./choices-automation.mjs" {
  export default interface ChoicesAutomation {
    choices: Record<string, ChoiceEntry>;
    description: string;
    name: string;
    namespace: string | null;
    preset: "" | Teriock.Keys.Category;
  }
}

type ChoiceEntry = { label: string, value: string };

export {};
