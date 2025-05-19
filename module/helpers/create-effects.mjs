import { TeriockEffect } from "../documents/effect.mjs";

export async function createAbility(document, name = "New Ability") {
    const ability = await TeriockEffect.create({
        name,
        type: "ability",
        img: "systems/teriock/assets/ability.svg",
    }, { parent: document });
    if (name !== "New Ability") {
        ability.wikiPull();
    }
}

export async function createResource(document, name = "New Resource") {
    return await TeriockEffect.create({
        name,
        type: "resource",
        img: "systems/teriock/assets/resource.svg",
    }, { parent: document });
}
