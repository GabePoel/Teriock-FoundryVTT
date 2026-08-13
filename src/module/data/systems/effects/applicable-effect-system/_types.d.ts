declare module "./applicable-effect-system.mjs" {
  export default interface ApplicableEffectSystem {
    /** <schema> UUID of the document this is sourced from */
    _src: UUID<TeriockActiveEffect<"ability">> | null;
    /** <schema> Blocks representing the source */
    blocks: Teriock.Panels.PanelBlock[];
    /** <schema> If this was the result of an effect that went critical */
    critical: boolean;
    /** <schema> UUID of the actor which executed the ability this is sourced from */
    executor: UUID<TeriockActor> | null;
    /** <schema> How much the source was heightened */
    heightened: number;
    /** <schema> If this effect is sustained */
    sustained: boolean;
  }
}

export {};
