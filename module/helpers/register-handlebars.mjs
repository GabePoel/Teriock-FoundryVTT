export function registerHandlebarsHelpers() {

    // =======================
    // String Helpers
    // =======================
    Handlebars.registerHelper('lc', str => typeof str === 'string' ? str.toLowerCase() : '');
    Handlebars.registerHelper('uc', str => typeof str === 'string' ? str.toUpperCase() : '');
    Handlebars.registerHelper('length', str => typeof str === 'string' ? str.length : 0);
    Handlebars.registerHelper('dotJoin', (...args) => {
        const options = args.pop();
        return new Handlebars.SafeString(
            args.filter(arg => typeof arg === 'string' && arg.length > 0).join('&nbsp;&nbsp;·&nbsp;&nbsp;')
        );
    });

    // =======================
    // Comparison Helpers
    // =======================
    ['leq', 'geq', 'lt', 'gt'].forEach(op => {
        Handlebars.registerHelper(op, (a, b) => {
            if (typeof a !== 'number' || typeof b !== 'number') return false;
            return ({
                leq: a <= b,
                geq: a >= b,
                lt: a < b,
                gt: a > b
            })[op];
        });
    });

    Handlebars.registerHelper('includes', (list, item) => {
        if (!Array.isArray(list)) return false;
        if (typeof item === 'string') item = item.toLowerCase();
        return list.some(i => {
            if (typeof i === 'string') i = i.toLowerCase();
            return i === item;
        });
    });

    // =======================
    // Existence & Array Helpers
    // =======================
    Handlebars.registerHelper('exists', val => {
        if (Array.isArray(val)) return val.length > 0;
        if (val === undefined || val === null) return false;
        if (typeof val === 'string') return !(val.trim() === '' || val === '0' || val === '+0');
        if (typeof val === 'number') return val > 0;
        return true;
    });

    Handlebars.registerHelper('eachExceptLast', (context, options) => {
        return context.slice(0, -1).map(options.fn).join('');
    });

    Handlebars.registerHelper('repeat', (n, block) => {
        return new Handlebars.SafeString(block.repeat(n));
    });

    // =======================
    // Dice & Value Formatting Helpers
    // =======================
    Handlebars.registerHelper('firstDie', str => {
        const validDice = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];
        if (typeof str !== 'string') str = '';

        for (const die of validDice) {
            if (str.includes(die)) return 'dice-' + die;
        }

        for (let i = 0; i <= 9; i++) {
            if (str.includes(`${i} Damage`)) return `${i}`;
        }

        return 'dice';
    });

    // =======================
    // Progress Bar Helpers
    // =======================
    function normalizeBarInputs(value, max, temp = 0) {
        return {
            value: Math.max(0, value ?? 0),
            max: Math.max(0, max ?? 0),
            temp: Math.max(0, temp ?? 0)
        };
    }

    Handlebars.registerHelper('barLeft', (value, max, temp = 0) => {
        const { value: v, max: m, temp: t } = normalizeBarInputs(value, max, temp);
        return Math.floor((v / (m + t)) * 100);
    });

    Handlebars.registerHelper('barTemp', (value, max, temp = 0) => {
        const { max: m, temp: t } = normalizeBarInputs(value, max, temp);
        return Math.ceil((t / (m + t)) * 100);
    });

    Handlebars.registerHelper('barLost', (value, max, temp = 0) => {
        const { value: v, max: m, temp: t } = normalizeBarInputs(value, max, temp);
        const left = Math.floor((v / (m + t)) * 100);
        const tempP = Math.ceil((t / (m + t)) * 100);
        return 100 - left - tempP;
    });

    // =======================
    // UI Helpers
    // =======================
    Handlebars.registerHelper('tabActive', (active, tab) => active === tab ? 'active' : 'inactive');

    Handlebars.registerHelper('ttoggle', bool => `ttoggle-button${bool ? ' toggled' : ''}`);

    Handlebars.registerHelper('ticon', (icon, options) => {
        const { cssClass = '', id, parentId, action, style = 'light' } = options.hash;
        const attrs = [
            id ? `data-id="${id}"` : '',
            parentId ? `data-parent-id="${parentId}"` : '',
            action ? `data-action="${action}"` : ''
        ].join(' ');
        return new Handlebars.SafeString(
            `<i class="ticon tcard-clickable ${cssClass} fa-fw fa-${style} fa-${icon}" ${attrs}></i>`
        );
    });

    Handlebars.registerHelper('ticonToggle', (iconTrue, iconFalse, bool, options) => {
        const { cssClass = '', id, parentId, action, falseAction = true } = options.hash;
        const icon = bool ? iconTrue : iconFalse;
        const actionAttr = (bool || falseAction) && action ? `data-action="${action}"` : '';
        return new Handlebars.SafeString(`
            <i class="ticon tcard-clickable ${cssClass} fa-fw fa-light fa-${icon}" 
            ${id ? `data-id="${id}"` : ''} 
            ${parentId ? `data-parent-id="${parentId}"` : ''} 
            ${actionAttr}></i>
        `);
    });

    Handlebars.registerHelper('tcardOptions', function (
        optionsToggle,
        filterToggle,
        sortToggle,
        searchValue,
        tab,
        options
    ) {
        const { showAddButton = true, sortOptions = {}, sortValue = '' } = options.hash;
        const context = options.data.root;

        // Helper references assumed to exist
        const escape = Handlebars.Utils.escapeExpression;
        const ttoggle = Handlebars.helpers.ttoggle;
        const checked = Handlebars.helpers.checked;
        const selectOptions = Handlebars.helpers.selectOptions;

        // Paths & values
        const inputName = `system.sheet.${tab}Filters.search`;
        const inputValue = escape(searchValue);

        const optionsPath = `system.sheet.menus.${tab}Options`;
        const filterPath = `system.sheet.menus.${tab}Filters`;
        const sortPath = `system.sheet.menus.${tab}Sort`;

        const gaplessPath = `system.sheet.display.${tab}.gapless`;
        const sizePath = `system.sheet.display.${tab}.size`;
        const ascendingPath = `system.sheet.${tab}SortAscending`;

        const get = (path) => path.split('.').reduce((obj, key) => obj?.[key], context);

        const gaplessValue = get(gaplessPath);
        const sizeValue = get(sizePath);
        const ascendingValue = get(ascendingPath);

        const sizeOptions = context.config?.displayOptions?.sizes ?? {};
        const sortSelectHTML = selectOptions(sortOptions, { hash: { selected: sortValue } })?.toHTML?.() ?? '';

        return new Handlebars.SafeString(`
            <div class="tcard-options-header">
            <button class="${tab}-options-menu-toggle options-menu-toggle ${ttoggle(optionsToggle)}" 
                    data-bool="${optionsToggle}" data-path="${optionsPath}" data-action="quickToggle">
                <i class="fa-fw fa-solid fa-sliders"></i>
            </button>

            ${filterToggle !== null && filterToggle !== undefined ? `
                <button class="${tab}-filter-menu-toggle filter-menu-toggle ${ttoggle(filterToggle)}"
                        data-bool="${filterToggle}" data-path="${filterPath}" data-action="quickToggle">
                <i class="fa-fw fa-solid fa-filter"></i>
                </button>` : ''
            }

            ${sortToggle !== null && sortToggle !== undefined ? `
                <button class="${tab}-sort-menu-toggle sort-menu-toggle ${ttoggle(sortToggle)}"
                        data-bool="${sortToggle}" data-path="${sortPath}" data-action="quickToggle">
                <i class="fa-fw fa-solid fa-bars-sort"></i>
                </button>` : ''
            }

            <input type="text" name="${inputName}" placeholder="Search" value="${inputValue}">

            ${showAddButton ? `
                <button class="ttoggle-button ${tab}-add-button add-button" data-tab="${tab}" data-action="addEmbedded">
                <i class="fa-fw fa-solid fa-plus"></i>
                </button>` : ''
            }
            </div>

            ${optionsToggle ? `
            <div class="tcard-options-content">
                <div class="tgrid g4">
                <div class="tgrid-item">
                    <label for="${tab}-gapless">Gapless</label>
                    <input type="checkbox" name="${gaplessPath}" id="${tab}-gapless" ${checked(gaplessValue)}>
                </div>
                <div class="tgrid-item gi3">
                    <select name="${sizePath}" id="${tab}-size">
                    <option value="">Card Size</option>
                    ${selectOptions(sizeOptions, { hash: { selected: sizeValue } })}
                    </select>
                </div>
                </div>
            </div>` : ''
            }

            ${sortToggle ? `
            <div class="tcard-options-content">
                <div class="tgrid g4">
                <div class="tgrid-item">
                    <label for="${tab}-ascending">Ascending</label>
                    <input type="checkbox" name="${ascendingPath}" id="${tab}-ascending" ${checked(ascendingValue)}>
                </div>
                <div class="tgrid-item gi3">
                    <select name="system.sheet.${tab}SortOption" id="${tab}-sort">
                    ${sortSelectHTML}
                    </select>
                </div>
                </div>
            </div>` : ''
            }
        `);
    });


    // =======================
    // Game Config Lookup Helpers
    // =======================

    Handlebars.registerHelper('className', (arch, name) => CONFIG.TERIOCK.rankOptions[arch].classes[name].name);
    Handlebars.registerHelper('classArchetype', arch => CONFIG.TERIOCK.rankOptions[arch].name);
    Handlebars.registerHelper('executionTime', (maneuver, execTime) =>
        CONFIG.TERIOCK.abilityOptions.executionTime[maneuver]?.[execTime] ?? execTime
    );
    Handlebars.registerHelper('tradecraft', (field, name) => CONFIG.TERIOCK.tradecraftOptions[field].tradecrafts[name].name);
    Handlebars.registerHelper('field', field => CONFIG.TERIOCK.tradecraftOptions[field].name);
    Handlebars.registerHelper('equipmentMarker', item => CONFIG.TERIOCK.equipmentOptions.powerLevel[item.system.powerLevel]?.color);
    Handlebars.registerHelper('abilityMarker', effect => CONFIG.TERIOCK.abilityOptions.abilityType[effect.system.abilityType]?.color);

    // =======================
    // TCard & AbilityCards Helpers
    // =======================
    Handlebars.registerHelper('tcard', function (options) {
        const {
            img, title, subtitle, text, icons, id, parentId,
            active = true, marker = null, shattered = false, type = 'item',
            draggable = true, consumable = false, amount = 1, max = null
        } = options.hash;

        const idAttr = id ? `data-id="${id}"` : '';
        const parentIdAttr = parentId ? `data-parent-id="${parentId}"` : '';
        const typeAttr = type ? `data-type="${type}"` : '';
        const subtitleDiv = consumable
            ? `<div class="tcard-subtitle tcard-clickable" data-action="useOneDoc">${amount}${max ? ` / ${max}` : ' remaining'}</div>`
            : `<div class="tcard-subtitle">${subtitle}</div>`;

        return new Handlebars.SafeString(`
            <div class="tcard ${draggable ? 'draggable' : ''} ${active ? 'active' : 'inactive'} ${shattered ? 'shattered' : ''}" ${idAttr} ${parentIdAttr} ${typeAttr} data-action="openDoc">
            <div class="tcard-marker" style="${marker ? `background-color: ${marker}; width: 4px; min-width: 4px;` : ''}"></div>
            <div class="tcard-image" data-action="rollDoc"><img src="${img}" alt="${title}" /></div>
            <div class="tcard-body">
                <div class="tcard-titles">
                <div class="tcard-title">${title}</div>
                ${subtitleDiv}
                </div>
                <div class="tcard-content">
                <div class="tcard-text">${text}</div>
                <div class="tcard-icons">${icons || ''}</div>
                </div>
            </div>
            <div class="tcard-background"></div>
            </div>
        `);
    });

    Handlebars.registerHelper('abilityCards', function (abilities, system, tab = 'ability', options) {
        if (!Array.isArray(abilities) || abilities.length === 0) return '';

        const isGapless = system?.sheet?.display?.[tab]?.gapless;
        const sizeClass = system?.sheet?.display?.[tab]?.size || '';
        const containerClass = `tcard-container ${isGapless ? 'gapless' : ''} ${sizeClass}`.trim();

        const renderedCards = abilities.map(ability => {
            const subtitle = Handlebars.helpers.executionTime(ability.system?.maneuver, ability.system?.executionTime);
            const marker = Handlebars.helpers.abilityMarker(ability);
            const chatIcon = Handlebars.helpers.ticon("comment", {
                hash: { action: "chatDoc", id: ability._id, parentId: ability.parent?._id }
            });
            const enableIcon = Handlebars.helpers.ticonToggle("circle", "circle-check", ability.disabled, {
                hash: { action: "toggleForceDisabledDoc", id: ability._id, parentId: ability.parent?._id }
            });

            return Handlebars.helpers.tcard({
                hash: {
                    img: ability.img,
                    title: ability.name,
                    subtitle,
                    text: ability.parent?.name,
                    icons: chatIcon + enableIcon,
                    id: ability._id,
                    parentId: ability.parent?._id,
                    active: !ability.disabled,
                    marker,
                    shattered: false,
                    consumable: ability.system.consumable,
                    amount: ability.system.quantity,
                    max: ability.system.maxQuantity,
                    type: 'effect'
                }
            });
        }).join('\n');

        return new Handlebars.SafeString(`<div class="${containerClass}">${renderedCards}</div>`);
    });
}