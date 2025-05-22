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
