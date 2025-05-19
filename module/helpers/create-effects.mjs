import { TeriockEffect } from "../documents/effect.mjs";

export async function createAbility(document, name) {
    let abilityName = "New Ability";
    if (name) {
        abilityName = name;
    }
    const ability = await TeriockEffect.create({
        name: abilityName,
        type: "ability",
        img: "systems/teriock/assets/ability.svg",
    }, {
        parent: document,
    });
    if (name) {
        ability.wikiPull();
    }
}

export async function createResource(document, name) {
    let resourceName = "New Resource";
    if (name) {
        resourceName = name;
    }
    const resource = await TeriockEffect.create({
        name: resourceName,
        type: "resource",
        img: "systems/teriock/assets/resource.svg",
    }, {
        parent: document,
    });
    return resource;
}