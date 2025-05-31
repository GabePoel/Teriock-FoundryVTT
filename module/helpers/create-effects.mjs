import { TeriockEffect } from "../documents/effect.mjs";

export async function createAbility(document, name) {
  let assignedName = "New Ability";
  if (name) {
    assignedName = name;
  }
  const ability = await TeriockEffect.create({
    name: assignedName,
    type: "ability",
    img: "systems/teriock/assets/ability.svg",
  }, { parent: document });
  if (assignedName !== "New Ability") {
    await ability.wikiPull();
  }
  return ability;
}

export async function createResource(document) {
  return await TeriockEffect.create({
    name: "New Resource",
    type: "resource",
    img: "systems/teriock/assets/resource.svg",
  }, { parent: document });
}

export async function createProperty(document, key = null) {
  let description = "Insert description here.";
  let propertyType = "normal";
  let name = "New Property";
  if (CONFIG.TERIOCK.equipmentOptions.properties[key]) {
    name = CONFIG.TERIOCK.equipmentOptions.properties[key];
    description = CONFIG.TERIOCK.content.properties[key].content;
    propertyType = "intrinsic";
  } else if (CONFIG.TERIOCK.equipmentOptions.magicalProperties[key]) {
    name = CONFIG.TERIOCK.equipmentOptions.magicalProperties[key];
    description = CONFIG.TERIOCK.content.magicalProperties[key].content;
    propertyType = "normal";
  } else if (CONFIG.TERIOCK.equipmentOptions.materialProperties[key]) {
    name = CONFIG.TERIOCK.equipmentOptions.materialProperties[key];
    description = CONFIG.TERIOCK.content.materialProperties[key].content;
    propertyType = "intrinsic";
  }
  if (key === "legendary") {
    propertyType = "special";
  } else if (key === "cumbersome") {
    propertyType = "flaw";
  }
  const system = {
    propertyType: propertyType,
    description: description,
  };

  return await TeriockEffect.create({
    name: name,
    type: "property",
    img: "systems/teriock/assets/property.svg",
    system: system,
  }, { parent: document });
}

export async function createEffect(document) {
  return await TeriockEffect.create({
    name: "New Effect",
    type: "effect",
    img: "systems/teriock/assets/effect.svg",
  }, { parent: document });
}