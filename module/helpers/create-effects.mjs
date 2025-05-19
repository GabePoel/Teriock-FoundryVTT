import { TeriockEffect } from "../documents/effect.mjs";

export async function createAbility(document) {
    const ability = await TeriockEffect.create({
        name: "New Ability",
        type: "ability",
        img: "systems/teriock/assets/ability.svg",
    }, { parent: document });
}

export async function createResource(document) {
    return await TeriockEffect.create({
        name: "New Resource",
        type: "resource",
        img: "systems/teriock/assets/resource.svg",
    }, { parent: document });
}
