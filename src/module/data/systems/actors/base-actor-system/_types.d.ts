import "./parts/_types";
import "./_parameters";
import { TeriockActor } from "../../../../documents/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface BaseActorSystemInterface
      extends Teriock.Models.CommonSystemInterface {
      get parent(): TeriockActor;
    }
  }
}
