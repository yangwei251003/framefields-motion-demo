import path from 'node:path';
import {Composition,Layer} from 'framefields';
import {ROOT,W,H,FPS,FRAMES} from './theme.js';
// Decode the finished MP4, rather than re-rendering the authored scene.
const dir=path.join(ROOT,'output/neon');
const comp=new Composition({width:W,height:H,fps:FPS,durationMs:FRAMES/FPS*1000});
comp.add(Layer.video(path.join(dir,'beyond-framefields.mp4'),{width:W,height:H,durationFrames:FRAMES}));
await comp.renderFrameGrid({frames:[80,171,240,332,410,530],columns:3,cellWidth:640,outputPath:path.join(dir,'encoded-review.png')});
console.log('Decoded finished MP4 frames into encoded-review.png');
process.exit(0);
