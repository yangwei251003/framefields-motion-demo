import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FontManager } from 'framefields';
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const W = 1280, H = 720, FPS = 30, FRAMES = 300;
export const C = { paper:'#F3EFE6', ink:'#191A18', orange:'#FF5A24', grey:'#BEBBB3' };
export const FONT = 'Display', CN = 'Chinese';
// Font binaries remain external; never redistribute fonts copied from a computer.
const browser = !(typeof process !== 'undefined' && process.versions?.node);
export const fontFiles = browser ? [] : ['Display.ttf','Chinese.ttf'].map(f=>path.join(ROOT,'assets/fonts',f));
export async function registerFonts() {
  // 2.4.2's Windows preview stat shim cannot resolve /C:/... paths.
  // Its documented Uint8Array overload avoids that file-path lookup.
  const sources = browser ? await Promise.all(['Display.ttf','Chinese.ttf'].map(async name=>{
    const response=await fetch('/assets/fonts/'+name);
    if(!response.ok)throw new Error('Local preview font unavailable; run the font preparation command.');
    return new Uint8Array(await response.arrayBuffer());
  })) : fontFiles;
  await FontManager.register({family:FONT,source:sources[0]});
  await FontManager.register({family:CN,source:sources[1]});
}
