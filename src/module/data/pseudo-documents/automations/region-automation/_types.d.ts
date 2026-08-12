declare module "./region-automation.mjs" {
  export default interface RegionAutomation {
    regionType: "circle" | "cone" | "ellipse" | "emanation" | "rectangle" | "ring";
    height: Teriock.System.FormulaString;
    innerWidth: Teriock.System.FormulaString;
    outerWidth: Teriock.System.FormulaString;
    radius: Teriock.System.FormulaString;
    radiusX: Teriock.System.FormulaString;
    radiusY: Teriock.System.FormulaString;
    width: Teriock.System.FormulaString;
    attachToToken: boolean;
    deleteOnTurnChange: boolean;
    excludeToken: boolean;
    expandWithToken: boolean;
    targeting: boolean;
    visibility: number;
    restriction: { enabled: boolean, priority: number, type: string };
  }
}

export {};
