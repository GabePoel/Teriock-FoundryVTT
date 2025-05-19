export function buildFluencyMessage(fluency) {
    const ref = CONFIG.TERIOCK.tradecraftOptions;
    const src = fluency.system;
    const bars = [
        {
            icon: 'fa-' + ref[src.field].tradecrafts[src.tradecraft].icon,
            wrappers: [
                ref[src.field].name,
                ref[src.field].tradecrafts[src.tradecraft].name,
            ],
        }
    ]
    const blocks = [
        {
            title: 'Description',
            text: src.description,
        },
    ]
    return {
        bars: bars,
        blocks: blocks,
    }
}