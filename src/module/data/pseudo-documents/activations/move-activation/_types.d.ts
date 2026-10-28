import { TeriockTokenDocument } from "../../../../documents/_module.mjs";

declare module "./move-activation.mjs" {
  export default interface MoveActivation {
    originBarrier: boolean;
    originUuid: UUID<TeriockTokenDocument> | null;
    randomDirection: boolean;
    x: number | null;
    y: number | null;
    distance: number;
    movementAction: string;
  }
}

export {};
