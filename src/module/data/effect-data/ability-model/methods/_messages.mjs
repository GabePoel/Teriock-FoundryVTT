/**
 * Generates message parts for an ability, including bars and blocks for display.
 * Creates formatted display elements for execution, targeting, expansion, costs, effects, and ability type.
 * @param {TeriockAbilityModel} abilityData - The ability data to generate message parts for.
 * @returns {Partial<Teriock.MessageData.MessagePanel>} Object containing bars and blocks for the ability message.
 * @private
 */
export function _messageParts(abilityData) {
  const src = abilityData;
  const ref = TERIOCK.options.ability;
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
        ref.executionTime[src.maneuver][src.executionTime] || "",
        ref.piercing[src.piercing] || "",
        ref.delivery[src.delivery.base] || "",
        src.interaction === "feat"
          ? ref.featSaveAttribute[src.featSaveAttribute]
          : "",
        ref.interaction[src.interaction] || "",
      ],
    },
    {
      icon: "fa-crosshairs-simple",
      label: "Targeting",
      wrappers: [
        ["missile", "cone", "sight", "aura"].includes(src.delivery.base)
          ? src.range + " ft"
          : "",
        Array.from(src.targets.map((target) => ref.targets[target])).join(", "),
        src.duration.description || "",
      ],
    },
    {
      icon: "fa-expand",
      label: "Expansion",
      wrappers: [
        ["detonate", "ripple"].includes(src.expansion)
          ? ref.attribute[src.expansionSaveAttribute]
          : "",
        ref.expansion[src.expansion] || "",
        src.expansionRange?.includes(",")
          ? src.expansionRange.split(",")[0]
          : src.expansionRange || "",
        src.expansionRange?.includes(",")
          ? src.expansionRange.split(",")[1]
          : src.expansionRange || "",
      ],
    },
    {
      icon: "fa-coins",
      label: "Costs",
      wrappers: [
        mpCost || "",
        hpCost || "",
        gpCost || "",
        ref.breakCost[src.costs.break] || "",
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
      icon: "fa-" + ref.form[src.form].icon,
      label: "Ability Type",
      wrappers: [
        ref.form[src.form].name || "",
        src.elderSorcery ? "Elder Sorcery" : "",
        ...src.effectTypes
          .filter((e) => !src.powerSources.has(e))
          .map((effect) => ref.effectTypes[effect]),
      ],
    },
  ];
  return {
    classes: abilityData.elderSorcery ? "elder-sorcery" : "",
    bars: bars,
  };
}
