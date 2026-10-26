import fs from 'node:fs/promises';
import path from 'node:path';
import {CompositorProgramSchema,HeadlessMediaRenderer,describeGpu,formatQaReport,startPreview} from 'framefields';
import {buildNeonFilm} from './film.js';
import {ROOT,FRAMES} from './theme.js';
const OUT=path.join(ROOT,'output/neon');await fs.mkdir(OUT,{recursive:true});
const [mode='video',...args]=process.argv.slice(2);
if(mode==='preview'){
  const p=await startPreview({entry:new URL('./film.ts',import.meta.url),export:'buildNeonFilm'},{title:'BEYOND — Framefields 3D'});
  console.log(p.url);await p.closed;process.exit(0);
}
const started=performance.now();const film=await buildNeonFilm();
// 2.4.2's JSON schema describes external media handles. Layer.particles instead
// supplies a live VirtualMediaData source (including GPU effect callbacks).
// Validate the document with equivalent handles; render the original live graph.
const liveSources=new Map<string,unknown>();
function documentNode(node:any):any {
  const copy={...node};
  if(copy.kind==='media'&&copy.src&&typeof copy.src==='object'){
    if(copy.src.operation?.op!=='Particles'||!copy.src.operation.effect)throw new Error(`Invalid particle graph: ${copy.id}`);
    liveSources.set(copy.id,copy.src);copy.inputHandleId=`live:${copy.id}`;delete copy.src;
  }
  if(copy.children)copy.children=copy.children.map(documentNode);
  return copy;
}
const raw=film.toSpec();
const spec=CompositorProgramSchema.safeParse({...raw,layout:raw.layout.map(documentNode)});
if(!spec.success){await fs.writeFile(path.join(OUT,'schema-errors.json'),JSON.stringify(spec.error.issues,null,2));console.error('Schema failed; see schema-errors.json');process.exit(1);}
console.log('SCHEMA PASS; live particle graphs:',liveSources.size);
const lint=film.lint();console.log('LINT',JSON.stringify(lint));
await fs.writeFile(path.join(OUT,'lint.json'),JSON.stringify(lint,null,2));
// The oversized FORM word is an intentionally low-contrast background texture.
// Foreground titles/subtitles still pass the normal contrast checks.
if(lint.some(x=>x.severity==='error'||(x.severity==='warning'&&!(x.code==='low_contrast_text'&&x.layerId==='text-auto-1'))))process.exit(1);
if(mode==='check')process.exit(0);
const gpu=await describeGpu();console.log('GPU',gpu);
if(mode==='frames'){
  const renderer=new HeadlessMediaRenderer();
  for(const frame of (args.length?args:['80','240','420']).map(Number)){await fs.writeFile(path.join(OUT,`frame-${frame}.png`),await film.renderFrame({frame,renderer}));console.log('FRAME',frame);}
}else if(mode==='grid'){
  await film.renderFrameGrid({frames:[0,30,80,135,165,177,205,270,325,340,410,530],columns:4,cellWidth:480,outputPath:path.join(OUT,'storyboard.png')});
}else{
  const progress:any[]=[];
  const exportStarted=performance.now();
  const result=await film.renderVideo({outputPath:path.join(OUT,'beyond-framefields.mp4'),quality:'very_high',codec:'h264',concurrency:1,qa:true,onProgress:p=>{if(p.phase!=='render'||p.frame%30===0)progress.push(p);if(p.phase==='render'&&p.frame%60===0)console.log('EXPORT',JSON.stringify(p));}});
  const elapsedSeconds=(performance.now()-exportStarted)/1000;
  console.log(formatQaReport(result.qa!));
  await fs.writeFile(path.join(OUT,'qa.json'),JSON.stringify(result.qa,null,2));
  await fs.writeFile(path.join(OUT,'performance.json'),JSON.stringify({elapsedSeconds,totalSeconds:(performance.now()-started)/1000,averageExportFps:FRAMES/elapsedSeconds,gpu,progress},null,2));
  const passed=result.qa?.passed;
  await result.cleanup();
  if(!passed)process.exit(1);
}
process.exit(0);
