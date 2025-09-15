declare global {
  namespace Teriock.Parameters.Actor {
    /** Valid hackable body parts */
    export type HackableBodyPart = | "arm" | "leg" | "body" | "ear" | "eye" | "mouth" | "nose";

    /** Valid stat attributes */
    export type StatAttribute = keyof typeof TERIOCK.options.ability.attribute;

    /** Valid attributes */
    export type Attribute = Teriock.Parameters.Actor.StatAttribute | "unp";

    /** Functions that should be skipped. */
    export type SkipFunctions = {
      /** Skip `applyEncumbrance()` */
      applyEncumbrance?: boolean;
      /** Skip `prepareTokens()` */
      prepareTokens?: boolean;
      /** Skip `checkDown()` */
      checkDown?: boolean;
      /** Skip `etherealKill()` */
      etherealKill?: boolean;
      /** Skip `checkExpirations()` */
      checkExpirations?: boolean;
    };

    export type LightingAnimation =
      | ""
      | "witchwave"
      | "chroma"
      | "energy"
      | "fairy"
      | "torch"
      | "grid"
      | "ghost"
      | "hexa"
      | "dome"
      | "emanation"
      | "pulse"
      | "wave"
      | "radialrainbow"
      | "revolving"
      | "siren"
      | "smokepatch"
      | "reactivepulse"
      | "starlight"
      | "sunburst"
      | "fog"
      | "rainbowswirl"
      | "flame"
      | "vortex";

    export type PayMode = "exact" | "greedy";

    export type DeathBagStoneColor = keyof typeof TERIOCK.options.die.deathBagStoneColor;
  }
}

export {};
