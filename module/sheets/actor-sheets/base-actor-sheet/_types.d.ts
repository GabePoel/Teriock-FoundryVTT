import TeriockActor from "../../../documents/actor.mjs";
import TeriockBaseActorData from "../../../data/actor-data/base-actor-data/base-actor-data.mjs";
import { ActorSheetV2 } from "@client/applications/sheets/_module.mjs";
import { TeriockSheet } from "../../mixins/_types";

declare module "./base-actor-sheet.mjs" {
  export default interface TeriockBaseActorSheet extends TeriockSheet, ActorSheetV2 {
    actor: TeriockActor & {
      system: TeriockBaseActorData;
    };
    document: TeriockActor & {
      system: TeriockBaseActorData;
    };
  }
}
