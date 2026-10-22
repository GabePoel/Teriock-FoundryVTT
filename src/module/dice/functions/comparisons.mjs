import { objectMap } from "../../utils/_module.mjs";

const comparisons = objectMap(TERIOCK.CONFIG.math.comparisons, (c) => c.fn);

export default comparisons;
