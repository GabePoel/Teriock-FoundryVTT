import type TeriockActor from "../../../documents/actor.mjs";
import type TeriockBaseActorData from "../../../data/actor-data/base-actor-data/base-actor-data.mjs";
import type { ActorSheet } from "@client/applications/sheets/_module.mjs";
import type { TeriockSheet } from "../../mixins/_types";

declare module "./base-actor-sheet.mjs" {
  export default interface TeriockBaseActorSheet extends TeriockSheet, ActorSheet {
    actor: TeriockActor & { system: TeriockBaseActorData };
    document: TeriockActor & { system: TeriockBaseActorData };
  }
}
