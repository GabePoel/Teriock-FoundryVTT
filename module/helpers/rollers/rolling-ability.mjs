import { TeriockRoll } from "../../dice/roll.mjs";
const { DialogV2 } = foundry.applications.api

export async function rollAbility(ability, options) {
    const advantage = options?.advantage || false;
    const disadvantage = options?.disadvantage || false;
    await stageUse(ability, advantage, disadvantage);
    await use(ability);
}

async function stageUse(ability, advantage, disadvantage) {
    ability.system.mpCost = 0;
    ability.system.hpCost = 0;
    ability.system.heightenedAmount = 0;
    if (ability.system.costs.mp && typeof ability.system.costs.mp === "number") {
        ability.system.mpCost = ability.system.costs.mp;
    }
    if (ability.system.costs.hp && typeof ability.system.costs.hp === "number") {
        ability.system.hpCost = ability.system.costs.hp;
    }
    let rollFormula = '';
    if (ability.system.interaction == 'attack') {
        rollFormula += '1d20'
        if (advantage) {
            rollFormula += 'kh1';
        } else if (disadvantage) {
            rollFormula += 'kl1';
        }
        rollFormula += ' + @atkPen + @av0 + @sb';
    } else if (ability.system.interaction == 'feat') {
        rollFormula = '10';
    } else {
        rollFormula = '0';
    }
    if (ability.system.forceProficient) {
        ability.system.proficient = true;
    } else {
        ability.system.proficient = ability.parent.system.proficient;
    }
    const dialogs = [];
    if (ability.system.costs.mp == 'x') {
        const mpDialog = `<label>MP Cost</label><input type="number" name="mp" value="0" min="0" max="${ability.getActor().mp}" step="1"></input>`;
        dialogs.push(mpDialog);
    }
    if (ability.system.costs.hp == 'x') {
        const hpDialog = `<label>HP Cost</label><input type="number" name="hp" value="0" min="0" max="${ability.getActor().hp}" step="1"></input>`;
        dialogs.push(hpDialog);
    }
    if (ability.system.proficient && ability.system.heightened) {
        const p = ability.system.proficient ? ability.getActor().system.p : 0;
        const heightenedDialog = `<label>Heightened Amount</label><input type="number" name="heightened" value="0" min="0" max="${p}" step="1"></input>`;
        dialogs.push(heightenedDialog);
    }
    if (dialogs.length > 0) {
        let title = '';
        if (ability.system.spell) {
            title += 'Casting ';
        } else {
            title += 'Executing ';
        }
        title += ability.name;
        await DialogV2.prompt({
            window: { title: title },
            content: dialogs.join(''),
            ok: {
                label: "Confirm",
                callback: (event, button, dialog) => {
                    if (ability.system.costs.mp == 'x') {
                        ability.system.mpCost = button.form.elements.mp.valueAsNumber;
                    }
                    if (ability.system.costs.hp == 'x') {
                        ability.system.hpCost = button.form.elements.hp.valueAsNumber;
                    }
                    if (ability.system.proficient && ability.system.heightened) {
                        ability.system.heightenedAmount = button.form.elements.heightened.valueAsNumber;
                    }
                }
            },
        });
    }
    if (['attack', 'feat'].includes(ability.system.interaction)) {
        if (ability.system.proficient) {
            rollFormula += ' + @p';
        }
        if (ability.system.heightenedAmount) {
            rollFormula += ' + @h';
        }
    }
    ability.system.formula = rollFormula;
}

async function use(ability) {
    let message = await ability.buildMessage();
    const rollData = ability.getActor().rollData();
    if (ability.system.delivery.base == 'weapon') {
        const properties = ability.getActor().system.primaryAttacker?.system?.properties || [];
        if (properties.includes('av0') || properties.includes('ub')) {
            rollData.av0 = 2;
        }
    }
    if (['av0', 'ub'].includes(ability.system.piercing)) {
        rollData.av0 = 2;
    }
    message = await foundry.applications.ux.TextEditor.enrichHTML(message);
    const roll = new TeriockRoll(ability.system.formula, rollData, {
        flavor: message,
    });
    roll.toMessage({
        speaker: ChatMessage.getSpeaker({
            actor: ability.getActor(),
        }),
    });
    let newPenalty = ability.getActor().system.attackPenalty;
    if (ability.system.interaction == 'attack') {
        newPenalty -= 5;
    }
    ability.getActor().update({
        'system.mp.value': ability.getActor().system.mp.value - ability.system.mpCost - ability.system.heightenedAmount,
        'system.hp.value': ability.getActor().system.hp.value - ability.system.hpCost,
        'system.attackPenalty': newPenalty,
    })
    ability.system.mpCost = 0;
    ability.system.hpCost = 0;
    ability.system.heightenedAmount = 0;
    ability.system.formula = null;
}