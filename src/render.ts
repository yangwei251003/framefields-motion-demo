import fs from 'node:fs/promises';
import path from 'node:path';
import { HeadlessMediaRenderer,CompositorProgramSchema,describeGpu,startPreview,formatQaReport } from 'framefields';
import { buildFilm } from './film.js';
import { ROOT } from './theme.js';
const [mode='video',...args]=process.argv.slice(2);
const OUT=path.join(ROOT,'output');
await fs.mkdir(OUT,{recursive:true});
if(mode==='preview') {
  const session=await startPreview({entry:new URL('./film.ts',import.meta.url),export:'buildFilm'},{title:'MAKE IT MOVE — Framefields'});
  console.log(session.url); await session.closed; process.exit(0);
}
const film=await buildFilm();
const parsed=CompositorProgramSchema.safeParse(film.toSpec());
if(!parsed.success){console.error(JSON.stringify(parsed.error.format(),null,2));process.exit(1);}
const lint=film.lint(); console.log('Lint:',JSON.stringify(lint));
await fs.writeFile(path.join(OUT,'lint.json'),JSON.stringify(lint,null,2));
if(lint.some(d=>d.severity==='error'||d.severity==='warning'))process.exit(1);
if(mode==='check')process.exit(0);
console.log('GPU:',await describeGpu());
if(mode==='frames') {
  const renderer=new HeadlessMediaRenderer();
  for(const frame of (args.length?args:['36','130','230']).map(Number)) await fs.writeFile(path.join(OUT,`frame-${frame}.png`),await film.renderFrame({frame,renderer}));
} else if(mode==='grid') {
  await film.renderFrameGrid({frames:[0,12,36,80,90,102,130,174,180,198,230,299],columns:4,cellWidth:384,showLabels:true,outputPath:path.join(OUT,'storyboard.png')});
} else {
  const result=await film.renderVideo({outputPath:path.join(OUT,'make-it-move.mp4'),quality:'high',codec:'h264',concurrency:2,qa:true});
  console.log(formatQaReport(result.qa!));
  await fs.writeFile(path.join(OUT,'qa.json'),JSON.stringify(result.qa,null,2));
  const passed=result.qa?.passed;
  await result.cleanup();
  if(!passed)process.exit(1);
}
process.exit(0);
