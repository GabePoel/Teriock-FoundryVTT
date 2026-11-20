import { TeriockTokenDocument } from "../../../../documents/_module.mjs";

declare module "./reposition-activation.mjs" {
  export default interface RepositionActivation {
    originBarrier: boolean;
    originMode: "chosen" | "target" | null;
    originUuid: UUID<TeriockTokenDocument> | null;
    randomDirection: boolean;
    x: number | null;
    y: number | null;
    distance: number;
    movementAction: string;
  }
}

export {};
