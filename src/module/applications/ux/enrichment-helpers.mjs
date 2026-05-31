/**
 * Build regex patterns consistently in ways that mostly match Foundry conventions.
 * @param {Teriock.Enrichment.Format} format
 * @returns {RegExp}
 */
function buildPattern(format) {
  const aliases = format.aliases.join("|");
  const label = `(?:\\{(?<label>[^}]+)\\})?`;
  switch (format.type) {
    case "link":
      return new RegExp(`@(?<alias>${aliases})\\[(?<payload>[^\\]]+)]${label}`, "gi");
    case "display":
      return new RegExp(`\\[\\[(?<alias>${aliases})(?:\\s+(?<payload>.+?))?]](?!])`, "gi");
    case "roll":
      return new RegExp(`\\[\\[\\/(?<alias>${aliases})(?:\\s+(?<payload>.+?))?]](?!])${label}`, "gi");
    default:
      throw new Error(`Unknown pattern type: ${format.type}`);
  }
}

/**
 * Interpret a JSON term.
 * @param {string} term
 * @returns {Teriock.System.Serializable}
 */
export function interpretTerm(term) {
  let value;
  try {
    value = JSON.parse(term);
  } catch {
    value = term || "";
  }
  return value;
}

/**
 * Parses a string into positional arguments and a configuration object.
 * @param {string} payload - The raw argument string to parse.
 * @param {object} [options]
 * @param {boolean} [options.hasConfig]
 * @param {boolean} [options.hasMultipleArguments]
 * @returns {Teriock.Enrichment.Input}
 */
export function parsePayload(payload, options = {}) {
  const args = [];
  const config = {};
  const processTerm = (term) => {
    if (options.hasConfig && term.includes("=")) {
      const terms = term.split("=");
      const key = terms[0];
      const remaining = terms.slice(1).join("=");
      config[key] = interpretTerm(remaining);
    } else {
      args.push(term);
    }
  };
  if (!options.hasMultipleArguments) {
    if (payload) { processTerm(payload.trim()); }
  } else {
    const regex = /([^\s"']+)|"([^"]*)"|'([^']*)'/g;
    let match;
    while ((match = regex.exec(payload)) !== null) {
      const term = match[1] || match[2] || match[3];
      processTerm(term);
    }
  }
  return { arguments: args, config };
}

/**
 * Parse some regex match array.
 * @param {Teriock.Enrichment.Format} format
 * @param {RegExpMatchArray} match
 * @returns {Teriock.Enrichment.Parsed}
 */
function fullParse(format, match) {
  const groups = match.groups;
  const input = parsePayload(groups.payload, {
    hasConfig: format.hasConfig,
    hasMultipleArguments: format.hasMultipleArguments,
  });
  return { ...input, alias: groups.alias, label: groups.label };
}

/**
 * Build a text editor enricher config from a Teriock enricher config.
 * @param {Teriock.Enrichment.EnricherConfig} config
 * @returns {TextEditorEnricherConfig}
 */
function buildEnricherConfig(config) {
  return {
    id: config.id,
    onRender: config.onRender,
    pattern: buildPattern(config.format),
    replaceParent: config.replaceParent,
    enricher: async (match, options) => {
      const inputs = fullParse(config.format, match);
      return config.process(inputs, options);
    },
  };
}

/**
 * Register an enricher from a Teriock enricher config.
 * @param {Teriock.Enrichment.EnricherConfig} config
 */
export function registerEnricher(config) {
  const enricherConfig = buildEnricherConfig(config);
  CONFIG.TextEditor.enrichers.push(enricherConfig);
}
