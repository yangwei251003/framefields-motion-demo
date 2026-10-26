import http from 'node:http';import fs from'node:fs';import path from'node:path';import{fileURLToPath}from'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../site');
const mime={'.html':'text/html; charset=utf-8','.mp4':'video/mp4','.png':'image/png','.svg':'image/svg+xml','.css':'text/css'};
const server=http.createServer((req,res)=>{
 try{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
  const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/+/, '')||'index.html';
  const p=path.resolve(root,relative);
  if(p!==root&&!p.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  if(!fs.existsSync(p)||!fs.statSync(p).isFile()){res.writeHead(404).end();return;}
  const size=fs.statSync(p).size;let start=0,end=size-1,status=200;
  const headers={'content-type':mime[path.extname(p)]||'application/octet-stream','accept-ranges':'bytes'};
  if(req.headers.range){
   const match=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range);
   if(!match){res.writeHead(416,{'content-range':`bytes */${size}`}).end();return;}
   start=Number(match[1]);end=match[2]?Math.min(Number(match[2]),size-1):size-1;
   if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=size){res.writeHead(416,{'content-range':`bytes */${size}`}).end();return;}
   status=206;headers['content-range']=`bytes ${start}-${end}/${size}`;
  }
  headers['content-length']=end-start+1;res.writeHead(status,headers);
  if(req.method==='HEAD')res.end();else fs.createReadStream(p,{start,end}).pipe(res);
 }catch{if(!res.headersSent)res.writeHead(400);res.end();}
});
server.listen(0,'127.0.0.1',()=>console.log(`Open http://127.0.0.1:${server.address().port}/ — Ctrl+C to stop`));
