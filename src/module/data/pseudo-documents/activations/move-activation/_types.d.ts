import { TeriockTokenDocument } from "../../../../documents/_module.mjs";

declare module "./move-activation.mjs" {
  export default interface MoveActivation {
    token: UUID<TeriockTokenDocument>;
    originBarrier: boolean;
    randomDirection: boolean;
    x: number | null;
    y: number | null;
    distance: number;
    movementAction: string;
  }
}

export {};
