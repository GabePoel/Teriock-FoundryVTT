import TeriockActor from "../../../documents/actor.mjs";
import TeriockBaseActorData from "../../../data/actor-data/base-actor-data/base-actor-data.mjs";
import { TeriockSheet } from "../../mixins/_types";

declare module "./base-actor-sheet.mjs" {
  export default interface TeriockBaseActorSheet extends TeriockSheet {
    actor: TeriockActor & {
      system: TeriockBaseActorData;
    };
    document: TeriockActor & {
      system: TeriockBaseActorData;
    };
    other: string;
  }
}
