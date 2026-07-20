import { cat } from "./cat";
import { slime } from "./slime";
import { robot } from "./robot";
import type { VectorCharacter } from "./types";

export type { VectorCharacter } from "./types";

/** Built-in vector characters (original art, no external assets). */
export const VECTOR_CHARACTERS: VectorCharacter[] = [cat, slime, robot];

export function getVectorCharacter(id: string): VectorCharacter | undefined {
  return VECTOR_CHARACTERS.find((c) => c.id === id);
}
