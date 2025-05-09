export function cleanFeet(feet) {
    const synonyms = ['foot', 'feet']
    synonyms.forEach(synonym => {
        const regex = new RegExp(synonym, 'gi');
        feet = feet.replace(regex, 'ft');
    });
    feet = feet.replace(/\bft(?!\.)\b/gi, 'ft.');
    feet = feet.trim();
    if (/\d$/.test(feet) && !feet.endsWith('ft.')) {
        feet += ' ft.';
    }
    return feet;
}

export function cleanPounds(pounds) {
    const synonyms = ['pound', 'pounds']
    synonyms.forEach(synonym => {
        const regex = new RegExp(synonym, 'gi');
        pounds = pounds.replace(regex, 'lb');
    });
    pounds = pounds.replace(/\blb(?!\.)\b/gi, 'lb.');
    pounds = pounds.trim();
    if (/\d$/.test(pounds) && !pounds.endsWith('lb.')) {
        pounds += ' lb.';
    }
    return pounds;
}

export function cleanPlusMinus(value) {
    value = value.replace('+', '').trim();
    const number = parseFloat(value);
    if (!isNaN(number) && number > 0) {
        value = `+${number}`;
    } else if (!isNaN(number)) {
        value = `${number}`;
    }
    return value;
}

export function cleanMp(value) {
    const synonyms = ['mana']
    synonyms.forEach(synonym => {
        const regex = new RegExp(synonym, 'gi');
        value = value.replace(regex, 'mp');
    });
    value = value.replace(/\bmp(?!\.)\b/gi, 'MP');
    value = value.trim();
    if (/\d$/.test(value) && !value.endsWith('MP')) {
        value += ' MP';
    }
    return value;
}

export function cleanHp(value) {
    const synonyms = ['health', 'hits', 'hit']
    synonyms.forEach(synonym => {
        const regex = new RegExp(synonym, 'gi');
        value = value.replace(regex, 'hp');
    });
    value = value.replace(/\bhp(?!\.)\b/gi, 'HP');
    value = value.trim();
    if (/\d$/.test(value) && !value.endsWith('HP')) {
        value += ' HP';
    }
    return value;
}

export function cleanAv(value) {
    const synonyms = ['armor value', 'armor']
    synonyms.forEach(synonym => {
        const regex = new RegExp(synonym, 'gi');
        value = value.replace(regex, 'av');
    });
    value = value.replace(/\bav(?!\.)\b/gi, 'AV');
    value = value.trim();
    if (/\d$/.test(value) && !value.endsWith('AV')) {
        value += ' AV';
    }
    return value;
}

export function cleanBv(value) {
    value = cleanPlusMinus(value);
    const synonyms = ['block value', 'block']
    synonyms.forEach(synonym => {
        const regex = new RegExp(synonym, 'gi');
        value = value.replace(regex, 'bv');
    });
    value = value.replace(/\bbv(?!\.)\b/gi, 'BV');
    value = value.trim();
    if (/\d$/.test(value) && !value.endsWith('BV')) {
        value += ' BV';
    }
    return value;
}

export function cleanStr(value) {
    const synonyms = ['strength', 'str']
    synonyms.forEach(synonym => {
        const regex = new RegExp(synonym, 'gi');
        value = value.replace(regex, 'str');
    });
    value = value.replace(/\bstr(?!\.)\b/gi, 'STR');
    value = value.trim();
    if (/\d$/.test(value) && !value.endsWith('STR')) {
        value += ' Min STR';
    }
    return value;
}

export function cleanDamage(value) {
    const synonyms = ['dmg']
    synonyms.forEach(synonym => {
        const regex = new RegExp(synonym, 'gi');
        value = value.replace(regex, 'damage');
    });
    value = value.replace(/\bdamage(?!\.)\b/gi, 'Damage');
    value = value.trim();
    if (/\d$/.test(value) && !value.endsWith('Damage')) {
        value += ' Damage';
    }
    return value;
}

export function cleanSuffix(value, suffix, synonyms) {
    synonyms.forEach(synonym => {
        const regex = new RegExp(synonym, 'gi');
        value = value.replace(regex, suffix);
    });
    value = value.replace(new RegExp(`\\b${suffix}(?!\\.)\\b`, 'gi'), suffix.toUpperCase());
    value = value.trim();
    if (/\d$/.test(value) && !value.endsWith(suffix.toUpperCase())) {
        value += ` ${suffix.toUpperCase()}`;
    }
    return value;
}