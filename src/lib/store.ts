import { writable } from 'svelte/store';
export const game: Game = writable(null);
export const gameLoaded = writable(false)
export const scene = writable('none')

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

