import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const PORT=Number(process.env.PORT||3000);
const KEY=process.env.HYPIXEL_API_KEY||'';
const TTL=5*60*1000;
let cache=null, at=0, inflight=null;
const json=(res,status,obj)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'public, max-age=30','access-control-allow-origin':'*'});res.end(JSON.stringify(obj));};
function normalize(raw){
 const collections=raw?.leaderboards||{};
 const entries=Object.entries(collections).filter(([k])=>/MURDER|MYSTERY/i.test(k));
 const boards=[];
 for(const [game,arr] of entries){if(!Array.isArray(arr))continue;
  for(const [i,b] of arr.entries()){
   const leaders=Array.isArray(b.leaders)?b.leaders:[];
   boards.push({id:`${game}-${i}`,game,title:String(b.title||b.path||`Leaderboard ${i+1}`),path:String(b.path||''),prefix:String(b.prefix||''),count:Number(b.count||leaders.length),leaders:leaders.map((p,i)=> typeof p==='string'?{uuid:p,rank:i+1}: typeof p==='object'&&p?{uuid:String(p.uuid||p.player||p.name||''),name:p.name||null,value:p.value??p.score??null,rank:i+1}:null).filter(Boolean)});
  }
 }
 return boards;
}
async function getBoards(){if(cache&&Date.now()-at<TTL)return cache;if(inflight)return inflight;
 inflight=(async()=>{const headers={'user-agent':'MM-Leaderboards/1.0'};if(KEY)headers['API-Key']=KEY;
 const response=await fetch('https://api.hypixel.net/v2/leaderboards',{headers,signal:AbortSignal.timeout(12000)});
 const data=await response.json().catch(()=>({}));
 if(!response.ok||data.success===false)throw new Error(`Hypixel API ${response.status}: ${data.cause||'Request failed'}`);
 const value={boards:normalize(data),updatedAt:new Date().toISOString(),totalBoardsAllGames:Object.keys(data.leaderboards||{}).length};cache=value;at=Date.now();return value;
 })().finally(()=>{inflight=null});return inflight;
}
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
http.createServer(async(req,res)=>{try{
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(pathname==='/api/leaderboards'){
  try{const result=await getBoards();json(res,200,{success:true,...result});}catch(e){if(cache)json(res,200,{success:true,...cache,stale:true,warning:e.message});else json(res,503,{success:false,error:e.message,help:KEY?'Verify the Hypixel API status and permissions.':'Set HYPIXEL_API_KEY on the server if the endpoint requires authentication.'});}return;
 }
 if(pathname==='/api/status'){json(res,200,{success:true,hasKey:!!KEY,cacheSeconds:TTL/1000,hasCache:!!cache});return;}
 const name=pathname==='/'?'index.html':decodeURIComponent(pathname).slice(1);
 const target=path.resolve(dir,name);if(!target.startsWith(dir+path.sep)&&target!==path.join(dir,'index.html')){json(res,403,{error:'Forbidden'});return;}
 const body=await fs.readFile(target);res.writeHead(200,{'content-type':types[path.extname(target)]||'application/octet-stream'});res.end(body);
 }catch(e){json(res,404,{error:'Not found'});}}).listen(PORT,()=>console.log(`Murder Mystery Leaderboards: http://localhost:${PORT}`));
