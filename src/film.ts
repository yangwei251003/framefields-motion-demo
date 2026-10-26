import path from 'node:path';
import { Composition, Layer, LayerAnimation as A } from 'framefields';
import { ROOT,W,H,FPS,FRAMES,C,FONT,CN,fontFiles,registerFonts } from './theme.js';

const pos = {position:'absolute' as const};
function text(s:string,x:number,y:number,size:number,color:string,width:number=1100,cn=false) {
  return Layer.text(s,{...pos,x,y,width,height:size*1.4,fontSize:size,fontFamily:cn?CN:FONT,fontWeight:700,fill:color});
}
function box(x:number,y:number,w:number,h:number,color:string,r=0) {
  return Layer.box({...pos,x,y,width:w,height:h,background:color,borderRadius:r});
}
function dot(x:number,y:number,d:number,color:string) {
  return Layer.shape('circle',{...pos,x,y,width:d,height:d,fillColor:color});
}
const rise=(y:number,delay=0)=>A.create().fadeIn(delay,delay+10).fromTo('y',y+60,y,{start:delay,end:delay+22,ease:'expo.out'});
function scene(id:string,start:number,duration:number,bg:string,children:(ReturnType<typeof box>|ReturnType<typeof text>|ReturnType<typeof dot>)[]) {
  return Layer.box({id,...pos,x:0,y:0,width:W,height:H,startFrame:start,durationFrames:duration,background:bg,overflow:'hidden',children});
}

export async function buildFilm() {
  await registerFonts();
  const comp=new Composition({width:W,height:H,fps:FPS,durationMs:FRAMES/FPS*1000,backgroundColor:C.paper,fonts:fontFiles});

  const orbit=Layer.box({...pos,x:760,y:175,width:400,height:400,children:[
    dot(45,45,310,C.orange).animate(A.create().keys('scale',[[0,0.05],[24,1,'back.out(1.5)'],[60,1],[89,1.12,'sine.inOut']])),
    dot(155,155,90,C.paper).animate(A.create().fromTo('scale',0,1,{start:16,end:35,ease:'back.out(1.7)'})),
    dot(0,170,60,C.ink),dot(340,170,60,C.ink),dot(180,0,40,C.ink),
  ]}).animate(A.create().fromTo('rotation',-70,65,{start:0,end:89,ease:'power1.inOut'}));
  comp.add(scene('01-idea',0,90,C.paper,[
    text('FRAMEFIELDS / MOTION STUDY',64,38,18,C.ink),text('01',1160,38,18,C.ink,70),
    box(64,88,1152,2,C.ink),
    text('IDEAS',56,220,160,C.ink,720).animate(rise(220,2)),
    text('从一个灵感开始',67,426,30,C.ink,650,true).animate(rise(426,12)),
    text('A DOT. A SPARK. A POSSIBILITY.',67,494,17,C.ink,650).animate(A.create().fadeIn(25,42)),
    orbit,
    box(64,638,1152,2,C.ink),text('DESIGNED IN CODE',64,659,15,C.ink),text('10 SEC / 30 FPS',1035,659,15,C.ink,200),
  ]));

  const tiles=[];
  for(let i=0;i<9;i++) {
    const x=780+(i%3)*130,y=172+Math.floor(i/3)*130,d=i*2;
    const tile=i%2===0?dot(x,y,110,i%3===0?C.orange:C.paper):box(x,y,110,110,C.orange,15);
    tile.animate(A.create().keys('scale',[[0,0],[d+3,0],[d+20,1,'back.out(1.8)'],[50,0.78,'sine.inOut'],[70,1,'back.out(1.6)'],[89,0.9]])
      .fromTo('rotation',-50,90,{start:0,end:89,ease:'power1.inOut'}));
    tiles.push(tile);
  }
  comp.add(scene('02-motion',90,90,C.ink,[
    text('FRAMEFIELDS / MOTION STUDY',64,38,18,C.paper),text('02',1160,38,18,C.paper,70),
    box(64,88,1152,2,C.grey),
    text('FIND',58,165,138,C.paper,710).animate(rise(165,1)),
    text('A RHYTHM.',58,310,99,C.orange,720).animate(rise(310,8)),
    text('让形状，跟上节奏',67,477,29,C.paper,650,true).animate(rise(477,15)),
    ...tiles,
    box(64,638,1152,2,C.grey),text('SHAPE / EASING / PLAY',64,659,15,C.paper),
  ]));

  const rays=[];
  for(let i=0;i<12;i++) rays.push(box(188,12,24,376,C.ink,12).animate(A.create().fromTo('rotation',i*15-70,i*15,{start:0,end:40,ease:'expo.out'})));
  const sun=Layer.box({...pos,x:800,y:170,width:400,height:400,children:rays})
    .animate(A.create().fromTo('scale',0.2,1,{start:0,end:35,ease:'back.out(1.5)'}).fromTo('rotation',0,90,{start:0,end:119,ease:'linear'}));
  comp.add(scene('03-create',180,120,C.orange,[
    text('FRAMEFIELDS / MOTION STUDY',64,38,18,C.ink),text('03',1160,38,18,C.ink,70),box(64,88,1152,2,C.ink),
    sun,
    text('MAKE IT',56,163,126,C.ink,760).animate(rise(163,2)),
    text('MOVE.',52,290,166,C.ink,780).animate(rise(290,10)),
    text('把灵感，变成动效。',65,511,30,C.ink,760,true).animate(rise(511,22)),
    box(64,638,1152,2,C.ink),text('MADE WITH FRAMEFIELDS',64,659,15,C.ink),text('KEEP CREATING',1040,659,15,C.ink,200),
  ]));
  // Persistent playhead ties the three hard cuts together.
  comp.add(box(0,710,W,10,C.ink).animate(A.create().fromTo('scaleX',0.001,1,{start:0,end:299,ease:'linear'})));
  comp.addAudio(Layer.audio(path.join(ROOT,'assets/audio/score.wav'),{durationFrames:FRAMES,volume:0.8}));
  return comp;
}
