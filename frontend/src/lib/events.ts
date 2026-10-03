import type { SyntheticEvent } from "react";

// Keeps a click inside a dialog from reaching the backdrop, which closes it.
export const stop = (e: SyntheticEvent) => e.stopPropagation();
