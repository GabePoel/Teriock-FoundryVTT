import "./parts/_types";
import "./_parameters";
import { TeriockActor } from "../../../../documents/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type BaseActorSystemData = {
      get parent(): TeriockActor;
    };
  }
}
