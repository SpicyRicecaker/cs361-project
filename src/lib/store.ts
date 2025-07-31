import { writable } from 'svelte/store';
export const game: Game = writable(null);
export const noAction = writable(false);

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

