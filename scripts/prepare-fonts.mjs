import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const windowsFonts=process.platform==='win32'?path.join(process.env.WINDIR||'C:/Windows','Fonts'):'';
const sources=[process.env.FRAMEFIELDS_DISPLAY_FONT||(windowsFonts&&path.join(windowsFonts,'arialbd.ttf')),process.env.FRAMEFIELDS_CHINESE_FONT||(windowsFonts&&path.join(windowsFonts,'HarmonyOS_Sans_SC_Bold.ttf'))];
// The SDK's Windows browser preview resolves the /assets/fonts fallback route.
const output=path.join(root,'assets','fonts');
await fs.mkdir(output,{recursive:true});
for(const [i,name]of ['Display.ttf','Chinese.ttf'].entries()){
 const source=sources[i];
 if(!source)throw new Error('Set FRAMEFIELDS_DISPLAY_FONT and FRAMEFIELDS_CHINESE_FONT to legally installed fonts; see README.');
 try{await fs.access(source);}catch{throw new Error('Font not found. Set FRAMEFIELDS_DISPLAY_FONT and FRAMEFIELDS_CHINESE_FONT; see README.');}
 await fs.copyFile(source,path.join(output,name));
}
console.log('Prepared two fonts for local use only in ignored assets/fonts.');
