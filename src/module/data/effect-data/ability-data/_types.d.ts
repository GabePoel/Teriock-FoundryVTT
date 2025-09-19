import type TeriockBaseEffectModel from "../base-effect-data/base-effect-data.mjs";
import type { AbilityImpact } from "./types/consequences";
import type { TeriockAbility, TeriockConsequence } from "../../../documents/_documents.mjs";
import type { HierarchyDataMixinInterface } from "../../mixins/hierarchy-data-mixin/_types";
import type { ConsumableDataMixinInterface } from "../../mixins/consumable-data-mixin/_types";
import type { OverviewText, ResultsText } from "./types/summary";
import type { ImprovementsConfig } from "./types/improvements";
import type { Duration } from "./types/duration";
import type { DeliveryConfig } from "./types/interaction";
import type { CostAdjustment, CostsConfig } from "./types/costs";
import type { ExecutableDataMixinInterface } from "../../mixins/executable-data-mixin/_types";

declare module "./ability-data.mjs" {
  export default interface TeriockAbilityModel extends TeriockBaseEffectModel,
    ConsumableDataMixinInterface,
    ExecutableDataMixinInterface,
    HierarchyDataMixinInterface {
    /** <schema> If this ability is adept and how much it costs if so */
    adept: CostAdjustment;
    /** <schema> Impacts of using this ability */
    applies: {
      /** <schema> Base impact of using this ability */
      base: AbilityImpact;
      /** <schema> How the impacts change if fluent in this ability */
      fluent: AbilityImpact;
      /** <schema> How the impacts change if this ability is heightened */
      heightened: AbilityImpact;
      /** <schema> {@link TeriockMacro}s hooked to the parent {@link TeriockActor} */
      macros: Teriock.Parameters.Shared.MacroHookRecord;
      /** <schema> How the impacts change if proficient in this ability */
      proficient: AbilityImpact;
    };
    /** <schema> If this is a basic ability */
    basic: boolean;
    /** <schema> What class this ability is associated with */
    class: Teriock.Parameters.Rank.RankClass;
    /** <schema> Costs that must be spent for this ability to be used */
    costs: CostsConfig;
    /** <schema> This ability's delivery */
    delivery: DeliveryConfig;
    /** <schema> Time and circumstances in which this ability is active */
    duration: Duration;
    /**
     * <schema> Tags that describe what type of effect this ability is
     * ("effect" in the Teriock rules sense, not in the Foundry VTT sense)
     */
    effectTypes: Set<Teriock.Parameters.Ability.EffectTag>;
    /** <schema> If this ability is considered to be Elder Sorcery */
    elderSorcery: boolean;
    /** <schema> Wording of this ability's Elder Sorcery incant */
    elderSorceryIncant: string;
    /** <schema> Elements of this ability */
    elements: Set<Teriock.Parameters.Ability.Element>;
    /** <schema> Circumstances in which this ability's effect ends */
    endCondition: string;
    /** <schema> This ability's execution time */
    executionTime: Teriock.Parameters.Ability.ExecutionTime;
    /** <schema> This ability's expansion */
    expansion: Teriock.Parameters.Ability.Expansion | null;
    /** <schema> What is the maximum range of this ability's expansion */
    expansionRange: string | null;
    /** <schema> What attribute is used for feat saves against this ability's expansion */
    expansionSaveAttribute: Teriock.Parameters.Actor.Attribute;
    /** <schema> What attribute is used for feat saves against this ability */
    featSaveAttribute: Teriock.Parameters.Actor.Attribute;
    /** <schema> The "form" of this ability (what color it would be printed on a card) */
    form: Teriock.Parameters.Shared.Form;
    /** <schema> If this ability is gifted and how much it costs if so */
    gifted: CostAdjustment;
    /** <schema> Description of how this ability changes if heightened */
    heightened: string;
    /**
     * <schema> Description of any improvement that makes this ability better than it would otherwise be
     * (not to be confused with {@link TeriockAbilityModel.improvements})
     */
    improvement: string;
    /**
     * <schema> Attributes that this ability improves
     * (not to be confused with {@link TeriockAbilityModel.improvement})
     */
    improvements: ImprovementsConfig;
    /** <schema> This ability's interaction */
    interaction: Teriock.Parameters.Ability.Interaction;
    /** <schema> If this ability is invoked */
    invoked: boolean;
    /** <schema> Description of any limitation that makes this ability worse than it would otherwise be */
    limitation: string;
    /** <schema> This ability's maneuver */
    maneuver: Teriock.Parameters.Ability.Maneuver;
    /** <schema> Description of what this ability does */
    overview: OverviewText;
    /** <schema> How well this ability pierces armor and equipment */
    piercing: Teriock.Parameters.Ability.Piercing;
    /** <schema> Power sources that must be available in order for this ability to work */
    powerSources: Set<Teriock.Parameters.Ability.PowerSource>;
    /** <schema> If this ability needs to be prepared */
    prepared: boolean;
    /** <schema> The maximum range at which this ability can be used */
    range: string | null;
    /** <schema> Requirements that must be met for this ability to be used */
    requirements: string;
    /** <schema> What this ability does to a target */
    results: ResultsText;
    /** <schema> If this ability is a ritual */
    ritual: boolean;
    /** <schema> If this ability is a rotator */
    rotator: boolean;
    /** <schema> If this ability is considered "secret" */
    secret: boolean;
    /** <schema> If this ability is considered a "skill" */
    skill: boolean;
    /** <schema> If this ability is a spell */
    spell: boolean;
    /** <schema> If this ability is considered "standard" */
    standard: boolean;
    /** <schema> If this ability is sustained */
    sustained: boolean;
    /** <schema> What consequences this is ability is currently sustaining */
    sustaining: Set<Teriock.UUID<TeriockConsequence>>;
    /** <schema> Appropriate targets */
    targets: Set<Teriock.Parameters.Ability.Target>;
    /** <schema> Description of this ability's trigger */
    trigger: string;
    /** <schema> If this ability is automatically warded */
    warded: boolean;

    get parent(): TeriockAbility;
  }
}
