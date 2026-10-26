import path from 'node:path';
import {Composition,Layer,Layer3D,LayerAnimation as A,CameraAnimation,Lighting,Transition,Vignette,type LayoutNode} from 'framefields';
import {ROOT,W,H,FPS,FRAMES,P,FONT,CN,fontFiles,registerFonts} from './theme.js';
const abs={position:'absolute' as const};
const label=(s:string,x:number,y:number,size:number,color=P.white,width=1600,cn=false)=>Layer.text(s,{...abs,x,y,width,height:size*1.5,fontFamily:cn?CN:FONT,fontSize:size,fontWeight:700,fill:color});
const bar=(x:number,y:number,w:number,h:number,color:string)=>Layer.box({...abs,x,y,width:w,height:h,background:color});
const enter=(y:number,d=0)=>A.create().fadeIn(d,d+15).fromTo('y',y+45,y,{start:d,end:d+30,ease:'expo.out'});
function ring(id:string,size:number,color:string,rx:number,ry:number,rz:number,end:number,z=0) {
  return Layer3D.obj(path.join(ROOT,'assets/neon/ring.obj'),{id,x:W/2,y:510,z,normalizeSize:size,center:true,color,metallic:0.85,roughness:0.17,rotateX:rx,rotateY:ry,rotateZ:rz})
    .animate(A.create().fromTo('rotateZ',rz,rz+100,{start:0,end,ease:'linear'}).fromTo('rotateY',ry,ry+50,{start:0,end,ease:'sine.inOut'}));
}
function camera(id:string,end:number,from:number,to:number,radius=1750) {
  return Layer.camera({id,x:960,y:480,z:-radius,targetX:960,targetY:500,targetZ:0})
    .animate(CameraAnimation.camera().orbit({azimuth:{from,to},elevation:{from:9,to:-4},radius:{from:radius,to:radius*0.88},start:0,end,ease:'sine.inOut'}));
}
function dust(id:string,color:string) {
  return Layer.particles({id,width:W,height:H,max:3000,seed:31,emitter:{shape:'rect',x:0,y:140,width:W,height:800,rate:280},lifetime:[3,6],speed:[10,40],spread:360,noise:{strength:60,scale:240,speed:0.25},drag:0.3,size:[3.5,0],color:[color,'#315672'],opacity:0.55,shape:'soft',blend:'add',prewarm:2});
}
function footer(n:string,title:string,subtitle:string,duration:number,color=P.cyan) {
  return [
    bar(80,884,80,4,color),label(n,80,825,22,color,300),
    label(title,80,907,60,P.white,1500).animate(enter(907,12)),
    label(subtitle,81,994,23,P.muted,1550,true).animate(enter(994,24)),
    label('FRAMEFIELDS / EXPERIMENT 02',80,48,18,P.muted,1400),
    label('REAL 3D · GPU PARTICLES',1450,48,17,P.muted,430),
    bar(80,85,1760,1,P.line),
    bar(80,1050,1760,2,color).animate(A.create().fromTo('scaleX',0.01,1,{start:0,end:duration-1,ease:'linear'})),
  ];
}
function assembly() {
  const nodes:LayoutNode[]=[
    label('FORM',60,240,410,'#1C2D46',1800),
    dust('assembly-dust',P.cyan),
    ...Lighting.studio({id:'assembly-rig',target:[960,500,0],rotation:25,intensity:1.2,exposure:0.2,shadows:true,bloom:{intensity:0.35,threshold:1.25,radius:8}}),
    camera('assembly-camera',179,-42,42,1600),
    ring('assembly-orbit',820,P.cyan,55,10,10,179),
  ];
  for(let a=0;a<3;a++)for(let b=0;b<3;b++)for(let c=0;c<3;c++) {
    const i=a*9+b*3+c,ang=i/27*Math.PI*2;
    const x=960+(a-1)*116,y=500+(b-1)*116,z=(c-1)*116;
    nodes.push(Layer3D.roundedBox({id:`cube-${i}`,x,y,z,width:99,height:99,depth:99,radius:14,segments:5,color:(a+b+c)%3===0?P.lime:'#DCEAFF',metallic:0.78,roughness:0.23})
      .animate(A.create()
        .keys('x',[[0,960+Math.cos(ang)*620],[48,x,'expo.out'],[118,x],[179,960+Math.cos(ang)*540,'power2.in']])
        .keys('y',[[0,500+Math.sin(ang)*380],[48,y,'expo.out'],[118,y],[179,500+Math.sin(ang)*400,'power2.in']])
        .keys('z',[[0,(i%5-2)*230],[48,z,'expo.out'],[118,z],[179,z*3,'power2.in']])
        .keys('rotateX',[[0,i*23],[48,0,'expo.out'],[118,0],[179,i*13,'power2.in']])
        .keys('rotateY',[[0,i*19],[48,0,'expo.out'],[118,0],[179,i*17,'power2.in']])));
  }
  nodes.push(...footer('01 / ASSEMBLY','ORDER FROM CHAOS','27 个金属立方体 · 镜头环绕 · 聚合与解构',180));
  return Layer.box({id:'assembly',...abs,x:0,y:0,width:W,height:H,background:'linear-gradient(130deg, #18253C, #0C1426)',overflow:'hidden',children:nodes});
}
function energy() {
  const nodes:LayoutNode[]=[
    label('ENERGY',75,290,330,'#302348',1800),
    ...Lighting.dramatic({id:'energy-rig',target:[960,500,0],intensity:1.1,exposure:0,rotation:65,shadows:false,bloom:{intensity:0.18,threshold:1.7,radius:6}}),
    camera('energy-camera',179,15,-20,1600),
    ring('energy-ring-a',840,P.pink,20,50,20,179),ring('energy-ring-b',650,P.cyan,65,-20,-30,179),ring('energy-ring-c',470,P.lime,-45,30,70,179),
    Layer3D.sphere({id:'core',x:960,y:500,z:0,radius:108,color:'#85D5E8',metallic:0.45,roughness:0.3,emissive:P.cyan,emissiveIntensity:0.65,segments:48})
      .animate(A.create().keys('scale',[[0,0.2],[28,1,'back.out(1.6)'],[65,0.78,'sine.inOut'],[100,1.22,'back.out(1.5)'],[150,1],[179,0.85]])),
    Layer.particles({id:'energy-burst',width:W,height:H,max:18000,seed:8,emitter:{shape:'ring',x:960,y:500,radius:225,rate:1500,radial:true,bursts:[{frame:28,count:4500},{frame:100,count:6000}]},lifetime:[1.2,3.0],speed:[120,620],spread:360,drag:0.7,noise:{strength:180,scale:230,speed:0.4},size:[5.5,0.4],fade:[0.02,0.5],shape:'spark',stretch:0.028,color:[P.white,P.cyan,P.pink,'#33204D'],blend:'add'}),
    Layer.particles({id:'ribbon',width:W,height:H,max:5500,seed:66,emitter:{shape:'point',x:f=>960+Math.cos(f/19)*540,y:f=>500+Math.sin(f/13)*280,rate:1800},lifetime:[0.5,1.0],speed:[5,35],drag:2,size:[6.0,0],fade:[0.01,0.75],shape:'soft',color:[P.lime,P.cyan],blend:'add'}),
    ...footer('02 / ENERGY','EVERY PARTICLE. ALIVE.','GPU 粒子爆发 · 发光核心 · 多重轨道与光迹',180,P.pink),
  ];
  return Layer.box({id:'energy',...abs,x:0,y:0,width:W,height:H,background:'radial-gradient(circle at 50% 44%, #2A2545, #13192C)',overflow:'hidden',children:nodes});
}
function beyond() {
  const nodes:LayoutNode[]=[
    dust('beyond-dust',P.lime),
    ...Lighting.studio({id:'beyond-rig',target:[960,500,0],rotation:-35,intensity:1.2,exposure:0.3,shadows:false,bloom:{intensity:0.35,threshold:1.4,radius:8}}),
    camera('beyond-camera',215,-22,12,1650),
    ring('beyond-orbit',1000,P.cyan,62,15,-20,215,420),
    Layer3D.text({id:'hero-type',text:'BEYOND',fontFamily:FONT,fontWeight:700,fontSize:250,extrusionDepth:72,fill:P.lime,bevelColor:'#527B35',metallic:0.45,roughness:0.25,x:960,y:500,z:-50,align:'center',verticalAlign:'middle',rotateX:-6})
      .animate(A.create().fromTo('rotateY',-35,0,{start:0,end:50,ease:'expo.out'}).fromTo('scale',0.55,1,{start:0,end:55,ease:'back.out(1.4)'})),
  ];
  for(let i=0;i<14;i++){
    const a=i/14*Math.PI*2;
    nodes.push(Layer3D.roundedBox({id:`satellite-${i}`,x:960+Math.cos(a)*650,y:500+Math.sin(a)*300,z:Math.sin(a)*180,width:42,height:42,depth:42,radius:7,color:i%2?P.pink:P.cyan,roughness:0.2,metallic:0.75})
      .animate(A.create().fromTo('rotateX',i*15,i*15+150,{start:0,end:215,ease:'linear'}).fromTo('rotateY',0,210,{start:0,end:215,ease:'linear'})));
  }
  nodes.push(...footer('03 / POSSIBILITY','MAKE SOMETHING IMPOSSIBLE.','代码成形，光影流动。下一段，由想象力决定。',216,P.lime));
  return Layer.box({id:'beyond',...abs,x:0,y:0,width:W,height:H,background:'linear-gradient(145deg, #14283B, #11192A)',overflow:'hidden',children:nodes});
}
export async function buildNeonFilm(){
  await registerFonts();
  const sequence=Layer.sequence([{scene:assembly(),duration:180},{scene:energy(),duration:180,transition:Transition.whip('left',18)},{scene:beyond(),duration:216,transition:Transition.iris(18)}],{width:W,height:H});
  if(sequence.totalFrames!==FRAMES)throw new Error('Timeline length mismatch');
  const comp=new Composition({width:W,height:H,fps:FPS,durationMs:FRAMES/FPS*1000,backgroundColor:P.bg,fonts:fontFiles});
  comp.add(sequence);
  comp.apply(new Vignette({strength:16,radius:1.3,softness:0.6}));
  comp.addAudio(Layer.audio(path.join(ROOT,'assets/neon/score.wav'),{durationFrames:FRAMES,volume:0.9}));
  return comp;
}
