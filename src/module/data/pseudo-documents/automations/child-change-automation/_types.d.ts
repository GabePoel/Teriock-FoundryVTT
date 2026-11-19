declare module "./child-change-automation.mjs" {
  export default interface ChildChangeAutomation {
    changeType: Teriock.Changes.Type;
    key: Teriock.Changes.ChildPath;
    phase: Teriock.Changes.Phase;
    priority: number | null;
    qualifier: Teriock.System.FormulaString;
    target: Teriock.Changes.ChildTarget;
    value: Slug[] | Teriock.System.FormulaString;
  }
}

export {};
