import TeriockBaseActorModel from "../base-actor-model/base-actor-model.mjs";
import { TeriockCreature } from "../../../documents/_documents.mjs";

declare module "./creature-model.mjs" {
  export default interface TeriockCreatureModel extends TeriockBaseActorModel {
    get parent(): TeriockCreature;
  }
}
