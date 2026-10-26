import fs from 'node:fs/promises';
import path from 'node:path';
import {encodeStereoWav,mixSfxInto,renderSfx} from 'framefields';
import {ROOT,FPS,FRAMES} from './theme.js';
const out=path.join(ROOT,'assets/neon'); await fs.mkdir(out,{recursive:true});
// Torus geometry is generated here; Framefields loads and renders the actual 3D mesh.
const n=96,m=20,R=330,r=19,lines=['o OrbitalRing'];
for(let i=0;i<n;i++)for(let j=0;j<m;j++){
  const u=i/n*2*Math.PI,v=j/m*2*Math.PI;
  lines.push(`v ${(R+r*Math.cos(v))*Math.cos(u)} ${(R+r*Math.cos(v))*Math.sin(u)} ${r*Math.sin(v)}`);
}
for(let i=0;i<n;i++)for(let j=0;j<m;j++){
  const u=i/n*2*Math.PI,v=j/m*2*Math.PI;
  lines.push(`vn ${Math.cos(v)*Math.cos(u)} ${Math.cos(v)*Math.sin(u)} ${Math.sin(v)}`);
}
for(let i=0;i<n;i++)for(let j=0;j<m;j++){
  const a=i*m+j+1,b=((i+1)%n)*m+j+1,c=((i+1)%n)*m+(j+1)%m+1,d=i*m+(j+1)%m+1;
  lines.push(`f ${a}//${a} ${b}//${b} ${c}//${c}`,`f ${a}//${a} ${c}//${c} ${d}//${d}`);
}
await fs.writeFile(path.join(out,'ring.obj'),lines.join('\n'));
const rate=48000,seconds=FRAMES/FPS;
const bed:[Float32Array,Float32Array]=[new Float32Array(rate*seconds),new Float32Array(rate*seconds)];
const melody=[164.81,246.94,329.63,369.99,493.88,369.99,329.63,246.94];
let seed=92345;
for(let i=0;i<bed[0].length;i++){
  const t=i/rate,beat=t%0.45,s=t%0.225,step=Math.floor(t/0.225);
  seed=(1664525*seed+1013904223)>>>0;const noise=seed/4294967296*2-1;
  const kick=Math.sin(2*Math.PI*(48*beat+3*(1-Math.exp(-beat*32))))*Math.exp(-beat*23)*0.38;
  const snare=(Math.floor(t/0.45)%2===1?1:0)*noise*Math.exp(-beat*38)*0.15;
  const hat=noise*Math.exp(-s*110)*0.055;
  const f=melody[step%8],env=Math.exp(-s*15);
  const arp=(Math.sin(2*Math.PI*f*s)+0.24*Math.sin(4*Math.PI*f*s))*env*0.12;
  const bass=Math.sin(2*Math.PI*82.405*t)*0.10*(1-Math.exp(-beat*20));
  const pad=(Math.sin(2*Math.PI*164.81*t)+Math.sin(2*Math.PI*246.94*t))*0.025;
  const fade=Math.min(t/0.05,1,(seconds-t)/0.65);
  bed[0][i]=(kick+snare+hat+arp+bass+pad)*fade;
  bed[1][i]=(kick+snare+hat-arp*0.17+arp+bass+pad)*fade;
}
const ctx={sampleRate:rate,secondsPerBar:1.8};
mixSfxInto(bed,[
  renderSfx({type:'riser',atBar:2.45,volume:0.23},{...ctx,seed:8}),
  renderSfx({type:'impact',atBar:3,volume:0.32},{...ctx,seed:7}),
  renderSfx({type:'whoosh',atBar:5.7,volume:0.25},{...ctx,seed:9}),
  renderSfx({type:'impact',atBar:6,volume:0.32},{...ctx,seed:4}),
]);
for(let c=0;c<2;c++)for(let i=0;i<bed[c].length;i++)bed[c][i]=Math.tanh(bed[c][i]*2.2)*0.8;
await fs.writeFile(path.join(out,'score.wav'),encodeStereoWav(bed,{sampleRate:rate}));
console.log('Neon mesh and original soundtrack ready'); process.exit(0);
