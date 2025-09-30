import TeriockBaseActorModel from "../base-actor-data/base-actor-data.mjs";
import type { TeriockCreature } from "../../../documents/_documents.mjs";

declare module "./creature-data.mjs" {
  export default interface TeriockCreatureModel extends TeriockBaseActorModel {
    get parent(): TeriockCreature;
  }
}
