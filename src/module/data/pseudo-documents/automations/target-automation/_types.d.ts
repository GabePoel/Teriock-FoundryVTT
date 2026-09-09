declare module "./target-automation.mjs" {
  export default interface TargetAutomation {
    angle: Teriock.System.FormulaString;
    attachToToken: boolean;
    excludeToken: boolean;
    expandWithToken: boolean;
    height: Teriock.System.FormulaString;
    innerWidth: Teriock.System.FormulaString;
    outerWidth: Teriock.System.FormulaString;
    radius: Teriock.System.FormulaString;
    radiusX: Teriock.System.FormulaString;
    radiusY: Teriock.System.FormulaString;
    regionType: "circle" | "cone" | "ellipse" | "emanation" | "rectangle" | "ring";
    restriction: { enabled: boolean, priority: number, type: string };
    width: Teriock.System.FormulaString;
  }
}

export {};
