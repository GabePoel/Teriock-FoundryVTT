import { TeriockEffect } from "../documents/effect.mjs";
const { ux } = foundry.applications;

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
    console.log(ability);
    if (name) {
        ability._wikiPull();
    }
}

export function connectEmbedded(document, element) {
    element.querySelectorAll('.tcard').forEach((el) => {
        const id = el.getAttribute('data-id');
        const parentId = el.getAttribute('data-parent-id');
        const embedded = document.items?.get(id) || document.effects?.get(id) || document.items?.get(parentId)?.effects.get(id);
        if (embedded) {
            new ux.ContextMenu(
                el,
                '.tcard',
                [
                    {
                        name: 'Edit',
                        icon: '<i class="fas fa-edit"></i>',
                        callback: () => {
                            embedded.sheet.render(true);
                        }
                    },
                    {
                        name: 'Delete',
                        icon: '<i class="fas fa-trash"></i>',
                        callback: () => {
                            embedded.delete();
                        }
                    },
                ],
                {
                    eventName: 'contextmenu',
                    jQuery: false,
                    fixed: true,
                }
            );
            el.addEventListener('click', (event) => {
                event.preventDefault();
                embedded.sheet.render(true);
            });
        }
    });
}