import { cat } from "./cat";
import { robot } from "./robot";
import type { VectorCharacter } from "./types";

export type { VectorCharacter } from "./types";

/** Built-in vector characters (original art, no external assets). */
export const VECTOR_CHARACTERS: VectorCharacter[] = [cat, robot];

export function getVectorCharacter(id: string): VectorCharacter | undefined {
  return VECTOR_CHARACTERS.find((c) => c.id === id);
}
