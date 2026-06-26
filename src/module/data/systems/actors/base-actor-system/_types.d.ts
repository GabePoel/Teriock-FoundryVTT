import "./parts/_types";
import { TeriockActor } from "../../../../documents/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type BaseActorSystemData = {
      /** <schema> Per-document behavior and display settings */
      settings: Teriock.Models.ActorSettingsModel;

      get parent(): TeriockActor;
    };
  }
}
