import { addAbilitiesBlock } from "./message-parts.mjs";

export function buildPowerMessage(power) {
    const ref = CONFIG.TERIOCK.powerOptions;
    const src = power.system;
    const bars = [
        {
            icon: 'fa-' + ref[src.type].icon,
            wrappers: [
                ref[src.type].name,
            ]
        }
    ]
    const blocks = [
        {
            title: 'Description',
            text: src.description,
        },
    ]
    addAbilitiesBlock(power.transferredEffects, blocks);
    return {
        bars: bars,
        blocks: blocks,
    }
}