import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import type TeriockActor from "../../../documents/actor.mjs";

export interface TeriockEffectSchema extends TeriockBaseEffectData {
  source: string;
  expirations: {
    condition: {
      value: string | null;
      present: boolean;
    };
    /** Expirations based on combat timing. */
    combat: {
      /** UUID of the actor whose turn this may expire on. */
      who: Teriock.UUID<TeriockActor> | null;
      /** The conditions under which this effect expires. */
      what: {
        /**  What is the type of thing that causes this to expire? */
        type: "forced" | "rolled" | "none";
        /** If this expires on a roll, what is the roll that needs to be made? */
        roll: "2d4",
        /** What is the minimum value that needs to be rolled in order for this to expire? */
        threshold: number;
      }
      /** When in the combat this effect expires. */
      when: {
        /** What is the timing for the trigger of this effect expiring? */
        time: "start" | "end";
        /** What is the trigger for this effect expiring? */
        trigger: "turn" | "combat";
        /** A number of instances of the trigger firing to skip before this effect expires. */
        skip: number;
      }
    };
    movement: boolean;
    dawn: boolean;
    sustained: boolean;
    /** Description of the circumstances under which this effect expires. */
    description: string;
  };
  conditionExpiration: boolean;
  movementExpiration: boolean;
  dawnExpiration: boolean;
  sustainedExpiration: boolean;
}

declare module "./effect-data.mjs" {
  export default interface TeriockEffectData extends TeriockEffectSchema {}
}
