import express from 'express';
import Database from 'better-sqlite3';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const app=express();
app.use(helmet({contentSecurityPolicy:false,frameguard:false}));
// Set EMBED_ORIGIN to your club website origin, e.g. https://club.example.ch
app.use((req,res,next)=>{const origin=process.env.EMBED_ORIGIN;if(origin){res.setHeader('Content-Security-Policy',`frame-ancestors 'self' ${origin}`);}else{res.setHeader('Content-Security-Policy',"frame-ancestors 'self'");}next();});
app.use(express.json({limit:'10kb'}));
const root=path.dirname(fileURLToPath(import.meta.url));
const db=new Database(process.env.DB_PATH || path.join(root,'registrations.sqlite'));
db.pragma('journal_mode = WAL');
db.exec(`CREATE TABLE IF NOT EXISTS registrations (id INTEGER PRIMARY KEY, first_name TEXT NOT NULL, last_name TEXT NOT NULL, email TEXT NOT NULL UNIQUE COLLATE NOCASE, room_id TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);`);
const rooms=[{id:'double',name:'Doppelzimmer',capacity:2,price:187},{id:'four1',name:'Viererzimmer 1',capacity:4,price:167},{id:'four2',name:'Viererzimmer 2',capacity:4,price:167},{id:'four3',name:'Viererzimmer 3',capacity:4,price:167},{id:'four4',name:'Viererzimmer 4',capacity:4,price:167},{id:'five1',name:'Fünferzimmer 1',capacity:5,price:167},{id:'five2',name:'Fünferzimmer 2 (Stätzerhorn)',capacity:5,price:167},{id:'lenzerhorn',name:'Lenzerhorn',capacity:4,price:167},{id:'group-left',name:'Gruppenzimmer links',capacity:14,price:147},{id:'group-right',name:'Gruppenzimmer rechts',capacity:14,price:147}];
const deadline=Date.parse('2026-11-24T23:59:59+01:00');
function status(){const people=db.prepare('SELECT first_name,last_name,room_id FROM registrations ORDER BY created_at,id').all();return {open:Date.now()<=deadline && people.length<60,total:people.length,rooms:rooms.map(r=>({...r,members:people.filter(p=>p.room_id===r.id).map(p=>`${p.first_name} ${p.last_name.slice(0,1)}.`),taken:people.filter(p=>p.room_id===r.id).length}))};}
app.get('/api/rooms',(req,res)=>res.set('Cache-Control','no-store').json(status()));
const register=db.transaction(({firstName,lastName,email,roomId})=>{const count=db.prepare('SELECT COUNT(*) AS n FROM registrations').get().n;const room=rooms.find(r=>r.id===roomId);if(!room)throw Object.assign(new Error('Ungültiges Zimmer'),{status:400});if(count>=60)throw Object.assign(new Error('Alle Plätze sind vergeben.'),{status:409});const occupied=db.prepare('SELECT COUNT(*) AS n FROM registrations WHERE room_id=?').get(roomId).n;if(occupied>=room.capacity)throw Object.assign(new Error('Dieses Zimmer ist inzwischen voll.'),{status:409});db.prepare('INSERT INTO registrations(first_name,last_name,email,room_id) VALUES(?,?,?,?)').run(firstName,lastName,email,roomId);return room;});
app.post('/api/register',rateLimit({windowMs:15*60*1000,limit:12,standardHeaders:'draft-7',legacyHeaders:false}),(req,res)=>{try{if(Date.now()>deadline)return res.status(403).json({error:'Die Anmeldefrist ist abgelaufen.'});const {firstName,lastName,email,roomId,attending,consent}=req.body||{};if(attending!==true||consent!==true)return res.status(400).json({error:'Teilnahme und verbindliche Zustimmung sind erforderlich.'});if(![firstName,lastName,email,roomId].every(v=>typeof v==='string'))return res.status(400).json({error:'Bitte alle Felder ausfüllen.'});const clean={firstName:firstName.trim(),lastName:lastName.trim(),email:email.trim().toLowerCase(),roomId};if(!clean.firstName||!clean.lastName||clean.firstName.length>70||clean.lastName.length>70||!/^\S+@\S+\.\S+$/.test(clean.email)||clean.email.length>254)return res.status(400).json({error:'Bitte gültige Angaben eingeben.'});const room=register(clean);return res.status(201).json({message:'Deine verbindliche Anmeldung wurde gespeichert.',room:room.name,price:room.price});}catch(e){if(e.code==='SQLITE_CONSTRAINT_UNIQUE')return res.status(409).json({error:'Diese E-Mail-Adresse ist bereits angemeldet.'});return res.status(e.status||500).json({error:e.status?e.message:'Speichern fehlgeschlagen.'});}});
app.use(express.static(path.join(root,'public')));
app.listen(Number(process.env.PORT||3000),()=>console.log('Ski Weekend app running'));
