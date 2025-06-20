import "./methods/resolution/_types";
import { AppliesData } from "./methods/schema/_types";
import type TeriockBaseEffectData from "../base-data/base-data.mjs";

declare module "./ability-data.mjs" {
  export default interface TeriockAbilityData extends TeriockBaseEffectData {
    wikiNamespace: string;
    parentId: string;
    childIds: string[];
    elderSorcery: boolean;
    elderSorceryIncant: string;
    powerSources: string[];
    interaction: string;
    featSaveAttribute: string;
    maneuver: string;
    executionTime: string;
    delivery: {
      base: string;
      parent: string;
      package: string;
    };
    targets: string[];
    elements: string[];
    duration: string;
    sustained: boolean;
    range: string;
    overview: {
      base: string;
      proficient: string;
      fluent: string;
    };
    results: {
      hit: string;
      critHit: string;
      miss: string;
      critMiss: string;
      save: string;
      critSave: string;
      fail: string;
      critFail: string;
    };
    piercing: string;
    improvements: {
      attributeImprovement: {
        attribute: string;
        minVal: number;
      };
      featSaveImprovement: {
        attribute: string;
        amount: number;
      };
    };
    skill: boolean;
    spell: boolean;
    standard: boolean;
    ritual: boolean;
    class: string;
    rotator: boolean;
    invoked: boolean;
    costs: {
      verbal: boolean;
      somatic: boolean;
      material: boolean;
      mp: {
        type: string;
        value: {
          static: number;
          formula: string;
          variable: string;
        };
      };
      hp: {
        type: string;
        value: {
          static: number;
          formula: string;
          variable: string;
        };
      };
      break: string;
      materialCost: string;
    };
    heightened: string;
    endCondition: string;
    requirements: string;
    effects: string[];
    expansion: string;
    expansionRange: string;
    expansionSaveAttribute: string;
    trigger: string;
    basic: boolean;
    abilityType: string;
    limitation: string;
    improvement: string;
    applies: {
      base: AppliesData;
      proficient: AppliesData;
      fluent: AppliesData;
    };
  }
}
