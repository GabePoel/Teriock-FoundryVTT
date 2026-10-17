import mathConfig from "../../constants/config/math-config.mjs";
import { objectMap } from "../../utils/_module.mjs";

const comparisons = objectMap(mathConfig.comparisons, (c) => c.fn);

export default comparisons;
