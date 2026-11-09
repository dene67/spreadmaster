import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import paste from './pokepaste.cjs';
const root=resolve(process.argv.includes('--dist')?'dist':'.');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'};
http.createServer(async(req,res)=>{try{const url=new URL(req.url,'http://localhost');if(url.pathname.startsWith('/api/pokepaste/')){res.setHeader('Content-Type','application/json');res.setHeader('Cache-Control','no-store');if(req.method!=='GET'){res.writeHead(405);return res.end(JSON.stringify({error:'GET required'}));}try{const data=await paste.readPaste(url.pathname.slice('/api/pokepaste/'.length));res.writeHead(200);return res.end(JSON.stringify(data));}catch(err){res.writeHead(400);return res.end(JSON.stringify({error:err.message}));}}const path=resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!path.startsWith(root+sep)){res.writeHead(403);return res.end();}const data=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);}catch{res.writeHead(404);res.end('Not found');}}).listen(Number(process.env.PORT||5173),'127.0.0.1',()=>console.log('SPREADMASTER: http://127.0.0.1:'+(process.env.PORT||5173)));

