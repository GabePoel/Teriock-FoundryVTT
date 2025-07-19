/**
 * Generates message parts for an ability, including bars and blocks for display.
 * Creates formatted display elements for execution, targeting, expansion, costs, effects, and ability type.
 *
 * @param {TeriockAbilityData} abilityData - The ability data to generate message parts for.
 * @returns {Partial<Teriock.MessageParts>} Object containing bars and blocks for the ability message.
 * @private
 */
export function _messageParts(abilityData) {
  const src = abilityData;
  const ref = CONFIG.TERIOCK.abilityOptions;
  let mpCost = "";
  if (src.costs.mp.type === "variable") {
    mpCost = "Variable MP";
  } else if (src.costs.mp.type === "formula") {
    mpCost = src.costs.mp.value.formula + " MP";
  } else if (src.costs.mp.type === "static") {
    mpCost = src.costs.mp.value.static + " MP";
  }
  let hpCost = "";
  if (src.costs.hp.type === "variable") {
    hpCost = "Variable HP";
  } else if (src.costs.hp.type === "formula") {
    hpCost = src.costs.hp.value.formula + " HP";
  } else if (src.costs.hp.type === "static") {
    hpCost = src.costs.hp.value.static + " HP";
  } else if (src.costs.hp.type === "hack") {
    hpCost = "Hack";
  }
  let gpCost = "";
  if (src.costs.gp.type === "variable") {
    gpCost = "Variable ₲";
  } else if (src.costs.gp.type === "formula") {
    gpCost = src.costs.gp.value.formula + " ₲";
  } else if (src.costs.gp.type === "static") {
    gpCost = src.costs.gp.value.static + " ₲";
  }
  const bars = [
    {
      icon: "fa-arrows-turn-right",
      label: "Execution",
      wrappers: [
        ref.executionTime[src.maneuver][src.executionTime],
        ref.piercing[src.piercing],
        ref.delivery[src.delivery.base],
        src.interaction === "feat" ? ref.featSaveAttribute[src.featSaveAttribute] : "",
        ref.interaction[src.interaction],
      ],
    },
    {
      icon: "fa-crosshairs-simple",
      label: "Targeting",
      wrappers: [
        ["missile", "cone", "sight", "aura"].includes(src.delivery.base) ? src.range + " ft" : "",
        src.targets.map((target) => ref.targets[target]).join(", "),
        src.duration,
      ],
    },
    {
      icon: "fa-expand",
      label: "Expansion",
      wrappers: [
        ["detonate", "ripple"].includes(src.expansion) ? ref.attribute[src.expansionSaveAttribute] : "",
        ref.expansion[src.expansion],
        src.expansionRange?.includes(",") ? src.expansionRange.split(",")[0] : [src.expansionRange],
        src.expansionRange?.includes(",") ? src.expansionRange.split(",")[1] : [src.expansionRange],
      ],
    },
    {
      icon: "fa-coins",
      label: "Costs",
      wrappers: [
        mpCost,
        hpCost,
        gpCost,
        ref.breakCost[src.costs.break],
        src.costs.verbal ? "Verbal" : "",
        src.costs.somatic ? "Somatic" : "",
        src.costs.material ? "Material" : "",
        src.invoked ? "Invoked" : "",
      ],
    },
    {
      icon: "fa-bolt",
      label: "Effects and Power Sources",
      wrappers: [
        src.basic ? "Basic" : "",
        src.sustained ? "Sustained" : "",
        src.standard && src.skill ? "Semblant" : "",
        src.standard && src.spell ? "Conjured" : "",
        ...src.powerSources.map((power) => ref.powerSources[power]),
        ...src.elements.map((element) => ref.elements[element]),
        src.ritual ? "Ritual" : "",
        src.rotator ? "Rotator" : "",
        src.skill ? "Skill" : "",
        src.spell ? "Spell" : "",
      ],
    },
    {
      icon: "fa-" + ref.abilityType[src.abilityType].icon,
      label: "Ability Type",
      wrappers: [
        ref.abilityType[src.abilityType].name,
        src.elderSorcery ? "Elder Sorcery" : "",
        ...src.effects.map((effect) => ref.effects[effect]),
      ],
    },
  ];
  let elderSorceryElementString = "";
  if (src.elderSorcery) {
    const elderSorceryElements = src.elements
      .slice()
      .sort((a, b) => a.localeCompare(b))
      .map((e) => e.charAt(0).toUpperCase() + e.slice(1));
    if (elderSorceryElements.length === 0) {
      elderSorceryElementString = "Celestial";
    } else if (elderSorceryElements.length === 1) {
      elderSorceryElementString = elderSorceryElements[0];
    } else if (elderSorceryElements.length === 2) {
      elderSorceryElementString = `${elderSorceryElements[0]} and ${elderSorceryElements[1]}`;
    } else {
      elderSorceryElementString =
        elderSorceryElements.slice(0, -1).join(", ") + ", and " + elderSorceryElements[elderSorceryElements.length - 1];
    }
  }
  const blocks = [
    {
      title: "Elder Sorcery incant",
      text: src.elderSorceryIncant,
      special: "ES",
      elements: elderSorceryElementString,
    },
    {
      title: "Mana cost",
      text: src.costs.mp.value.variable,
    },
    {
      title: "Hit cost",
      text: src.costs.hp.value.variable,
    },
    {
      title: "Material cost",
      text: src.costs.materialCost,
    },
    {
      title: "Trigger",
      text: src.trigger,
    },
    {
      title: "Limitation",
      text: src.limitation,
    },
    {
      title: "Improvement",
      text: src.improvement,
    },
    {
      title: "Requirements",
      text: src.requirements,
    },
    {
      title: "Description",
      text: src.overview.base,
    },
    {
      title: "If proficient",
      text: src.overview.proficient,
    },
    {
      title: "If fluent",
      text: src.overview.fluent,
    },
    {
      title: "On critical fail",
      text: src.results.critFail,
    },
    {
      title: "On fail",
      text: src.results.fail,
    },
    {
      title: "On success",
      text: src.results.save,
    },
    {
      title: "On critical success",
      text: src.results.critSave,
    },
    {
      title: "On critical hit",
      text: src.results.critHit,
    },
    {
      title: "On hit",
      text: src.results.hit,
    },
    {
      title: "On miss",
      text: src.results.miss,
    },
    {
      title: "On critical miss",
      text: src.results.critMiss,
    },
    {
      title: "Heightened",
      text: src.heightened,
    },
    {
      title: "End condition",
      text: src.endCondition,
    },
  ];
  return {
    bars: bars,
    blocks: blocks,
  };
}
