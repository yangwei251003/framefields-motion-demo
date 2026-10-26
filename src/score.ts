import fs from 'node:fs/promises';
import path from 'node:path';
import {encodeStereoWav,mixSfxInto,renderSfx,softLimit} from 'framefields';
import {ROOT} from './theme.js';
const rate=48000,seconds=10;
const bed:[Float32Array,Float32Array]=[new Float32Array(rate*seconds),new Float32Array(rate*seconds)];
// An original, deterministic miniature synth score: soft plucks and a beat.
const notes=[220,329.63,440,554.37,440,329.63,277.18,329.63];
for(let i=0;i<rate*seconds;i++) {
  const t=i/rate,step=Math.floor(t/0.25),u=t%0.25,beat=t%0.5;
  const f=notes[step%notes.length];
  const pluck=(Math.sin(2*Math.PI*f*u)+0.22*Math.sin(4*Math.PI*f*u))*Math.exp(-u*17)*0.12;
  const kick=Math.sin(2*Math.PI*(55*beat+3*(1-Math.exp(-beat*35))))*Math.exp(-beat*24)*0.22;
  const pad=0.025*(Math.sin(2*Math.PI*110*t)+Math.sin(2*Math.PI*164.815*t));
  const fade=Math.min(t/0.04,1,(seconds-t)/0.5);
  bed[0][i]=(pluck+kick+pad)*Math.max(0,fade);bed[1][i]=(pluck*0.9+kick+pad)*Math.max(0,fade);
}
const ctx={sampleRate:rate,secondsPerBar:2};
mixSfxInto(bed,[renderSfx({type:'whoosh',atBar:1.35,volume:0.20},{...ctx,seed:1}),renderSfx({type:'impact',atBar:1.5,volume:0.25},{...ctx,seed:2}),renderSfx({type:'whoosh',atBar:2.85,volume:0.20},{...ctx,seed:3}),renderSfx({type:'impact',atBar:3,volume:0.25},{...ctx,seed:4})]);
softLimit(bed);
await fs.writeFile(path.join(ROOT,'assets/audio/score.wav'),encodeStereoWav(bed,{sampleRate:rate}));
process.exit(0);
