import TeriockBaseEffect from "../documents/effect.mjs";

export async function createAbility(document, name, options = {}) {
  const abilityData = {
    name: "New Ability",
    type: "ability",
    img: "systems/teriock/assets/ability.svg",
    system: {},
  };
  if (name) {
    abilityData.name = name;
  }
  // let parent = null;
  // let embeddingDocument = document;
  // if (document.documentName === "ActiveEffect") {
  //   parent = document;
  //   embeddingDocument = document.parent;
  // }
  // const abilities = await embeddingDocument.createEmbeddedDocuments("ActiveEffect", [abilityData]);
  // const ability = abilities[0];
  // if (ability.name !== "New Ability") {
  //   await ability.system.wikiPull(options);
  // }
  // if (parent) {
  //   await parent.parent.updateEmbeddedDocuments("ActiveEffect", [
  //     {
  //       _id: ability._id,
  //       "system.parentId": parent._id,
  //     },
  //     {
  //       _id: parent._id,
  //       "system.childIds": parent.system.childIds.concat(ability._id),
  //     },
  //   ]);
  // }
  if (document.documentName === "ActiveEffect" || document.documentName === "PseudoAbility") {
    const { default: PseudoAbility } = await import("../documents/pseudo-ability.mjs");
    const ability = await PseudoAbility.create(
      {
        name: "New Ability",
        type: "pseudo-ability",
        img: "systems/teriock/assets/ability.svg",
        system: {},
      },
      { parent: document },
    );
    await document.forceUpdate();
    return ability;
  } else {
    const abilities = await document.createEmbeddedDocuments("ActiveEffect", [abilityData]);
    const ability = abilities[0];
    // await ability.system.wikiPull(options);
    await document.forceUpdate();
    return ability;
  }
}

export async function createResource(document) {
  const resource = await TeriockBaseEffect.create(
    {
      name: "New Resource",
      type: "resource",
      img: "systems/teriock/assets/resource.svg",
    },
    { parent: document },
  );
  await document.forceUpdate();
  return resource;
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

  const property = await TeriockBaseEffect.create(
    {
      name: name,
      type: "property",
      img: "systems/teriock/assets/property.svg",
      system: system,
    },
    { parent: document },
  );
  await document.forceUpdate();
  return property;
}

export async function createEffect(document) {
  const effect = await TeriockBaseEffect.create(
    {
      name: "New Effect",
      type: "effect",
      img: "systems/teriock/assets/effect.svg",
    },
    { parent: document },
  );
  await document.forceUpdate();
  return effect;
}

export async function createFluency(document) {
  const fluency = await TeriockBaseEffect.create(
    {
      name: "New Fluency",
      type: "fluency",
      img: "systems/teriock/assets/fluency.svg",
    },
    { parent: document },
  );
  await document.forceUpdate();
  return fluency;
}
