declare module "./executed-effect-system.mjs" {
  export default interface ExecutedEffectSystem {
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
