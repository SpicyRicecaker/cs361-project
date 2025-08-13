import { writable } from 'svelte/store';
export const game: Game = writable(null);
export const gameLoaded = writable(false)
export const scene = writable('none')
export const enabledRaindrops = writable(0)
export const wind_speed = writable(0)
export const uv_index = writable(0)

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

