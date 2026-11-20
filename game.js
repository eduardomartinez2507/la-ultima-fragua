/* La Última Fragua 2.0 — Alpha 3.9: Acero, esquiva y nuevas criaturas.
   Juego offline, sin dependencias externas. Geografía determinista por chunks.
   No altera ni el código ni los guardados de la versión 1.6 o Alpha 1. */
(()=>{'use strict';
const $=id=>document.getElementById(id),canvas=$('world'),ctx=canvas.getContext('2d',{alpha:false});
const CH=32,MAX=512,LAYERS=8,START={x:.5,y:.5};
const SAVE_KEY='la-ultima-fragua-2.0-alpha2-save',DB_NAME='fragua-2-alpha2',DB_STORE='saves';
const T={FLOOR:0,ROCK:1,SOFT:2,COPPER:3,COAL:4,IRON:5,CRYSTAL:6,MITHRIL:7,ADAMANTITE:8,ANCIENT:9,GOLD:10};
const NAMES=['Suelo excavado','Piedra','Tierra blanda','Cobre','Carbón','Hierro','Cristal','Mithril','Adamantita','Piedra ancestral','Oro'];
const HARD=[0,3,1,3,3,5,6,8,10,12,7];
const ORE=['','','tierra','cobre','carbon','hierro','cristal','mithril','adamantita','ancestral','oro'];
const LEVELS=[
 {name:'Tierras de Khaz’dûn',subtitle:'Refugio del Alba',color:'#454641',floor:'#45403b',accent:'#7e9a67',wall:'#575a53'},
 {name:'Minas Abandonadas',subtitle:'Galerías de Hierro',color:'#404452',floor:'#383945',accent:'#b78355',wall:'#525766'},
 {name:'Bosque de Hongos',subtitle:'Jardines de Esporas',color:'#34484b',floor:'#334340',accent:'#91d5ad',wall:'#465e62'},
 {name:'Ruinas del Reino',subtitle:'Piedras de los Ancestros',color:'#4b424c',floor:'#413940',accent:'#d1a17a',wall:'#625765'},
 {name:'Cavernas de Cristal',subtitle:'Galerías Azules',color:'#35495b',floor:'#334250',accent:'#78d9d9',wall:'#506779'},
 {name:'Profundidades Ardientes',subtitle:'Túneles de Ceniza',color:'#574039',floor:'#4a3636',accent:'#ea9564',wall:'#6b514a'},
 {name:'Abismo Olvidado',subtitle:'La Oscuridad Antigua',color:'#3b394f',floor:'#333342',accent:'#ae87d6',wall:'#4c4a61'},
 {name:'Corazón de la Montaña',subtitle:'La Última Fragua',color:'#56483b',floor:'#483d36',accent:'#f0bf78',wall:'#6c5b4e'}
];
const DEEP_STAIR={x:53.5,y:27.5},SHAFT={x:-44.5,y:31.5},SHAFT_UP={x:-44.5,y:29.5},SHAFT_DOWN={x:-44.5,y:34.5},ENTRY={x:.5,y:.5};
const UI={hudToggle:$('hud-toggle'),menu:$('menu'),hud:$('hud'),modal:$('modal'),toast:$('toast'),context:$('context-info'),ctxLabel:$('context-text'),ctxIcon:$('context-icon'),quest:$('quest-line'),region:$('location-name'),steps:$('step-meter'),resources:$('resource-line'),mapBtn:$('btn-map'),miniMap:$('mini-map'),miniLevel:$('mini-level'),actionBtn:$('btn-action'),interactBtn:$('btn-interact'),lampBtn:$('btn-lamp-toggle'),dodgeBtn:$('btn-dodge'),staminaFill:$('stamina-fill'),staminaLabel:$('stamina-label'),healthFill:$('health-fill'),healthLabel:$('health-label'),chargeMeter:$('sword-charge'),actLabel:$('action-label'),actGlyph:$('action-glyph'),joystick:$('joystick'),knob:$('joystick-knob')};
// Las novedades se almacenan fuera de la partida para no alterar su formato ni el progreso.
// Para cada futuro deploy: actualizar RELEASE_VERSION, añadir la entrada nueva al inicio
// de RELEASE_HISTORY, y cambiar los archivos cacheados en sw.js.
const RELEASE_VERSION='3.9.4.5', RELEASE_SEEN_KEY='fragua-2-ultimo-deploy-leido';
const RELEASE_HISTORY=[
 {version:'3.9.4.5',name:'Corrección de apuntado y minería',date:'20/11/2026',changes:[
  'El pico usa la selección por toque mientras siga accesible o la casilla bajo la retícula.',
  'Un contorno de cobre muestra la casilla que recibirá el siguiente golpe.'
 ]},
 {version:'3.9.4.4',name:'Optimización del HUD de exploración',date:'20/11/2026',changes:[
  'Minimapa abajo a la derecha, con el norte fijo y una flecha que refleja la orientación del personaje.',
  'La barra rápida adapta sus ocho espacios al ancho disponible y los datos de la zona se pueden plegar.'
 ]},
 {version:'3.9.4.3',name:'Retícula central e interacción',date:'20/11/2026',changes:[
  'Apunta con la retícula central y pulsa MANO cuando se ilumine en verde.',
  'También puedes tocar un objeto y pulsar MANO. La retícula tiene prioridad si apunta a un objetivo accesible.'
 ]},
 {version:'3.9.4.2',name:'Runas, Basurero y Construcción',date:'17/11/2026',changes:[
  'Las runas ahora se engastan desde Personaje → RUNAS; la Runa de Veneno de la Viuda funciona en la espada de la mochila o hotbar.',
  'Nuevas runas de Veta para el pico y de Guardia para armaduras o escudo; engastes persistentes y runas recuperables.',
  'Mochila: basurero para destruir una unidad o una pila con confirmación y opción para soltar objetos al suelo.',
  'Muros, esquinas y puertas: mejor unión visual de las piezas sin alterar construcciones, planos ni guardados existentes.'
 ]},
 {version:'3.9.4.1',name:'Peligros de las Profundidades',date:'17/11/2026',changes:[
  'Cada estrato aumenta la vida, el daño, la agresividad y la experiencia de las criaturas; aparecen variantes veteranas en las profundidades.',
  'La Viuda de Carbón es más resistente y peligrosa, con fases ajustadas a sus puntos de vida.',
  'Los mundos nuevos ubican escaleras, ascensores, ruinas y la Galería Silenciosa según la semilla de la partida.',
  'En las Minas Abandonadas hay un alijo oculto con un cristal garantizado; murciélagos pueden soltar cristal muy raramente.',
  'Los mundos antiguos mantienen sus ubicaciones; se conservan construcciones, exploración y el guardado.'
 ]},
 {version:'3.9.4',name:'El Camino del Forjador',date:'16/11/2026',changes:[
  'La minería, la fundición y los combates ahora otorgan experiencia y niveles de personaje.',
  'Nuevo panel Progresión con tres especializaciones: Minería, Combate y Herrería.',
  'Los puntos de habilidad mejoran extracción, daño de espada y velocidad de fundición.',
  'La experiencia y los puntos se guardan; las partidas anteriores reciben un reconocimiento inicial por su progreso.',
  'El HUD muestra nivel de personaje y progreso de experiencia sin confundirlos con el estrato de la mina.'
 ]},
 {version:'3.9.3.2',name:'Novedades del juego',date:'16/11/2026',changes:[
  'Al abrir una actualización, aparece un resumen con únicamente sus cambios.',
  'El aviso se muestra una sola vez por versión en cada dispositivo.',
  'Ajustes incluye un historial para consultar las novedades de versiones anteriores.'
 ]},
 {version:'3.9.3.1',name:'Forja de picos y espadas',changes:[
  'Nueva pestaña Forja en Recetas con materiales necesarios y mejoras disponibles.',
  'El yunque del refugio permite mejorar herramientas con Mano.',
  'Se indican los minerales que puede extraer cada nivel de pico.'
 ]},
 {version:'3.9.3',name:'HUD renovado',changes:[
  'Menú superior con iconos de bolsa, forja, diario y ajustes.',
  'Minimapa circular que abre el mapa grande al tocarlo.',
  'Vida, aguante y barra rápida reorganizados para móviles.'
 ]},
 {version:'3.9.2.2',name:'Ícono de la cueva',changes:[
  'La entrada a la mina se convierte en ícono de la aplicación y del navegador.'
 ]},
 {version:'3.9.2.1',name:'Diario ilustrado',changes:[
  'Se añadieron el emblema del libro, montañas, entrada a la mina y marcos decorativos al diario.'
 ]},
 {version:'3.9.2',name:'Minas más vivas y diario organizado',changes:[
  'Restos de mineros y esqueletos decorativos, saqueables y narrativos.',
  'Diario separado por capítulos con notas numeradas en orden narrativo.',
  'Los restos saqueables se registran para evitar recompensas repetidas.'
 ]},
 {version:'3.9.1',name:'La Galería de la Viuda',changes:[
  'Vendajes y pociones no consumen turnos en combates contra jefes.',
  'Nuevas cámaras, dos sellos para llegar al nido y mejor ambientación.',
  'Daño y recuperación flotantes, con ajustes de dificultad para la Viuda.'
 ]},
 {version:'3.9',name:'Mazmorras Olvidadas',changes:[
  'Primera mazmorra narrativa y combate por turnos contra la Viuda de Carbón.',
  'Historia, diario, cofres y habilidades especiales de la Viuda.'
 ]},
 {version:'3.8.1',name:'HUD y controles multitáctiles',changes:[
  'Movimiento simultáneo con ataque, esquiva y lámpara.',
  'Vida y aguante reorganizados junto a los controles.'
 ]},
 {version:'3.8',name:'Acero y esquiva',changes:[
  'Ataques cargados, esquiva, barra de aguante y enemigos adicionales.'
 ]},
 {version:'3.7',name:'Criaturas de las profundidades',changes:[
  'Slimes, arañas, telarañas y primeros combates con botín.'
 ]}
];
function releaseEntryMarkup(release){return `<div class="release-entry"><div class="release-version">ALPHA ${escapeHTML(release.version)}${release.date?' · '+escapeHTML(release.date):''}</div><h3>${escapeHTML(release.name)}</h3><ul>${release.changes.map(change=>`<li>${escapeHTML(change)}</li>`).join('')}</ul></div>`;}
function releaseHistoryMarkup(){return `<p class="panel-text">Revisa las actualizaciones del juego. La ventana al iniciar muestra únicamente la versión más reciente.</p><div class="release-history">${RELEASE_HISTORY.map((release,i)=>`<details ${i===0?'open':''}><summary><span>ALPHA ${escapeHTML(release.version)} · ${escapeHTML(release.name)}</span><span class="release-version">${i===0?'ACTUAL':''}</span></summary>${releaseEntryMarkup(release)}</details>`).join('')}</div><div class="panel-actions"><button data-a="pause">‹ AJUSTES</button><button class="primary" data-a="resume">CONTINUAR</button></div>`;}
function dismissReleaseNotes(){const popup=$('release-popup');if(!popup||popup.classList.contains('hidden'))return;popup.classList.add('hidden');try{localStorage.setItem(RELEASE_SEEN_KEY,RELEASE_VERSION);}catch(e){console.warn('No se pudo registrar la versión leída',e);} }
function showReleaseNotesIfNew(){let version=null;try{version=localStorage.getItem(RELEASE_SEEN_KEY);}catch(e){}
 if(version===RELEASE_VERSION)return false;
 const popup=$('release-popup');if(!popup)return false;
 const newest=RELEASE_HISTORY.find(v=>v.version===RELEASE_VERSION);
 if(!newest)return false;
 $('release-current').innerHTML=releaseEntryMarkup(newest);
 popup.classList.remove('hidden');return true;
}
$('release-close').addEventListener('click',dismissReleaseNotes);
$('release-understood').addEventListener('click',dismissReleaseNotes);
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
// ALPHA 3.9.4 — Progresión de personaje. No toca el nivel (estrato) del mundo.
const SKILL_DATA={
 mining:{name:'Minería',icon:'⚒',description:'Cada rango añade +1 potencia por golpe del pico. No sustituye al tipo de pico necesario para minerales raros.',unlock:2},
 combat:{name:'Combate',icon:'⚔',description:'Cada rango aumenta 10% el daño de espada y 4 puntos/s la regeneración de aguante.',unlock:3},
 smithing:{name:'Herrería',icon:'♨',description:'Cada rango reduce 10% el tiempo para fundir cada lingote.',unlock:4}
};
const MAX_SKILL_RANK=5,MAX_CHARACTER_LEVEL=16;
let progression=freshProgression();
function freshProgression(){return{level:1,xp:0,totalXP:0,points:0,skills:{mining:0,combat:0,smithing:0}};}
function xpForNextLevel(level){return 80+Math.max(0,level-1)*35;}
function addExperience(value,cause=''){
 const earned=Math.max(0,Math.floor(Number(value)||0));if(!earned||progression.level>=MAX_CHARACTER_LEVEL)return;
 progression.totalXP+=earned;progression.xp+=earned;
 let leveled=false;
 while(progression.level<MAX_CHARACTER_LEVEL&&progression.xp>=xpForNextLevel(progression.level)){
  progression.xp-=xpForNextLevel(progression.level);progression.level++;progression.points++;leveled=true;
 }
 if(progression.level>=MAX_CHARACTER_LEVEL)progression.xp=0;
 refreshProgressionHud();
 if(leveled){toast('✧ ¡NIVEL '+progression.level+'! +1 punto de habilidad · Toca la barra XP.',2900);updateHud();}
 scheduleSave();
}
function restoreProgression(data,oldStats){
 const result=freshProgression();
 if(data&&typeof data==='object'&&Number.isFinite(data.level)){
  result.level=clamp(Math.floor(data.level),1,MAX_CHARACTER_LEVEL);
  result.xp=clamp(Math.floor(Number(data.xp)||0),0,xpForNextLevel(result.level)-1);
  result.totalXP=Math.max(0,Math.floor(Number(data.totalXP)||0));
  const ranks={};let invested=0;
  for(const id of Object.keys(SKILL_DATA)){
   const rank=clamp(Math.floor(Number(data.skills?.[id])||0),0,MAX_SKILL_RANK);
   ranks[id]=rank;invested+=rank;
  }
  result.skills=ranks;result.points=clamp(Math.floor(Number(data.points)||0),0,Math.max(0,result.level-1-invested));
  return result;
 }
 // Migración única de partidas anteriores: reconocer logros ya registrados.
 const credit=Math.min(3000,Math.max(0,Math.floor(Number(oldStats?.mined)||0))+Math.max(0,Math.floor(Number(oldStats?.smelted)||0))*5+Math.max(0,Math.floor(Number(oldStats?.kills)||0))*10+Math.max(0,Math.floor(Number(oldStats?.bosses)||0))*150);
 result.xp=credit;result.totalXP=credit;
 while(result.xp>=xpForNextLevel(result.level)&&result.level<MAX_CHARACTER_LEVEL){result.xp-=xpForNextLevel(result.level);result.level++;result.points++;}
 return result;
}
function allocateSkill(id){
 const spec=SKILL_DATA[id];if(!spec||progression.points<1||progression.skills[id]>=MAX_SKILL_RANK||progression.level<spec.unlock+progression.skills[id]*3)return false;
 progression.points--;progression.skills[id]++;refreshProgressionHud();queueSave();showModal('skills');toast('✧ '+spec.name+' sube a rango '+progression.skills[id]+'.',1700);return true;
}
function effectiveSmeltMs(){return Math.round(SMELT_MS*(1-.10*progression.skills.smithing));}
function refreshProgressionHud(){
 const btn=$('btn-progression');if(!btn)return;
 const max=xpForNextLevel(progression.level),atCap=progression.level>=MAX_CHARACTER_LEVEL;
 const lv=$('xp-level'),fill=$('xp-fill'),label=$('xp-label');
 if(lv)lv.textContent='NV '+progression.level;
 if(fill)fill.style.width=(atCap?100:Math.max(0,Math.min(100,Math.round(progression.xp/max*100))))+'%';
 if(label)label.textContent=atCap?'MAX':progression.xp+'/'+max+' XP';
 btn.title='Personaje nivel '+progression.level+' · '+(atCap?'Experiencia máxima':progression.xp+' de '+max+' XP')+' · '+progression.points+' puntos de habilidad';
 btn.setAttribute('aria-label',btn.title);
 btn.classList.toggle('has-points',progression.points>0);
}
function skillsPanel(){
 const atCap=progression.level>=MAX_CHARACTER_LEVEL,max=xpForNextLevel(progression.level),pct=atCap?100:Math.round(progression.xp/max*100);
 return `<p class="panel-text">El nivel del personaje es independiente del estrato de las minas. Ganas experiencia al extraer minerales naturales, fundir lingotes y derrotar criaturas. Las mejoras de equipo requieren materiales.</p>
 <div class="progression-overview"><strong>PERSONAJE · NIVEL ${progression.level}</strong><span>${atCap?'NIVEL MÁXIMO':progression.xp+' / '+max+' XP para el siguiente nivel'}</span><div class="progression-track"><span style="width:${pct}%"></span></div><b>${progression.points} PUNTO${progression.points===1?'':'S'} PARA DISTRIBUIR</b></div>
 <div class="skill-grid">${Object.entries(SKILL_DATA).map(([id,spec])=>{const rank=progression.skills[id],requiredLevel=spec.unlock+rank*3,locked=progression.level<requiredLevel,maxed=rank>=MAX_SKILL_RANK;
 return `<div class="skill-card"><div class="skill-heading"><span class="skill-icon">${spec.icon}</span><strong>${spec.name}</strong><span>RANGO ${rank}/${MAX_SKILL_RANK}</span></div><p>${spec.description}</p><small>${locked?'Próximo rango al nivel '+requiredLevel:maxed?'Habilidad al máximo':'Disponible · nivel mínimo '+requiredLevel}</small><button data-skill="${id}" ${locked||maxed||progression.points<1?'disabled':''}>${locked?'BLOQUEADO':maxed?'MÁXIMO':'APRENDER · 1 PUNTO'}</button></div>`;}).join('')}</div>
 <p class="panel-text">El pico básico no puede sustituirse solo con experiencia: para oro y cristal sigue siendo necesario forjar el pico de cobre.</p>
 <div class="panel-actions"><button data-a="equip">PERSONAJE</button><button class="primary" data-a="resume">VOLVER A EXPLORAR</button></div>`;
}

const distance=(a,b,c,d)=>Math.hypot(a-c,b-d);
const hashInt=(x,y,k=0)=>{let n=(Math.imul(x+423,374761393)+Math.imul(y+169,668265263)+Math.imul(seed+91+k*7,982451653))|0;n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295};
let seed=57813,worldLayoutVersion=0,layer=0,chunkCache=new Map(),mined=new Map(),fog=new Map(),vis=new Set(),player={x:.5,y:.5,gender:'male',dirX:0,dirY:1,face:'down',walk:0,steps:0},stats={mined:0,explored:0,visits:0,transitions:0},ores={},visitedLevels=new Set([0]),currentToast='',selectedTile=null,highlightProp=null;
let playing=false,paused=true,selCharacter='male',modalType='',actionHeld=false,actionCD=0,breakDamage=new Map(),hitFlash=0,toastUntil=0,lastTs=0,blink=0,autoSaveTime=0,frameCount=0,saveChain=Promise.resolve(),db=null,saveReady=false,lastActionVisual='';
// Alpha 3.7 — creature state, persistent cobwebs and combat target (no new save key).
let enemies=new Map(),defeatedEnemies=new Set(),webs=new Map(),selectedEnemy=null;
// Alpha 3.9.4.1: geografía determinista por semilla; 0 preserva TODOS los mapas antiguos.
const layoutCache=new Map();
const DEPTH_HP=[1,1.2,1.5,1.9,2.3,2.8,3.4,4.0];
const DEPTH_DAMAGE=[1,1.15,1.30,1.5,1.8,2.1,2.5,3.0];
const DEPTH_XP=[1,1.15,1.35,1.6,2,2.4,2.9,3.5];
function depthStats(l){return{health:DEPTH_HP[clamp(l,0,7)],damage:DEPTH_DAMAGE[clamp(l,0,7)],xp:DEPTH_XP[clamp(l,0,7)]};}
function seededPoint(l,k,min,max){const angle=hashInt(l*19,k,705+k)*Math.PI*2,r=min+(max-min)*hashInt(l*29,k,719+k);return{x:Math.round(Math.cos(angle)*r)+.5,y:Math.round(Math.sin(angle)*r)+.5};}
function offsetPoint(a,b){return{x:a.x+b.x-.5,y:a.y+b.y-.5};}
function awayFrom(point,others,minimum,l,salt){let p=point;for(let j=0;j<9&&others.some(q=>distance(p.x,p.y,q.x,q.y)<minimum);j++)p=seededPoint(l,salt+j*17,72+j*3,112+j*3);return p;}
function worldLayout(l){if(!worldLayoutVersion)return null;
 const k=seed+':'+l;let g=layoutCache.get(k);if(g)return g;
 const up=l===0?{...START}:seededPoint(l,31,10,17);
 const down=awayFrom(seededPoint(l,41,57,93),[up],39,l,41);
 const shaftUp=awayFrom(seededPoint(l,53,21,40),[up,down],16,l,53);
 const shaftDown=awayFrom(seededPoint(l,61,73,114),[up,down,shaftUp],33,l,61);
 const sign=hashInt(l,17,882)>.5?1:-1;
 const d={x:sign*(100+Math.floor(hashInt(l,7,881)*45)),y:(hashInt(l,19,899)>.5?1:-1)*(71+Math.floor(hashInt(l,29,901)*60)),sign};
 const cache=offsetPoint(up,seededPoint(l,83,16,27));
 const ruins=[awayFrom(seededPoint(l,105,40,110),[up,down,shaftDown],15,l,105),awayFrom(seededPoint(l,125,45,119),[up,down,shaftDown],17,l,125)];
 const starter=[seededPoint(l,151,4,6),seededPoint(l,152,4,6),seededPoint(l,153,4,6),seededPoint(l,154,4,6)];
 g={up,down,shaftUp,shaftDown,dungeon:d,cache,ruins,starter};layoutCache.set(k,g);return g;
}
function dungeonPoint(x,y){if(!worldLayoutVersion)return{x,y};const d=worldLayout(1).dungeon;
 return{x:d.x+d.sign*(Math.floor(x)-19)+(x-Math.floor(x)),y:d.y+Math.floor(y)+(y-Math.floor(y))};}
function dungeonLocal(x,y){if(!worldLayoutVersion)return{x,y};const d=worldLayout(1).dungeon;
 return{x:19+d.sign*(Math.floor(x)-d.x)+(x-Math.floor(x)),y:Math.floor(y)-d.y+(y-Math.floor(y))};}
function downPoint(l){return worldLayoutVersion?worldLayout(l).down:DEEP_STAIR;}
function upPoint(l){return worldLayoutVersion?worldLayout(l).up:ENTRY;}
function shaftDownPoint(l){return worldLayoutVersion?worldLayout(l).shaftDown:l===0?SHAFT:SHAFT_DOWN;}
function shaftUpPoint(l){return worldLayoutVersion?worldLayout(l).shaftUp:SHAFT_UP;}
function directionHint(a,b){const x=b.x-a.x,y=b.y-a.y;const e=x>12?'este':x< -12?'oeste':'';const n=y>12?'sur':y< -12?'norte':'';return n&&e?n+'-'+e:n||e||'las cercanías';}
function checkDanger(l){if(l<2)return;const recommended=[1,1,3,5,7,10,12,15][l];
 if(progression.level<recommended){toast('⚠ Estrato '+l+': peligro extremo. Nivel de personaje recomendado '+recommended+'.',3150,'warning');}}
let creatureClock=0,spawnClock=0,swordCooldown=0,playerInvuln=0,battleFlash=null;
// Alpha 3.8 — combate: acción cargada, esquiva, fatiga y señales de ataque.
const MAX_STAMINA=100,DODGE_COST=30,CHARGE_COST=28;
let stamina=MAX_STAMINA,staminaDelay=0,dodgeCooldown=0,dodgeTime=0,dodgeX=0,dodgeY=0;
let swordHoldTime=0,swordCharging=false,attackFX=null;
function refreshCombatUI(){
 const n=Math.round(clamp(stamina,0,MAX_STAMINA));
 if(UI.staminaFill)UI.staminaFill.style.width=n+'%';
 if(UI.staminaLabel&&UI.staminaLabel.textContent!==String(n))UI.staminaLabel.textContent=String(n);
 const health=Math.round(clamp(hp,0,100));
 if(UI.healthFill)UI.healthFill.style.width=health+'%';
 if(UI.healthLabel&&UI.healthLabel.textContent!==String(health))UI.healthLabel.textContent=String(health);
 if(UI.dodgeBtn){UI.dodgeBtn.disabled=!playing||paused||stamina<DODGE_COST||dodgeCooldown>0;
 UI.dodgeBtn.setAttribute('aria-label',`Esquiva, aguante ${n} de 100`);}
 if(UI.chargeMeter)UI.chargeMeter.style.width=(swordCharging?Math.round(clamp(swordHoldTime/.65,0,1)*100):0)+'%';
 UI.actionBtn.classList.toggle('sword-charging',swordCharging);
 UI.actionBtn.classList.toggle('sword-ready',swordCharging&&swordHoldTime>=.65&&stamina>=CHARGE_COST);
}
function dodge(){
 if(!playing||paused||stamina<DODGE_COST||dodgeCooldown>0||dodgeTime>0)return false;
 let x=joystick.x,y=joystick.y;
 if(keys.has('ArrowLeft')||keys.has('KeyA'))x--;
 if(keys.has('ArrowRight')||keys.has('KeyD'))x++;
 if(keys.has('ArrowUp')||keys.has('KeyW'))y--;
 if(keys.has('ArrowDown')||keys.has('KeyS'))y++;
 const len=Math.hypot(x,y)||1;if(Math.hypot(x,y)<.1){x=player.dirX||0;y=player.dirY||1;}
 else{x/=len;y/=len;}
 const mag=Math.hypot(x,y)||1;dodgeX=x/mag;dodgeY=y/mag;
 stamina-=DODGE_COST;staminaDelay=.8;dodgeTime=.22;dodgeCooldown=.72;playerInvuln=Math.max(playerInvuln,.29);
 swordCharging=false;swordHoldTime=0;refreshCombatUI();
 if(navigator.vibrate)try{navigator.vibrate(12)}catch{}
 return true;
}
function beginSwordCharge(){if(!playing||paused||swordCharging||pickedItem()?.id!=='sword')return;
 swordCharging=true;swordHoldTime=0;refreshCombatUI();}
function endSwordCharge(){if(!swordCharging)return;
 const heavy=swordHoldTime>=.65&&stamina>=CHARGE_COST;
 swordCharging=false;swordHoldTime=0;
 if(playing&&!paused&&pickedItem()?.id==='sword')swordAttack(heavy);
 refreshCombatUI();}
function cancelSwordCharge(){swordCharging=false;swordHoldTime=0;refreshCombatUI();}

const screen={w:1,h:1,dpr:1,tile:32,camX:START.x,camY:START.y};
const HAND_REACH=2.35, CAMERA_LOOK_AHEAD=1.05;
let handSelection=null,miningSelection=null;
const joystick={active:false,id:null,x:0,y:0},keys=new Set();
// Fuentes de luz del nivel actual. Solo se recalculan cuando cambian las paredes,
// puertas, antorchas o el estrato, para no penalizar el rendimiento del móvil.
let lightLayer=-1,lightDirty=true,staticLights=new Map(),staticLightTints=new Map(),lightSources=[];
// Radio visible del jugador: luz ambiental mínima y lámpara minera manual.
const PLAYER_VISION_RADIUS=3, MINER_LAMP_RADIUS=8;
const glowPropCache=new Map();
function invalidateLights(){lightDirty=true;}
function lightSpec(kind){
 if(kind==='torch')return{radius:6.2,power:1,tint:'warm'};
 if(kind==='campfire'||kind==='fire')return{radius:8.2,power:1.12,tint:'warm'};
 if(kind==='crystal')return{radius:4.6,power:.66,tint:'blue'};
 if(kind==='furnace')return{radius:4.3,power:.65,tint:'warm'};
 if(kind==='glowmush')return{radius:5,power:.76,tint:'blue'};
 return null;
}


// Alpha 3: shared inventory, storage, building and safe bases (compatible with Alpha 2.1 save).
const ITEMS={pick:{name:'Pico',icon:'⚒',max:1},martillo:{name:'Martillo de reparación',icon:'🔨',max:1},sword:{name:'Espada del clan',icon:'⚔',max:1},
 piedra:{name:'Piedra',icon:'▦',max:99,place:'stone'},tierra:{name:'Tierra',icon:'▥',max:99,place:'dirt'},hilo:{name:'Hilo de araña',icon:'≋',max:99},cuerda:{name:'Cuerda',icon:'◈',max:99},vendaje:{name:'Vendaje de emergencia',icon:'✚',max:20},hueso:{name:'Huesos antiguos',icon:'♧',max:99},membrana:{name:'Membrana de murciélago',icon:'◈',max:99},vendajefuerte:{name:'Vendaje reforzado',icon:'✚',max:20},tonico:{name:'Tónico de aguante',icon:'✦',max:20},pocionprecision:{name:'Poción de precisión',icon:'◎',max:20},colmillo:{name:'Colmillo de la Viuda',icon:'♢',max:20},sedanegra:{name:'Seda negra',icon:'≋',max:99},runa_veneno:{name:'Runa de veneno',icon:'☣',max:1},runa_hielo:{name:'Runa de ralentización',icon:'❄',max:1},runa_veta:{name:'Runa de Veta',icon:'✧',max:1},runa_guardia:{name:'Runa de Guardia',icon:'◇',max:1},
 madera:{name:'Troncos de madera',icon:'▤',max:99},tablas:{name:'Tablas',icon:'▤',max:99},palos:{name:'Palos',icon:'╱',max:99},gel:{name:'Gel de slime',icon:'●',max:99},cartuchogel:{name:'Cartucho de gel',icon:'◉',max:99},lampara:{name:'Lámpara minera',icon:'✦',max:1,equip:'offhand'},escudo:{name:'Escudo de cobre',icon:'⛨',max:1,equip:'offhand'},cobre:{name:'Cobre',icon:'◆',max:99},carbon:{name:'Carbón',icon:'◈',max:99},
 hierro:{name:'Hierro',icon:'▣',max:99},oro:{name:'Oro',icon:'✦',max:99},
 lingotecobre:{name:'Lingote de cobre',icon:'▰',max:99},lingotehierro:{name:'Lingote de hierro',icon:'▰',max:99},lingoteoro:{name:'Lingote de oro',icon:'▰',max:99},
 casco_cobre:{name:'Casco de cobre',icon:'♜',max:1,equip:'head',tier:1},pechera_cobre:{name:'Pechera de cobre',icon:'▣',max:1,equip:'chest',tier:1},pantalones_cobre:{name:'Pantalones de cobre',icon:'▦',max:1,equip:'legs',tier:1},botas_cobre:{name:'Botas de cobre',icon:'▰',max:1,equip:'feet',tier:1},casco_hierro:{name:'Casco de hierro',icon:'♜',max:1,equip:'head',tier:2},pechera_hierro:{name:'Pechera de hierro',icon:'▣',max:1,equip:'chest',tier:2},pantalones_hierro:{name:'Pantalones de hierro',icon:'▦',max:1,equip:'legs',tier:2},botas_hierro:{name:'Botas de hierro',icon:'▰',max:1,equip:'feet',tier:2},casco_oro:{name:'Casco de oro',icon:'♜',max:1,equip:'head',tier:3},pechera_oro:{name:'Pechera de oro',icon:'▣',max:1,equip:'chest',tier:3},pantalones_oro:{name:'Pantalones de oro',icon:'▦',max:1,equip:'legs',tier:3},botas_oro:{name:'Botas de oro',icon:'▰',max:1,equip:'feet',tier:3},horno:{name:'Horno de fundición',icon:'♨',max:99,place:'furnace'},cristal:{name:'Cristal',icon:'✦',max:99},mithril:{name:'Mithril',icon:'◇',max:99},
 adamantita:{name:'Adamantita',icon:'◉',max:99},ancestral:{name:'Piedra ancestral',icon:'✧',max:99},
 mesa:{name:'Mesa de trabajo',icon:'▥',max:99,place:'workbench'},cofre:{name:'Cofre',icon:'▣',max:99,place:'chest'},
 cama:{name:'Cama',icon:'▰',max:99,place:'bed'},estandarte:{name:'Estandarte del Clan',icon:'⚑',max:99,place:'banner'},
 hoguera:{name:'Hoguera de expedición',icon:'♨',max:99,place:'campfire'},puerta:{name:'Puerta de madera',icon:'▯',max:99,place:'door'},
 antorcha:{name:'Antorcha',icon:'✹',max:99,place:'torch'},paredmadera:{name:'Pared de madera',icon:'▨',max:99,place:'woodback'},
 paredpiedra:{name:'Muro de piedra',icon:'▧',max:99,place:'stoneback'},plataforma:{name:'Suelo de madera',icon:'▱',max:99,place:'platform'},suelopiedra:{name:'Suelo de piedra',icon:'▦',max:99,place:'stonefloor'}};
// Approved pixel art items, adapted from the visual proposal. Assets are bundled/offline.
const ITEM_DESCRIPTIONS={
 pick:'Herramienta para excavar paredes y abrir túneles.',martillo:'Repara desgaste parcial de estructuras y rocas. Cuesta 1 material correspondiente por reparación.',sword:'Espada del clan. Sus runas pueden aplicar veneno o ralentización en batallas contra jefes.',
 piedra:'Roca común: sirve para construir paredes y estaciones.',tierra:'Bloque blando que puedes colocar para abrir caminos.',
 hilo:'Fibra resistente encontrada al destruir telarañas o derrotar arañas.',cuerda:'Cuerda de hilo. Material para las futuras expediciones y mecanismos.',vendaje:'Recupera 25 puntos de vida fuera o durante un combate.',hueso:'Restos de esqueletos. Se usan para fabricar vendajes reforzados.',membrana:'Material ligero de murciélago, útil para tónicos de aguante.',vendajefuerte:'Recupera 45 puntos de vida con huesos e hilos.',tonico:'Restaura 55 puntos de aguante para seguir esquivando.',pocionprecision:'En un combate contra jefe, garantiza que el siguiente ataque impacte y haga el máximo daño base.',colmillo:'Trofeo único de la Viuda. Material para la runa venenosa.',sedanegra:'Seda oscura del nido de la Viuda de Carbón.',runa_veneno:'Imbuye la espada con veneno: 25% de probabilidad de aplicar daño por 3 turnos.',runa_hielo:'Runa para espada: 20% de ralentizar a los enemigos, sujeto a sus resistencias.',runa_veta:'Runa para pico: 15% de probabilidad de extraer un mineral adicional de una veta natural. No elimina requisitos de pico.',runa_guardia:'Runa para armadura y escudo: reduce en 1 punto el daño recibido por cada pieza engastada.',madera:'Troncos en bruto. En la mesa de trabajo se convierten en tablas.',tablas:'Madera procesada para construcciones, muebles y escudos.',palos:'Mangos para herramientas, antorchas y otras recetas.',gel:'Gel obtenido de los slimes. Se procesa en cartuchos para la lámpara.',cartuchogel:'Combustible refinado: recarga cinco minutos de la lámpara.',lampara:'Luz móvil. Se equipa en mano secundaria y se recarga manualmente.',escudo:'Se equipa en mano secundaria. El bloqueo llegará con el combate.',cobre:'Mineral para estandartes y futuras herramientas.',
 carbon:'Combustible para las antorchas y para fundir minerales en el horno.',hierro:'Mineral para fundir lingotes y forjar herramientas y armaduras.',
 oro:'Mineral raro de estratos profundos para lingotes especiales.',lingotecobre:'Metal refinado para fabricar equipo de cobre.',lingotehierro:'Metal refinado para equipo más resistente.',lingoteoro:'Metal raro para equipo refinado.',
 horno:'Estación que funde menas en lingotes cada 10 segundos.',
 cristal:'Recurso especial encontrado en cavernas de cristal.',mithril:'Mineral raro de los estratos profundos.',
 adamantita:'Mineral resistente de las profundidades ardientes.',ancestral:'Piedra con poder de los antiguos clanes.',
 mesa:'Estación que desbloquea recetas de construcción.',cofre:'Almacena hasta 16 pilas de objetos.',
 cama:'Descansa y establece tu punto de reaparición.',estandarte:'Designa esta ubicación como fortaleza principal.',
 hoguera:'Campamento para recuperarte durante una expedición.',puerta:'Se abre y cierra para proteger la entrada.',
 antorcha:'Ilumina galerías y refugios.',paredmadera:'Muro elevado y sólido; se une a otros muros.', paredpiedra:'Muro elevado de piedra; bloquea el paso.',plataforma:'Tablones planos por donde se puede caminar.',suelopiedra:'Baldosas planas para los pisos de tu fortaleza.'
};
for(const [id,it] of Object.entries(ITEMS))if(it.equip&&!ITEM_DESCRIPTIONS[id]){
 const slotName={head:'Casco',chest:'Pechera',legs:'Pantalones',feet:'Botas',offhand:'Mano secundaria'}[it.equip];
 ITEM_DESCRIPTIONS[id]=`${slotName}. Pieza de protección que cambia la apariencia del personaje y contribuye a la defensa.`;
}
const CATEGORY_LIST=[['todos','TODAS'],['procesamiento','PROCESAR'],['equipamiento','EQUIPO'],['herramientas','HERRAMIENTAS'],['construccion','CONSTRUCCIÓN'],['estaciones','ESTACIONES'],['almacenamiento','ALMACENES'],['supervivencia','REFUGIO'],['decoracion','DECORACIÓN']];
const RECIPE_CATEGORY={pocionprecision:'supervivencia',runa_veneno:'equipamiento',runa_hielo:'equipamiento',runa_veta:'equipamiento',runa_guardia:'equipamiento',sword:'herramientas',cuerda:'procesamiento',vendaje:'supervivencia',vendajefuerte:'supervivencia',tonico:'supervivencia',tablas:'procesamiento',palos:'procesamiento',cartuchogel:'procesamiento',lampara:'equipamiento',escudo:'equipamiento',casco_cobre:'equipamiento',pechera_cobre:'equipamiento',pantalones_cobre:'equipamiento',botas_cobre:'equipamiento',casco_hierro:'equipamiento',pechera_hierro:'equipamiento',pantalones_hierro:'equipamiento',botas_hierro:'equipamiento',casco_oro:'equipamiento',pechera_oro:'equipamiento',pantalones_oro:'equipamiento',botas_oro:'equipamiento',horno:'estaciones',martillo:'herramientas',mesa:'estaciones',cofre:'almacenamiento',cama:'supervivencia',estandarte:'decoracion',hoguera:'supervivencia',puerta:'construccion',antorcha:'supervivencia',paredmadera:'construccion',paredpiedra:'construccion',plataforma:'construccion',suelopiedra:'construccion'};
let recipeCategory='todos';
const SMELT_RECIPES={
 cobre:{ore:'cobre',out:'lingotecobre'},
 hierro:{ore:'hierro',out:'lingotehierro'},
 oro:{ore:'oro',out:'lingoteoro'}
};
const SMELT_MS=10000;
// Una unidad de fundicion equivale a DOS medios creditos de combustible.
// 1 carbon = 16 medios creditos = 8 lingotes; 1 madera = 3 = 1,5 lingotes.
const FUEL_HALF={carbon:16,madera:3};
const EQUIPMENT_TIERS=[
 {label:'Cobre',ingot:'lingotecobre',pick:3,sword:2,armor:4},
 {label:'Hierro',ingot:'lingotehierro',pick:4,sword:3,armor:5},
 {label:'Oro',ingot:'lingoteoro',pick:6,sword:4,armor:6}
];
let openFurnaceKey=null;
function furnaceAtKey(){const p=structures.get(openFurnaceKey);return p?.kind==='furnace'?p:null;}
function forgeLevel(kind){return kind==='pick'?Math.min(3,Math.max(0,(player.pick||1)-1)):kind==='sword'?player.weaponTier||0:player.armorTier||0;}
function ingotUpgradeCost(kind){const lv=forgeLevel(kind);if(lv>=3)return null;const tier=EQUIPMENT_TIERS[lv];return{[tier.ingot]:tier[kind],...(kind==='pick'?{madera:1}:kind==='sword'?{madera:2}:{piedra:2})};}
const PICK_METAL_NAMES=['Básico','Cobre','Hierro','Oro'];
function pickTierName(){return PICK_METAL_NAMES[clamp((player.pick||1)-1,0,3)];}
function weaponDisplayName(id){return id==='pick'?'Pico '+pickTierName():id==='sword'?'Espada '+PICK_METAL_NAMES[clamp(player.weaponTier||0,0,3)]:ITEMS[id]?.name||id;}
function forgeStationReady(){return hasBench()||[...structures.values()].some(p=>p.layer===layer&&p.kind==='furnace'&&distance(player.x,player.y,p.x,p.y)<5)||(layer===0&&propsFor(0).some(p=>p.kind==='anvil'&&distance(player.x,player.y,p.x,p.y)<4.8));}
function toolMiningInfo(){const level=Math.max(1,Math.floor(player.pick||1));return level===1?'Piedra, tierra, cobre, carbón e hierro':level===2?'También oro, cristal y mithril':level===3?'También adamantita y piedra ancestral':'Todos los minerales, con extracción más rápida';}

function canConsume(cost){return Object.entries(cost).every(([id,n])=>quantity(id)>=n);}
function takeCost(cost){if(!canConsume(cost))return false;for(const [id,n] of Object.entries(cost))removeFrom(inventory,id,n);refreshHotbar();return true;}
function makeFurnaceSlots(p){
 if(!p||p.kind!=='furnace')return;
 // Migracion desde Alpha 3.6: devolver la mena y el carbon ya descontados
 // si la fundicion antigua aun no termino. Si termino, entregar el lingote.
 if(p.furnaceJob&&!p.furnaceSlots){
  const old=p.furnaceJob,recipe=Object.values(SMELT_RECIPES).find(r=>r.out===old.out);
  const done=Date.now()>=Number(old.readyAt||0);
  const oldCoal=old.out==='lingoteoro'?2:1;
  p.furnaceSlots={input:!done&&recipe?{id:recipe.ore,n:2}:null,
    fuel:!done?{id:'carbon',n:oldCoal}:null,
    output:done&&recipe?{id:recipe.out,n:1}:null,
    fuelHalf:0,progressMs:0,lastTick:Date.now()};
  p.furnaceJob=null;
 }
 if(!p.furnaceSlots)p.furnaceSlots={input:null,fuel:null,output:null,fuelHalf:0,progressMs:0,lastTick:Date.now()};
 const st=p.furnaceSlots;
 st.fuelHalf=Math.max(0,Math.round(Number(st.fuelHalf)||0));
 st.progressMs=Math.max(0,Math.min(SMELT_MS,Number(st.progressMs)||0));
 if(!Number.isFinite(st.lastTick))st.lastTick=Date.now();
 for(const key of ['input','fuel','output']){
  const stack=st[key];if(!stack||!ITEMS[stack.id]||!Number.isInteger(stack.n)||stack.n<=0){st[key]=null;continue;}
  stack.n=Math.min(99,stack.n);
 }
 return st;
}
function furnaceRecipe(st){return st?.input?SMELT_RECIPES[st.input.id]:null;}
function furnaceCanRun(st){
 const r=furnaceRecipe(st);if(!r)return false;
 if(st.output&&(st.output.id!==r.out||st.output.n>=99))return false;
 return st.fuelHalf>=2||!!(st.fuel&&FUEL_HALF[st.fuel.id]&&st.fuel.n>0);
}
function furnaceWorking(p){return !!p&&p.kind==='furnace'&&furnaceCanRun(makeFurnaceSlots(p));}
// El reloj es de tiempo real y admite progreso guardado, incluso al reabrir el juego.
function advanceFurnace(p,now=Date.now()){
 const st=makeFurnaceSlots(p);if(!st)return false;
 const elapsed=Math.max(0,now-st.lastTick);st.lastTick=now;
 if(!furnaceCanRun(st))return false;
 st.progressMs+=elapsed;
 let completed=0;
 while(st.progressMs>=effectiveSmeltMs()&&furnaceCanRun(st)&&completed<99){
  const r=furnaceRecipe(st);
  // Solo al terminar los 10 segundos se consume la mena y el combustible.
  if(st.fuelHalf<2){st.fuelHalf+=FUEL_HALF[st.fuel.id];st.fuel.n--;if(st.fuel.n===0)st.fuel=null;}
  st.fuelHalf-=2;
  st.input.n--;if(st.input.n===0)st.input=null;
  if(st.output)st.output.n++;else st.output={id:r.out,n:1};
  st.progressMs-=effectiveSmeltMs();
  completed++;
 }
 if(!furnaceCanRun(st))st.progressMs=0;
 if(completed){stats.smelted=(stats.smelted||0)+completed;addExperience(completed*5,'fundición');invalidateLights();scheduleSave();}
 return completed>0;
}
function transferToFurnace(bagIndex){
 const f=furnaceAtKey();if(!f)return;
 advanceFurnace(f);
 const st=makeFurnaceSlots(f),obj=inventory[bagIndex];if(!obj)return;
 const dest=SMELT_RECIPES[obj.id]?'input':FUEL_HALF[obj.id]?'fuel':null;
 if(!dest){toast('Solo puedes ingresar mena, carbon o madera.',1700,'warning');return;}
 if(st[dest]&&st[dest].id!==obj.id){toast('Retira primero el material actual del slot.',1750,'warning');return;}
 const qty=Math.min(obj.n,99-(st[dest]?.n||0));if(qty<=0)return;
 if(st[dest])st[dest].n+=qty;else st[dest]={id:obj.id,n:qty};
 obj.n-=qty;if(obj.n<=0)inventory[bagIndex]=null;
 st.lastTick=Date.now();refreshHotbar();queueSave();showModal('furnace');
}
function takeFurnaceSlot(name){
 const f=furnaceAtKey();if(!f||!['input','fuel','output'].includes(name))return;
 advanceFurnace(f);
 const st=makeFurnaceSlots(f),obj=st[name];if(!obj)return;
 const rest=storeIn(inventory,obj.id,obj.n),moved=obj.n-rest;
 if(!moved){toast('No hay espacio en la mochila.',1800,'warning');return;}
 if(rest)obj.n=rest;else st[name]=null;
 if(name==='input')st.progressMs=0;
 st.lastTick=Date.now();refreshHotbar();queueSave();showModal('furnace');
}
function tickAllFurnaces(){
 const now=Date.now();
 for(const p of structures.values())if(p.kind==='furnace')advanceFurnace(p,now);
}
function upgradeEquipment(kind,from='forge'){
 if(kind!=='pick'&&kind!=='sword')return;
 const cost=ingotUpgradeCost(kind);
 if(!cost){toast('Ya alcanzaste el nivel máximo disponible.',1700,'warning');return;}
 if(!forgeStationReady()){toast('Para forjar, acércate a una MESA, HORNO o YUNQUE.',2300,'warning');return;}
 if(quantity(kind)<1){toast(kind==='sword'?'Primero fabrica una espada básica en la mesa de trabajo.':'Necesitas tener tu pico en la mochila.',2400,'warning');return;}
 if(!canConsume(cost)){toast('Faltan lingotes o madera. Funde mineral en el horno.',2100,'warning');return;}
 if(!takeCost(cost))return;
 const newTier=forgeLevel(kind)+1;
 if(kind==='pick')player.pick=Math.max(player.pick||1,newTier+1);
 else player.weaponTier=newTier;
 stats.forged=(stats.forged||0)+1;
 refreshHotbar();updateHud();queueSave();showModal(from);
 toast('¡'+(kind==='pick'?'Pico':'Espada')+' de '+EQUIPMENT_TIERS[newTier-1].label+' forjado!',2300);
}
function forgeProgressCards(){
 const ready=forgeStationReady();
 return [['pick','Pico','pick'],['sword','Espada','sword']].map(([kind,label,art])=>{
  const lev=forgeLevel(kind),cost=ingotUpgradeCost(kind),next=EQUIPMENT_TIERS[lev],owned=quantity(kind)>0;
  const status=lev===0?'Básico':EQUIPMENT_TIERS[lev-1].label;
  const perk=kind==='pick'?(lev===0?'Permite minar oro, cristal y mithril':lev===1?'Permite minar adamantita y piedra ancestral':'Mayor velocidad al picar'):'Más daño de espada en combates normales y contra jefes';
  const disabled=!cost||!ready||!owned||!canConsume(cost);
  return `<div class="forge-recipe tool-forge-card">${itemArt(art,'forge-icon')}<div><strong>${label} ${status}</strong><small>${cost?`Próximo: ${next.label} · ${perk}`:'MEJORA MÁXIMA'}</small>${cost?`<div class="forge-materials">${materialsLine(cost)}</div>`:''}<small class="forge-status">${!owned?'Primero necesitas '+(kind==='pick'?'el pico':'fabricar la espada básica'):!ready?'Acércate a una mesa, horno o yunque':cost&&!canConsume(cost)?'Faltan materiales':cost?'Listo para forjar':'Nivel máximo'}</small></div><button type="button" data-upgrade="${kind}" ${disabled?'disabled':''}>${cost?'FORJAR':'MÁXIMO'}</button></div>`;
 }).join('');
}
function forgePanel(){
 return `<p class="panel-text panel-instructions"><b>FORJA DE HERRAMIENTAS</b> · Elige un pico o espada, reúne los lingotes necesarios y pulsa FORJAR. Puedes hacerlo cerca de una mesa, un horno o el yunque de la superficie.</p>
 <div class="craft-tabs"><button data-view="bag">MOCHILA</button><button data-view="craft">RECETAS</button><button data-view="forge" class="on">FORJA</button><button data-view="equip">PERSONAJE</button></div>
 <div class="forge-station-status ${forgeStationReady()?'ready':''}">${forgeStationReady()?'⚒ ESTACIÓN DISPONIBLE · Puedes forjar':'⚒ ESTACIÓN NECESARIA · Acércate a tu mesa, horno o al yunque del refugio'}</div>
 <div class="forge-recipe-grid">${forgeProgressCards()}</div>
 <div class="forge-mining-guide"><strong>⛏ Tu pico actual: ${pickTierName()}</strong><span>${toolMiningInfo()}</span><p>RUTA: Pico básico → Cobre → Hierro → Oro. El horno funde las menas en lingotes (1 mena = 1 lingote). Para fabricar una espada básica: RECETAS → HERRAMIENTAS.</p><div class="ore-unlock-row"><span>⚒ Básico: cobre / hierro</span><span>⚒ Cobre: oro / cristal / mithril</span><span>⚒ Hierro: adamantita / ancestral</span></div></div>
 <div class="panel-actions"><button data-view="craft">VER RECETAS</button><button class="primary" data-a="resume">VOLVER AL JUEGO</button></div>`;
}
function materialsLine(cost){return Object.entries(cost).map(([id,n])=>`<span class="forge-cost ${quantity(id)>=n?'has':'missing'}">${itemArt(id,'material-art')} ${ITEMS[id].name} ${quantity(id)}/${n}</span>`).join('');}
function furnaceSlotMarkup(name,obj){
 return obj?`${itemArt(obj.id,'furnace-slot-art')}<b>${obj.n}</b>`:'<span class="furnace-empty">+</span>';
}
function furnacePanel(){const f=furnaceAtKey();if(!f)return '<p>Horno no disponible.</p>';
 advanceFurnace(f);const st=makeFurnaceSlots(f),active=furnaceCanRun(st);
 const secs=active?Math.max(0,Math.ceil((effectiveSmeltMs()-st.progressMs)/1000)):0;
 const pct=active?Math.min(100,Math.floor(st.progressMs/effectiveSmeltMs()*100)):0;
 return `<p class="panel-text furnace-help">Coloca mena arriba y carbón o madera abajo. Cada lingote tarda <b>10 segundos</b>. Toca un slot para retirar su contenido; toca un objeto de la mochila para ingresarlo.</p>
 <div class="furnace-station">
  <div class="furnace-slots">
   <div class="furnace-slots-left">
    <div class="furnace-stack"><small>MENA</small><button type="button" class="furnace-slot" data-furnace-slot="input" aria-label="Retirar mena">${furnaceSlotMarkup('input',st.input)}</button></div>
    <div class="furnace-stack"><small>COMBUSTIBLE</small><button type="button" class="furnace-slot" data-furnace-slot="fuel" aria-label="Retirar combustible">${furnaceSlotMarkup('fuel',st.fuel)}</button></div>
   </div>
   <div class="furnace-process"><span class="furnace-flame">🔥</span><span aria-hidden="true">➜</span><small id="furnace-job-label">${active?secs+' s':'En espera'}</small></div>
   <div class="furnace-stack"><small>LINGOTES</small><button type="button" class="furnace-slot" data-furnace-slot="output" aria-label="Recoger lingotes">${furnaceSlotMarkup('output',st.output)}</button></div>
  </div>
  <div class="furnace-progress"><span id="furnace-job-progress" style="width:${pct}%"></span></div>
  <small id="furnace-fuel-hint">Crédito restante: ${(st.fuelHalf/2).toFixed(1).replace('.0','')} lingotes · Carbón: 8 · Madera: 1,5</small>
 </div>
 <h3 class="inv-subheading">MOCHILA · TOCA LA MENA O COMBUSTIBLE PARA CARGAR</h3>
 <div class="furnace-bag">${inventory.map((it,i)=>`<button type="button" class="furnace-bag-item ${!it||!(SMELT_RECIPES[it.id]||FUEL_HALF[it.id])?'ineligible':''}" data-furnace-load="${i}" ${!it?'disabled':''} aria-label="${it?ITEMS[it.id].name+' '+it.n:'Casilla vacía'}">${it?itemArt(it.id,'furnace-bag-art'):'<span class="furnace-empty">·</span>'}${it?.n>1?`<b>${it.n}</b>`:''}</button>`).join('')}</div>
 <h3 class="inv-subheading">FORJA · MEJORAS DE PICO Y ESPADA</h3><div class="forge-recipe-grid">${forgeProgressCards()}</div>
 <div class="panel-actions"><button class="primary" data-a="resume">VOLVER AL JUEGO</button></div>`;
}
function refreshFurnaceProgress(){if(modalType!=='furnace')return;
 const f=furnaceAtKey();if(!f)return;
 const st=makeFurnaceSlots(f),active=furnaceCanRun(st);
 const pct=active?Math.min(100,Math.floor(st.progressMs/effectiveSmeltMs()*100)):0;
 const bar=$('furnace-job-progress'),label=$('furnace-job-label'),hint=$('furnace-fuel-hint');
 if(bar)bar.style.width=pct+'%';if(label)label.textContent=active?Math.max(1,Math.ceil((effectiveSmeltMs()-st.progressMs)/1000))+' s':'En espera';
 if(hint)hint.textContent='Crédito restante: '+(st.fuelHalf/2).toFixed(1).replace('.0','')+' lingotes · Carbón: 8 · Madera: 1,5';
 for(const name of ['input','fuel','output']){
  const el=document.querySelector(`[data-furnace-slot="${name}"]`);if(!el)continue;
  const obj=st[name],key=obj?obj.id+':'+obj.n:'empty';
  if(el.dataset.content!==key){el.innerHTML=furnaceSlotMarkup(name,obj);el.dataset.content=key;}
 }
}

function itemArt(id,extra='item-art'){
 if(!ITEMS[id])return '';
 return `<img class="${extra}" src="./assets/items/${id}.png" alt="" aria-hidden="true" draggable="false" decoding="async">`;
}
function selectedDescription(it){if(!it)return '<span class="empty-item">Espacio vacío · selecciona un objeto</span>';
 const rune=it.rune||((it.id==='pick'||it.id==='sword')?runeIn(it.id):null);
 return `${itemArt(it.id,'detail-icon')}<span class="detail-copy"><strong>${weaponDisplayName(it.id)}</strong><small>${ITEM_DESCRIPTIONS[it.id]||''}${rune?' · ✧ Runa: '+RUNES[rune]?.label:''}</small></span><b class="detail-count">${it.n>1?'×'+it.n:''}</b>`;}

const RECIPES=[
 {id:'mesa',qty:1,cost:{madera:10,piedra:10}},
 {id:'tablas',qty:4,cost:{madera:1},station:true},
 {id:'palos',qty:4,cost:{tablas:2},station:true},
 {id:'cartuchogel',qty:1,cost:{gel:2},station:true},
 {id:'cuerda',qty:2,cost:{hilo:3},station:true},
 {id:'vendaje',qty:2,cost:{hilo:2,gel:1},station:true},
 {id:'vendajefuerte',qty:2,cost:{hueso:2,hilo:2,gel:1},station:true},
 {id:'tonico',qty:2,cost:{membrana:2,gel:1},station:true},
 {id:'pocionprecision',qty:1,cost:{cristal:2,membrana:1,gel:1},station:true},
 {id:'runa_veneno',qty:1,cost:{colmillo:1,sedanegra:3,cristal:1},station:true},
 {id:'runa_hielo',qty:1,cost:{cristal:4,membrana:3,lingotehierro:1},station:true},
 {id:'runa_veta',qty:1,cost:{cristal:2,lingotecobre:2,hilo:2},station:true},
 {id:'runa_guardia',qty:1,cost:{cristal:2,lingotehierro:2,piedra:3},station:true},
 {id:'horno',qty:1,cost:{piedra:12,tierra:4,cobre:2}},
 {id:'martillo',qty:1,cost:{palos:2,piedra:4},station:true},
 {id:'sword',qty:1,cost:{palos:1,piedra:3},station:true},
 {id:'cofre',qty:1,cost:{tablas:8,piedra:2},station:true},
 {id:'cama',qty:1,cost:{tablas:8,piedra:4},station:true},
 {id:'estandarte',qty:1,cost:{palos:3,cobre:4},station:true},
 {id:'hoguera',qty:1,cost:{piedra:4,palos:2},station:true},
 {id:'puerta',qty:1,cost:{tablas:6},station:true},
 {id:'antorcha',qty:4,cost:{palos:1,carbon:1},station:true},
 {id:'paredmadera',qty:4,cost:{tablas:3},station:true},
 {id:'paredpiedra',qty:4,cost:{piedra:3},station:true},
 {id:'plataforma',qty:4,cost:{tablas:2},station:true},
 {id:'suelopiedra',qty:4,cost:{piedra:3},station:true},
 {id:'lampara',qty:1,cost:{lingotecobre:2,cristal:1,tablas:2},station:true},
 {id:'escudo',qty:1,cost:{lingotecobre:3,tablas:2},station:true},
 ...[['cobre','lingotecobre'],['hierro','lingotehierro'],['oro','lingoteoro']].flatMap(([metal,ingot])=>
  [['casco',3],['pechera',5],['pantalones',4],['botas',2]].map(([part,cost])=>
   ({id:part+'_'+metal,qty:1,cost:{[ingot]:cost,...(part==='pechera'?{tablas:1}:{})},station:true})))
];
let woodCache={key:'',values:[]};
let inventory=Array(40).fill(null),slot=0,structures=new Map(),backs=new Map(),floorTiles=new Map(),placedBlocks=new Map(),
 harvested=new Set(),groundDrops=[],deathBags=[],mainBase=null,respawn={layer:0,x:START.x,y:START.y},hp=100,
 targetCell=null,invSource=null,openChestKey=null,hazardClock=0;
// Alpha 3.6: cinco espacios de equipamiento, sin ocupar la mochila.
const EQUIP_SLOTS=[['head','Casco'],['chest','Pechera'],['legs','Pantalones'],['feet','Botas'],['offhand','Mano secundaria']];
let equipment={head:null,chest:null,legs:null,feet:null,offhand:null},starterGelGranted=false;
// Dos engastes de herramienta pertenecen al personaje; las runas de armadura
// viajan con cada pieza cuando cambia de casilla. Guardado compatible v4.
const RUNES={runa_veneno:{label:'Veneno',targets:['sword']},runa_hielo:{label:'Hielo',targets:['sword']},runa_veta:{label:'Veta',targets:['pick']},runa_guardia:{label:'Guardia',targets:['head','chest','legs','feet','offhand']}};
const RUNE_TARGETS=[['sword','Espada'],['pick','Pico'],['head','Casco'],['chest','Pechera'],['legs','Pantalones'],['feet','Botas'],['offhand','Escudo']];
let toolRunes={sword:null,pick:null},runeTarget='sword';
function runeAllowed(id,target){return !!RUNES[id]?.targets.includes(target);}
function runeTargetReady(target){if(target==='sword'||target==='pick')return quantity(target)>0;
 return !!(equipment[target]&&!(target==='offhand'&&equipment[target].id!=='escudo'));}
function runeIn(target){return target==='sword'||target==='pick'?toolRunes[target]||null:equipment[target]?.rune||null;}
function setRune(target,id){if(target==='sword'||target==='pick')toolRunes[target]=id;
 else if(equipment[target])equipment[target].rune=id;
 if(target==='sword')story39.enchant=id==='runa_veneno'?'veneno':id==='runa_hielo'?'hielo':null;
}
function runePanel(){
 const target=RUNE_TARGETS.some(q=>q[0]===runeTarget)?runeTarget:'sword';
 const current=runeIn(target),ready=runeTargetReady(target);
 const targets=RUNE_TARGETS.map(([id,label])=>`<button type="button" data-rune-target="${id}" class="rune-target ${target===id?'on':''}" ${!runeTargetReady(id)?'disabled':''}><b>${label}</b><small>${runeIn(id)?RUNES[runeIn(id)]?.label||'Runa':'Vacío'}</small></button>`).join('');
 const options=Object.entries(RUNES).filter(([id])=>runeAllowed(id,target)).map(([id,meta])=>`<button type="button" data-rune-apply="${id}" class="rune-choice" ${!ready||quantity(id)<1||current===id?'disabled':''}>${itemArt(id,'rune-choice-art')}<span><b>${meta.label}</b><small>${quantity(id)} disponible${quantity(id)!==1?'s':''}</small></span><strong>${current===id?'EQUIPADA':'ENGASTAR'}</strong></button>`).join('');
 return `<section class="rune-panel"><div class="rune-heading"><strong>✧ ENGASTES · RUNAS</strong><small>Una runa por pieza. Puedes extraerla y cambiarla.</small></div><div class="rune-targets">${targets}</div><p class="rune-equipped">${ready?'Seleccionado: '+RUNE_TARGETS.find(q=>q[0]===target)[1]+'. ':'Selecciona una pieza disponible. '}${current?'Runa actual: '+RUNES[current]?.label:'Engaste vacío.'}</p><div class="rune-choices">${options}</div><div class="rune-actions"><button type="button" data-rune-remove="1" ${!current?'disabled':''}>↩ EXTRAER RUNA</button></div><p class="rune-footnote">Veneno y hielo: espada · Veta: pico · Guardia: armaduras y escudo. Las runas se fabrican en Recetas → Equipo.</p></section>`;
}
function applyRune(target,id){
 if(!runeAllowed(id,target)||!runeTargetReady(target)){toast('La runa no es compatible con esa pieza.',2100,'warning');return false;}
 if(runeIn(target)===id){toast('Esa runa ya está engastada.',1300);return false;}
 if(quantity(id)<1){toast('Primero debes fabricar esa runa en RECETAS.',2200,'warning');return false;}
 const old=runeIn(target),clone=inventory.map(it=>it?{...it}:null);
 if(!removeFrom(clone,id,1))return false;
 if(old&&storeIn(clone,old,1)){toast('Libera espacio para recuperar la runa anterior.',2200,'warning');return false;}
 inventory=clone;setRune(target,id);refreshHotbar();queueSave();showModal('runes');toast('✧ '+RUNES[id].label+' engastada en '+RUNE_TARGETS.find(q=>q[0]===target)[1]+'.',1900);return true;
}
function extractRune(target){const id=runeIn(target);if(!id)return false;
 const clone=inventory.map(it=>it?{...it}:null);
 if(storeIn(clone,id,1)){toast('Necesitas un espacio libre para extraer la runa.',2200,'warning');return false;}
 inventory=clone;setRune(target,null);refreshHotbar();queueSave();showModal('runes');toast('Runa recuperada en la mochila.',1800);return true;
}

const LAMP_CAP=900,LAMP_CHARGE=300;
function equippedLamp(){const it=equipment.offhand;return it?.id==='lampara'?it:null;}
function lampActive(){const it=equippedLamp();return !!(it&&it.on!==false&&Number(it.fuel)>0);}
function totalArmor(){return ['head','chest','legs','feet'].reduce((sum,k)=>sum+(ITEMS[equipment[k]?.id]?.tier||0),0)+3*['head','chest','legs','feet','offhand'].filter(k=>runeIn(k)==='runa_guardia').length;}
function equipmentColor(item){const tier=ITEMS[item?.id]?.tier||0;return ['','#bc8a5a','#b3c3cb','#f0c56e'][tier]||null;}
function equipFromBag(i){const item=inventory[i],target=ITEMS[item?.id]?.equip;if(!target)return;
 const previous=equipment[target];equipment[target]={...item,n:1};
 if(item.n>1){item.n--;if(previous){const rest=storeIn(inventory,previous.id,1);if(rest){item.n++;equipment[target]=previous;toast('Libera espacio para cambiar de equipo.',1800,'warning');return;}}}
 else inventory[i]=previous?{...previous}:null;
 if(target==='offhand')reveal();refreshHotbar();queueSave();showModal('equip');
}
function unequip(slot){const it=equipment[slot];if(!it)return;
 const free=inventory.findIndex(x=>!x);if(free<0){toast('No tienes espacio libre en la mochila.',2000,'warning');return;}
 inventory[free]={...it};equipment[slot]=null;if(slot==='offhand')reveal();refreshHotbar();queueSave();showModal('equip');
}
function refillLamp(){const lamp=equippedLamp();if(!lamp)return;
 lamp.fuel=Math.max(0,Number(lamp.fuel)||0);
 if(lamp.fuel>LAMP_CAP-LAMP_CHARGE){toast('Necesitas al menos 5 minutos libres en el depósito.',1800,'warning');return;}
 if(!removeFrom(inventory,'cartuchogel',1)){toast('Necesitas un cartucho de gel fabricado en la mesa.',2300,'warning');return;}
 lamp.fuel+=LAMP_CHARGE;lamp.on=true;refreshHotbar();refreshLampButton();queueSave();reveal();showModal('equip');
}
function toggleLamp(updateEquipmentPanel=false){const lamp=equippedLamp();if(!lamp)return;
 lamp.on=lamp.on===false;refreshLampButton();reveal();queueSave();
 // El botón circular solo controla la luz. Actualizar la pantalla Personaje
 // únicamente cuando el jugador ya la tiene abierta.
 if(updateEquipmentPanel&&modalType==='equip')showModal('equip');
}
function lampTime(){const lamp=equippedLamp();const seconds=Math.floor(Math.max(0,Number(lamp?.fuel)||0));return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0');}
function refreshLampButton(){const btn=UI.lampBtn;if(!btn)return;const lamp=equippedLamp();const on=lampActive();btn.classList.toggle('hidden',!lamp);if(!lamp)return;btn.classList.toggle('active',on);btn.setAttribute('aria-pressed',String(on));const label=`Lámpara minera ${on?'encendida':'apagada'} · Combustible ${lampTime()}`;btn.title=label;btn.setAttribute('aria-label',label);}
function equipmentPanel(){
 return `<p class="panel-text panel-instructions">Toca una pieza de la mochila para equiparla. Toca una casilla ocupada para retirarla. La mano secundaria acepta un escudo o una lámpara.</p>
 <div class="craft-tabs"><button data-view="bag">MOCHILA</button><button data-view="equip" class="on">PERSONAJE</button><button data-view="runes">✧ RUNAS</button><button data-view="skills">HABILIDADES · NV ${progression.level}</button><button data-view="craft">RECETAS</button></div>
 <div class="equipment-layout"><div class="equipment-slots">${EQUIP_SLOTS.map(([key,label])=>`<button type="button" data-unequip="${key}" class="equipment-slot" aria-label="${label}: ${equipment[key]?ITEMS[equipment[key].id].name:'vacío'}"><span>${label}</span><span class="equipment-slot-visual">${equipment[key]?itemArt(equipment[key].id,'equipment-icon'):'<span class="equipment-empty">+</span>'}</span><small>${equipment[key]?ITEMS[equipment[key].id].name+(runeIn(key)?' · ✧ '+RUNES[runeIn(key)].label:''):'Vacío'}</small></button>`).join('')}</div>
 <div class="equipment-portrait"><canvas id="equipment-preview" width="96" height="128" aria-label="Vista del enano con el equipo"></canvas><div class="equipment-rating">🛡 ${totalArmor()} defensa · ⚔ ${player.weaponTier||0} espada<br>✧ Espada: ${runeIn('sword')?RUNES[runeIn('sword')].label:'vacío'}</div></div></div>
 <div class="lamp-panel"><strong>✦ LÁMPARA MINERA</strong><span>Combustible ${lampTime()} / 15:00 · 1 cartucho = 5 minutos</span><div class="lamp-gauge"><span style="width:${Math.round(Math.max(0,Math.min(1,(equippedLamp()?.fuel||0)/LAMP_CAP))*100)}%"></span></div>
 <div class="lamp-buttons"><button data-lamp="refuel" ${!equippedLamp()||quantity('cartuchogel')<=0||((equippedLamp()?.fuel||0)>LAMP_CAP-LAMP_CHARGE)?'disabled':''}>RECARGAR (×${quantity('cartuchogel')})</button><button data-lamp="toggle" ${!equippedLamp()?'disabled':''}>${lampActive()?'APAGAR':'ENCENDER'}</button></div></div>
 <button type="button" class="rune-open" data-view="runes">✧ RUNAS Y ENGASTES · MEJORAR ESPADA, PICO Y ARMADURAS ▸</button>
 <h3 class="inv-subheading">EQUIPO DISPONIBLE EN LA MOCHILA</h3><div class="equipment-bag">${inventory.map((it,i)=>`<button type="button" data-equip="${i}" ${!ITEMS[it?.id]?.equip?'disabled':''} class="equipment-bag-item" title="${it?ITEMS[it.id].name:'Vacío'}">${it?itemArt(it.id,'furnace-bag-art'):'·'}${it?.n>1?`<b>${it.n}</b>`:''}</button>`).join('')}</div>
 <div class="panel-actions"><button class="primary" data-a="resume">VOLVER</button></div>`;
}
function renderEquipmentPreview(){const c=$('equipment-preview');if(!c)return;
 const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.clearRect(0,0,c.width,c.height);
 const sp=sprites[player.gender+'_down_0'];if(sp)g.drawImage(sp,3,0,90,120);
 const pix=(x,y,w,h,color)=>{if(!color)return;g.fillStyle=color;g.fillRect(x,y,w,h);};
 const head=equipmentColor(equipment.head),chest=equipmentColor(equipment.chest),legs=equipmentColor(equipment.legs),feet=equipmentColor(equipment.feet);
 pix(29,18,37,12,head);pix(26,61,46,23,chest);pix(34,84,14,16,legs);pix(53,84,14,16,legs);pix(27,105,21,11,feet);pix(53,105,21,11,feet);
 if(equipment.offhand?.id==='escudo'){pix(75,56,17,29,'#af895e');pix(80,61,7,20,'#bfc9cb');}
 if(equipment.offhand?.id==='lampara'){pix(78,68,11,15,'#bd925a');pix(81,72,5,7,lampActive()?'#a6e5b8':'#5a646d');}
}
let blueprint=new Map(),ghostCells=[],blueprintMode='line',drawing=null,renderBlueprintPreview=false,blueprintHistory=[];
// Alpha 3.4.6: cada golpe desgasta la pieza; retirar solo al llegar a cero.
// Es un estado temporal del combate/minería y no altera el formato de partida.
let dismantleDamage=new Map(),dismantleFX=null,actionFocus=null,impactSwing=0;
const DISMANTLE_HARDNESS={stonewall:6,woodwall:4,door:4,chest:5,workbench:4,bed:3,torch:2,campfire:3,banner:5};
function dismantleKey(p){return 's:'+p.id;}
function floorDismantleKey(x,y){return 'f:'+builtKey(layer,x,y);}
function dismantleTotal(kind){return DISMANTLE_HARDNESS[kind]||3;}
function demolitionProgress(k){const r=dismantleDamage.get(k);return r?Math.min(r.total,r.hits):0;}
function resetMiningFocus(){actionFocus=null;}
function canDemolishFocused(k){if(actionHeld&&actionFocus&&actionFocus!==k)return false;
 if(actionHeld&&!actionFocus)actionFocus=k;return true;}
function demolitionStrike(k,kind,x,y,done){
 if(!canDemolishFocused(k))return false;
 const total=dismantleTotal(kind),was=dismantleDamage.get(k),power=Math.max(1,Math.floor(player.pick||1));
 const hits=Math.min(total,(was?.hits||0)+power);
 hitFlash=.19;impactSwing=.24;
 dismantleFX={x,y,ttl:.27,seed:Math.round(Math.random()*30)};
 if(navigator.vibrate)try{navigator.vibrate(hits>=total?17:8)}catch{}
 if(hits<total){dismantleDamage.set(k,{x,y,layer,kind,hits,total});scheduleSave();return false;}
 dismantleDamage.delete(k);done();return true;
}

const BLUEPRINT_MAX=160,BUILD_RADIUS=15;
const blueUI={root:$('blueprint-toolbar'),status:$('blueprint-status'),confirm:$('blueprint-confirm'),cancel:$('blueprint-cancel')};
const builtKey=(l,x,y)=>l+':'+Math.floor(x)+':'+Math.floor(y);
const WALL_STRUCTURES=new Set(['stonewall','woodwall']);
function parseBuiltKey(k){const [l,x,y]=String(k).split(':').map(Number);return{layer:l||0,x:x||0,y:y||0};}
function isWallStructure(p){return !!p&&WALL_STRUCTURES.has(p.kind);}
function isSolidStructure(p){return !!p&&(WALL_STRUCTURES.has(p.kind)||(p.kind==='door'&&!p.open));}
function isRoomWall(x,y,l=layer){const p=structureAt(x,y,l);if(p&&(isWallStructure(p)||p.kind==='door'))return true;
 if(renderBlueprintPreview){const k='s:'+builtKey(l,x,y),b=blueprint.get(k)||ghostCells.find(c=>plannedKey(c.id,c.x,c.y,c.layer)===k);if(b)return ['paredpiedra','paredmadera','puerta'].includes(b.id);}
 return false;}
function doorAxis(x,y){
 const lr=+isRoomWall(x-1,y)+ +isRoomWall(x+1,y),ud=+isRoomWall(x,y-1)+ +isRoomWall(x,y+1);
 // Ante una esquina ambigua el acceso se orienta según la pared continua;
 // nunca se reubica ni se altera el estado de la puerta guardada.
 if(ud===2&&lr<2)return 'vertical';
 if(lr===2&&ud<2)return 'horizontal';
 return ud>lr?'vertical':'horizontal';
}
function hitSolidCell(cx,cy,r,x,y){const dx=x-clamp(x,cx,cx+1),dy=y-clamp(y,cy,cy+1);return dx*dx+dy*dy<r*r-0.00001;}
const makeStack=(id,n)=>({id,n});
function startingInventory(){inventory=Array(40).fill(null);inventory[0]=makeStack('pick',1);inventory[1]=makeStack('tierra',8);inventory[2]=makeStack('piedra',8);inventory[3]=makeStack('madera',8);inventory[4]=makeStack('antorcha',4);slot=0;storeIn(inventory,'gel',4);}
function quantity(id,arr=inventory){return arr.reduce((n,it)=>n+(it&&it.id===id?it.n:0),0);}
function storeIn(arr,id,amount){let left=amount,max=ITEMS[id]?.max||99;for(let i=0;i<arr.length&&left>0;i++){let it=arr[i];if(it?.id===id&&it.n<max){let a=Math.min(left,max-it.n);it.n+=a;left-=a;}}
 for(let i=0;i<arr.length&&left>0;i++)if(!arr[i]){let a=Math.min(left,max);arr[i]=makeStack(id,a);left-=a;}return left;}
function dropAt(id,n,x=player.x,y=player.y,l=layer){if(n<=0)return;let k=groundDrops.find(g=>g.id===id&&g.layer===l&&distance(g.x,g.y,x,y)<1.1);if(k){k.n+=n;return;}
 groundDrops.push({id,n,x,y,layer:l});}
function gain(id,n){if(!ITEMS[id]||n<=0)return;const rest=storeIn(inventory,id,n);if(rest)dropAt(id,rest);refreshHotbar();scheduleSave();}
function removeFrom(arr,id,n){if(quantity(id,arr)<n)return false;for(let i=arr.length-1;i>=0&&n>0;i--){let it=arr[i];if(it?.id===id){const a=Math.min(it.n,n);it.n-=a;n-=a;if(it.n<=0)arr[i]=null;}}return true;}
function costsAvailable(cost){return Object.entries(cost).every(([id,n])=>quantity(id)>=n);}
function canCraft(r){return (!r.station||hasBench())&&costsAvailable(r.cost);}
function hasBench(){return [...structures.values()].some(p=>p.layer===layer&&p.kind==='workbench'&&distance(player.x,player.y,p.x,p.y)<4.8);}
function craft(id){const r=RECIPES.find(q=>q.id===id);if(!r)return;
 if(r.station&&!hasBench()){toast('Necesitas estar cerca de una mesa de trabajo.',2300,'warning');return;}
 if(!costsAvailable(r.cost)){toast('Faltan materiales para esta receta.',1900,'warning');return;}
 // All recipes have at least one output slot; reject craft if inventory cannot accept output.
 const clone=inventory.map(q=>q?{...q}:null);for(const [mat,n] of Object.entries(r.cost))removeFrom(clone,mat,n);
 if(storeIn(clone,r.id,r.qty)>0){toast('No hay espacio en la mochila.',2000,'warning');return;}
 inventory=clone;stats.crafted=(stats.crafted||0)+r.qty;refreshHotbar();queueSave();showModal('craft');toast('Fabricado: '+ITEMS[r.id].name,1600,'common');}
function structureAt(x,y,l=layer){return structures.get(builtKey(l,x,y));}
function currentBuilt(){return [...structures.values()].filter(p=>p.layer===layer&&distance(p.x,p.y,player.x,player.y)<35);}
function nearbyWood(){if(layer!==0&&layer!==1)return[];const cx=Math.floor(player.x/6),cy=Math.floor(player.y/6);
 const cacheKey=[layer,cx,cy,harvested.size,structures.size,stats.mined,seed].join(':');if(cacheKey===woodCache.key)return woodCache.values;const found=[];
 for(let yy=cy-5;yy<=cy+5;yy++)for(let xx=cx-5;xx<=cx+5;xx++){
  let x=xx*6+2,y=yy*6+2,k=builtKey(layer,x,y);if(harvested.has(k)||hashInt(xx,yy,302+layer)<.42)continue;
  if(distance(x+.5,y+.5,.5,.5)<3||tileAt(x,y)!==T.FLOOR||structureAt(x,y))continue;
  found.push({id:'wood_'+k,kind:'tree',x:x+.5,y:y+.5,label:layer?'Vigas abandonadas':'Tronco minero',layer});}
 // Two guaranteed lumber caches near spawn so the player can make the first table without long travel.
 if(layer===0)for(const [x,y] of [[4,1],[-5,1],[3,5],[-3,-5]]){let k=builtKey(layer,x,y);if(!harvested.has(k)&&tileAt(x,y)===T.FLOOR&&!structureAt(x,y))found.push({id:'starter_'+k,kind:'tree',x:x+.5,y:y+.5,label:'Troncos de provisiones',layer});}
 woodCache={key:cacheKey,values:found};return found;}
function collectWood(p){const k=builtKey(layer,p.x,p.y);if(harvested.has(k))return;harvested.add(k);gain('madera',4);stats.harvested=(stats.harvested||0)+1;toast('Madera recogida (+4)',1200,'common');refreshHotbar();queueSave();}
function pickedItem(){return inventory[slot];}
function isBuildItem(){return !!ITEMS[pickedItem()?.id]?.place;}
function chooseSlot(i){slot=clamp(i|0,0,7);resetMiningFocus();clearAimSelection();targetCell=null;selectedTile=null;ghostCells=[];refreshHotbar();updateContext();updateBlueprintUI();}
let hotbarInitialized=false;
function refreshHotbar(){const root=$('hotbar');if(!root)return;
 const active=pickedItem();root.dataset.selectedName=active?weaponDisplayName(active.id):'Vacío';
 // Actualizaciones incrementales: los nodos IMG nunca se recrean al picar.
 if(!hotbarInitialized||root.children.length!==8){
  root.innerHTML=Array.from({length:8},(_,i)=>`<button type="button" class="hotbar-slot" data-hot="${i}" aria-label="Casilla ${i+1}"><small>${i+1}</small><b></b><em hidden></em></button>`).join('');
  if(!hotbarInitialized){root.addEventListener('click',e=>{const btn=e.target.closest('[data-hot]');if(btn&&root.contains(btn))chooseSlot(+btn.dataset.hot);});}
  hotbarInitialized=true;
 }
 for(let i=0;i<8;i++){
  const it=inventory[i],b=root.children[i],id=it?.id||'',oldId=b.dataset.item||'';
  b.classList.toggle('selected',slot===i);
  b.setAttribute('aria-pressed',String(slot===i));
  if(oldId!==id){b.dataset.item=id;b.querySelector('b').innerHTML=id?itemArt(id):'';}
  b.title=id?weaponDisplayName(id):'Espacio vacío';
  const n=it?.n||0,quantityElement=b.querySelector('em');
  if(n>1){if(quantityElement.textContent!==String(n))quantityElement.textContent=String(n);quantityElement.hidden=false;}
  else{quantityElement.hidden=true;if(quantityElement.textContent)quantityElement.textContent='';}
  const label=`Casilla ${i+1}${id?' '+weaponDisplayName(id)+', '+n:''}`;
  if(b.getAttribute('aria-label')!==label)b.setAttribute('aria-label',label);
 }
 if(blueprint.size)updateBlueprintUI();
 refreshLampButton();
}

function isFloorItem(id){return id==='plataforma'||id==='suelopiedra';}
function buildKind(id){return ITEMS[id]?.place||null;}
function plannedKey(id,x,y,l=layer){return (isFloorItem(id)?'f:':'s:')+builtKey(l,x,y);}
function placeTarget(){if(targetCell)return targetCell;
 const dx=player.dirX,dy=player.dirY,n=Math.hypot(dx,dy)||1;
 return{x:Math.floor(player.x+dx/n*1.55),y:Math.floor(player.y+dy/n*1.55)};}
function strokeCells(x0,y0,x1,y1,mode,id){
 const out=[],limit=16;
 x1=clamp(x1,x0-limit,x0+limit);y1=clamp(y1,y0-limit,y0+limit);
 if(mode==='single'||!id)return[{x:x0,y:y0}];
 if(mode==='area'||mode==='room'){
  const ax=Math.min(x0,x1),bx=Math.max(x0,x1),ay=Math.min(y0,y1),by=Math.max(y0,y1);
  for(let y=ay;y<=by;y++)for(let x=ax;x<=bx;x++)if(mode==='area'||x===ax||x===bx||y===ay||y===by)out.push({x,y});
 }else{
  let x=x0,y=y0,dx=Math.abs(x1-x0),dy=Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1,err=dx-dy;
  for(let count=0;count<50;count++){
   out.push({x,y});if(x===x1&&y===y1)break;
   const e2=2*err;if(e2>-dy){err-=dy;x+=sx;}if(e2<dx){err+=dx;y+=sy;}
  }
 }
 return out;
}
function blueprintCells(a,b,id,mode=blueprintMode){
 if(!id||!buildKind(id))return[];
 const isMulti=isFloorItem(id)||id==='paredpiedra'||id==='paredmadera';
 const allowed=isMulti?mode:'single';
 return strokeCells(a.x,a.y,b.x,b.y,allowed,id).map(q=>({...q,id,layer}));
}
function validateBlueprintCell(c){
 const {x,y,id}=c,k=builtKey(c.layer,x,y),kind=buildKind(id),old=structures.get(k);
 if(c.layer!==layer||!kind||!inWorld(x,y)||tileAt(x,y,c.layer)!==T.FLOOR)return false;
 if(distance(player.x,player.y,x+.5,y+.5)>BUILD_RADIUS)return false;
 if(isFloorItem(id)){
  // Floors are walkable surfaces, but cannot replace or hide a structure.
  // Block overlaps with both existing structures and walls/doors queued in the same plan.
  if(old||placedBlocks.has(k)||blueprint.has('s:'+k)||ghostCells.some(g=>g.layer===c.layer&&g.x===x&&g.y===y&&!isFloorItem(g.id)))return false;
  if(currentProps().some(p=>p.kind!=='tree'&&distance(p.x,p.y,x+.5,y+.5)<.68&&!structures.has(p.id)))return false;
  return floorAt(x,y,c.layer)!==kind;
 }
 // Do not allow a new wall or furniture on top of a planned floor in the same blueprint.
 if(blueprint.has('f:'+k)||ghostCells.some(g=>g.layer===c.layer&&g.x===x&&g.y===y&&isFloorItem(g.id)))return false;
 if(distance(player.x,player.y,x+.5,y+.5)<.8)return false;
 if(old){if(old.kind===kind)return false;
  if(!(isWallStructure(old)||old.kind==='door')||!['woodback','stoneback','door'].includes(kind))return false;
 }
 if(kind==='stone'||kind==='dirt'){
  if(placedBlocks.has(k))return false;
 }
 if(currentProps().some(p=>p.layer===undefined||p.layer===layer ? distance(p.x,p.y,x+.5,y+.5)<.68 && p.kind!=='tree' && !structures.has(p.id):false))return false;
 return true;
}
function draftSummary(entries=[...blueprint.values()]){
 const need={};let invalid=0;
 for(const c of entries){need[c.id]=(need[c.id]||0)+1;if(!validateBlueprintCell(c))invalid++;}
 const missing=Object.entries(need).filter(([id,n])=>quantity(id)<n).map(([id,n])=>`${ITEMS[id].name} ${quantity(id)}/${n}`);
 return{need,invalid,missing,total:entries.length};
}
function updateBlueprintUI(){
 if(!blueUI.root)return;
 const item=pickedItem(),show=!!buildKind(item?.id)||blueprint.size>0;
 blueUI.root.classList.toggle('hidden',!show);
 if(!show)return;
 if(UI.toast.textContent.includes('Toca una pared')){UI.toast.classList.remove('visible');toastUntil=0;}
 blueUI.root.querySelectorAll('[data-plan-mode]').forEach(b=>{b.classList.toggle('selected',b.dataset.planMode===blueprintMode);b.disabled=!item||!['paredpiedra','paredmadera','plataforma','suelopiedra'].includes(item.id);});
 const data=draftSummary(),lines=Object.entries(data.need).map(([id,n])=>`${ITEMS[id].name} ×${n}`);
 blueUI.status.textContent=data.total?`${data.total} piezas · ${lines.join(', ')}${data.invalid?' · '+data.invalid+' sin sitio':''}${data.missing.length?' · faltan '+data.missing.join(', '):''}`:'Toca o arrastra sobre el mapa para dibujar';
 blueUI.confirm.disabled=!data.total||!!data.invalid||!!data.missing.length;
 blueUI.confirm.textContent=data.total?`✓ CONSTRUIR (${data.total})`:'✓ CONSTRUIR';
 blueUI.cancel.disabled=!data.total;
 const undo=$('blueprint-undo');if(undo)undo.disabled=!blueprintHistory.length;
}
function addBlueprint(a,b=a){
 const id=pickedItem()?.id;
 if(!buildKind(id))return;
 const cells=blueprintCells(a,b,id);
 if(blueprint.size+cells.length>BLUEPRINT_MAX){toast('Plano muy grande. Máximo '+BLUEPRINT_MAX+' piezas.',1800,'warning');return;}
 if(cells.length){blueprintHistory.push(new Map(blueprint));if(blueprintHistory.length>20)blueprintHistory.shift();}
 for(const c of cells){
  const k=plannedKey(c.id,c.x,c.y,c.layer),other=blueprint.get(k);
  if(other&&other.id===c.id)continue;
  blueprint.set(k,c);
 }
 ghostCells=[];targetCell=null;updateBlueprintUI();scheduleSave();
}
function undoBlueprint(){if(!blueprintHistory.length)return;blueprint=blueprintHistory.pop();ghostCells=[];updateBlueprintUI();scheduleSave();}
function clearBlueprint(){blueprint.clear();blueprintHistory=[];ghostCells=[];drawing=null;targetCell=null;updateBlueprintUI();scheduleSave();}
function confirmBlueprint(){
 const entries=[...blueprint.values()],result=draftSummary(entries);
 if(!result.total)return;
 if(result.invalid){toast('Corrige las casillas marcadas en rojo o cancela el plano.',2200,'warning');return;}
 if(result.missing.length){toast('Faltan materiales: '+result.missing.join(', '),2500,'warning');return;}
 const bag=inventory.map(it=>it?{...it}:null);
 for(const [id,n]of Object.entries(result.need))if(!removeFrom(bag,id,n))return;
 const refunds=[];
 for(const c of entries){
  const {x,y,id}=c,k=builtKey(c.layer,x,y),kind=buildKind(id);
  if(isFloorItem(id)){
   const prev=floorTiles.get(k);
   if(prev)refunds.push({id:prev==='platform'?'plataforma':'suelopiedra',x,y});
   floorTiles.set(k,kind);continue;
  }
  const old=structures.get(k);
  if(old){
   refunds.push({id:old.kind==='woodwall'?'paredmadera':old.kind==='stonewall'?'paredpiedra':'puerta',x,y});
   structures.delete(k);dismantleDamage.delete('s:'+k);
  }
  if(kind==='stone'||kind==='dirt'){
   setTile(x,y,kind==='stone'?T.ROCK:T.SOFT);placedBlocks.set(k,id);
  }else{
   const structKind=kind==='woodback'?'woodwall':kind==='stoneback'?'stonewall':kind;
   const p={x:x+.5,y:y+.5,layer,kind:structKind,id:k,open:false,storage:kind==='chest'?Array(16).fill(null):undefined};
   structures.set(k,p);
   if(kind==='banner')mainBase=k;
   if(kind==='bed')respawn={layer,x:x+.5,y:y+.5};
  }
 }
 for(const r of refunds){const rem=storeIn(bag,r.id,1);if(rem)dropAt(r.id,rem,r.x+.5,r.y+.5);}
 inventory=bag;invalidateLights();stats.placed=(stats.placed||0)+entries.length;
 blueprint.clear();blueprintHistory=[];ghostCells=[];targetCell=null;refreshHotbar();updateBlueprintUI();reveal();queueSave();
 toast('Fortaleza: '+entries.length+' piezas construidas.',1900);
}
function tryBuild(){
 const q=placeTarget();if(!buildKind(pickedItem()?.id))return false;
 addBlueprint(q);return true;
}
function floorAt(x,y,l=layer){return floorTiles.get(builtKey(l,x,y));}
function liftFloor(x,y){const k=builtKey(layer,x,y),floor=floorTiles.get(k);if(!floor)return false;
 floorTiles.delete(k);dismantleDamage.delete(floorDismantleKey(x,y));gain(floor==='stonefloor'?'suelopiedra':'plataforma',1);targetCell=null;queueSave();return true;
}
function mineBuiltFloor(x,y){const id=floorAt(x,y);if(!id)return;
 const k=floorDismantleKey(x,y);
 demolitionStrike(k,id==='stonefloor'?'stonewall':'woodwall',x+.5,y+.5,()=>liftFloor(x,y));
}
function mineBuiltStructure(p){
 if(!p||!structures.has(p.id)||p.layer!==layer)return;
 // Un cofre lleno nunca se desmonta, ni pierde progreso/materiales.
 if(p.kind==='chest'&&p.storage?.some(Boolean)){
  if(!actionHeld||actionFocus!==dismantleKey(p))toast('Vacía el cofre antes de demolerlo.',2000,'warning');
  if(actionHeld)actionFocus=dismantleKey(p);return;
 }
 demolitionStrike(dismantleKey(p),p.kind,p.x,p.y,()=>dismantle(p));
}

function dismantle(p){let id=Object.entries(ITEMS).find(([,it])=>it.place===p.kind)?.[0];if(!id&&p.kind==='woodwall')id='paredmadera';if(!id&&p.kind==='stonewall')id='paredpiedra';if(!id)return;
 if(p.kind==='chest'&&p.storage?.some(Boolean)){toast('Vacía el cofre antes de retirarlo.',2100,'warning');return;}
 if(p.kind==='furnace'){
  // Detener el proceso antes de consumir la mena pendiente; no se pierde nada
  // que esté almacenado en los tres slots. El combustible ya quemado no regresa.
  const st=makeFurnaceSlots(p);
  for(const name of ['input','fuel','output'])if(st[name]){
   const obj=st[name],rest=storeIn(inventory,obj.id,obj.n);
   if(rest)dropAt(obj.id,rest,p.x,p.y,p.layer);
   st[name]=null;
  }
  st.progressMs=0;
 }
 structures.delete(p.id);dismantleDamage.delete(dismantleKey(p));invalidateLights();if(p.id===mainBase)mainBase=null;
 if(p.kind==='bed'&&respawn.layer===p.layer&&distance(respawn.x,respawn.y,p.x,p.y)<.1)respawn={layer:0,x:START.x,y:START.y};
 targetCell=null;
 if(p.kind==='furnace'){
  const rest=storeIn(inventory,id,1);if(rest)dropAt(id,rest,p.x,p.y,p.layer);
  refreshHotbar();queueSave();
 }else gain(id,1);
 reveal();queueSave();}
function interactBuilt(p){if(p.kind==='chest'){openChestKey=p.id;showModal('chest');return;}
 if(p.kind==='workbench'){showModal('craft');return;}
 if(p.kind==='anvil'){showModal('forge');return;}
 if(p.kind==='furnace'){openFurnaceKey=p.id;showModal('furnace');return;}
 if(p.kind==='banner'){mainBase=p.id;toast('⚑ Esta es ahora tu fortaleza principal.',2100);queueSave();return;}
 if(p.kind==='bed'){respawn={layer,x:p.x,y:p.y};hp=100;toast('Descansaste · punto de reaparición actualizado.',2200);queueSave();return;}
 if(p.kind==='campfire'){hp=Math.min(100,hp+40);toast('Descansaste junto a la hoguera.',1700,'common');queueSave();return;}
 if(p.kind==='door'){p.open=!p.open;invalidateLights();reveal();queueSave();return;}
 if(isWallStructure(p)){toast('Con el pico equipado puedes demoler este muro.',1500,'common');return;}
 toast('Con el pico equipado puedes demoler esta construcción.',1600,'common');}
function disposalPanel(){const selected=invSource?.where==='bag'?inventory[invSource.i]:null;
 const protectedItem=selected&&(['pick','colmillo'].includes(selected.id)||!!selected.rune);
 return `<div class="inventory-disposal"><div class="dispose-title"><span>▤ BASURERO Y OBJETOS</span><small>${selected?'Seleccionado: '+ITEMS[selected.id].name+' ×'+selected.n:'Selecciona primero una pila de la mochila'}</small></div><div class="dispose-actions"><button data-dispose="drop-one" ${!selected||!!selected.rune?'disabled':''}>⬇ SOLTAR 1</button><button data-dispose="drop-all" ${!selected||!!selected.rune?'disabled':''}>⬇ SOLTAR PILA</button><button data-dispose="delete-one" ${!selected||protectedItem?'disabled':''}>♻ ELIMINAR 1</button><button data-dispose="delete-all" ${!selected||protectedItem?'disabled':''}>♻ ELIMINAR PILA</button></div><small class="dispose-help">Soltar deja los objetos cerca, sin recogerlos automáticamente. Eliminar los destruye tras confirmar. El pico, el colmillo único y el equipo con runas están protegidos.</small></div>`;
}
function groundDropPosition(){const dx=player.dirX||0,dy=player.dirY||1,dir=Math.hypot(dx,dy)||1;
 const probes=[[dx/dir,dy/dir],[-dy/dir,dx/dir],[dy/dir,-dx/dir],[-dx/dir,-dy/dir],[1,0],[-1,0],[0,1],[0,-1]];
 for(const [vx,vy] of probes){for(const range of [2,3]){const x=Math.floor(player.x+vx*range),y=Math.floor(player.y+vy*range);
  if(!inWorld(x,y)||tileAt(x,y)!==T.FLOOR||structureAt(x,y)||distance(x+.5,y+.5,player.x,player.y)<1.45)continue;
  return{x:x+.5,y:y+.5};}}
 return null;
}
function disposeFromBag(mode){if(!invSource||invSource.where!=='bag')return false;
 const i=invSource.i,it=inventory[i];if(!it)return false;
 const deleting=mode.startsWith('delete'),all=mode.endsWith('all'),amount=all?it.n:1;
 if(deleting&&(['pick','colmillo'].includes(it.id)||!!it.rune)){toast(it.rune?'Extrae primero la runa de esta pieza.':'Objeto esencial protegido del basurero.',2400,'warning');return false;}
 if(!deleting&&it.rune){toast('Extrae primero la runa de esa pieza.',2300,'warning');return false;}
 const p=!deleting?groundDropPosition():null;
 if(!deleting&&!p){toast('No hay un suelo libre cercano para soltar objetos.',2200,'warning');return false;}
 if(deleting&&!confirm('¿Eliminar definitivamente '+amount+' × '+ITEMS[it.id].name+'? Esta acción no se puede deshacer.'))return false;
 it.n-=amount;if(it.n<=0)inventory[i]=null;
 if(p)dropAt(it.id,amount,p.x,p.y,layer);
 invSource=null;refreshHotbar();queueSave();showModal('bag');toast(deleting?'♻ Objetos eliminados.':'Objetos soltados sobre el suelo cercano.',1800);return true;
}
function runesScreen(){return `<p class="panel-text panel-instructions">Las runas se fabrican en Recetas → Equipo. Elige una pieza y engasta la runa compatible; puedes extraerla para recuperarla.</p><div class="craft-tabs"><button data-view="bag">MOCHILA</button><button data-view="equip">PERSONAJE</button><button data-view="runes" class="on">✧ RUNAS</button><button data-view="craft">RECETAS</button></div>${runePanel()}<div class="panel-actions"><button class="primary" data-a="resume">VOLVER AL JUEGO</button></div>`;}
function inventoryPanel(){let preview=null;if(invSource){let arr=invSource.where==='bag'?inventory:structures.get(openChestKey)?.storage;preview=arr?.[invSource.i]||null;}else preview=pickedItem();
 return `<p class="panel-text panel-instructions">40 espacios: 8 rápidos + 32 de mochila. Toca un objeto para ver su nombre y descripción; toca otro espacio para moverlo. Mantén presionado para dividir pilas.</p><div class="craft-tabs"><button data-view="bag" class="on">MOCHILA</button><button data-view="craft">RECETAS</button><button data-view="forge">FORJA</button><button data-view="equip">PERSONAJE</button><button data-view="runes">✧ RUNAS</button></div><div class="item-details" aria-live="polite">${selectedDescription(preview)}</div><div class="inventory40">${inventory.map((it,i)=>slotHtml(it,i,'bag')).join('')}</div>${disposalPanel()}<p class="panel-text subtle">Hotbar: casilla ${slot+1} · Pico ${pickTierName()} · Nivel ${player.pick||1}</p><div class="panel-actions"><button class="primary" data-a="resume">SEGUIR EXPLORANDO</button></div>`;}
function slotHtml(it,i,where){return `<button class="item-slot ${(invSource?.where===where&&invSource?.i===i)?'chosen':''} ${(where==='bag'&&i===slot)?'hot-selected':''}" data-itemslot="${i}" data-where="${where}" title="${it?ITEMS[it.id].name:'Espacio vacío'}" aria-label="${where} casilla ${i+1}${it?' '+ITEMS[it.id]?.name+', '+it.n:''}"><span class="item-symbol">${it?itemArt(it.id):''}</span><span class="item-index">${i<8&&where==='bag'?i+1:''}</span>${it&&it.n>1?`<span class="item-count">${it.n}</span>`:''}</button>`;}
function craftPanel(){const recipes=RECIPES.filter(r=>recipeCategory==='todos'||RECIPE_CATEGORY[r.id]===recipeCategory);
 return `<p class="panel-text panel-instructions">Para extraer oro y cristal necesitas el PICO DE COBRE. Abre la pestaña FORJA y usa 3 lingotes de cobre + 1 madera cerca de una mesa, horno o yunque. Las recetas normales se fabrican aquí.</p><div class="craft-tabs"><button data-view="bag">MOCHILA</button><button data-view="craft" class="on">RECETAS</button><button data-view="forge">FORJA</button><button data-view="equip">PERSONAJE</button><button data-view="runes">✧ RUNAS</button></div><div class="recipe-categories" role="group" aria-label="Filtrar recetas">${CATEGORY_LIST.map(([id,label])=>`<button type="button" data-category="${id}" aria-pressed="${recipeCategory===id}" class="${recipeCategory===id?'selected':''}">${label}</button>`).join('')}</div><div class="craft-list">${recipes.map(r=>`<button data-craft="${r.id}" class="recipe ${canCraft(r)?'available':''}" title="${ITEM_DESCRIPTIONS[r.id]}"><span class="recipe-icon">${itemArt(r.id)}</span><span class="recipe-copy"><b>${ITEMS[r.id].name} <span class="recipe-yield">×${r.qty}</span></b><span class="recipe-description">${ITEM_DESCRIPTIONS[r.id]}</span><span class="recipe-ingredients">${Object.entries(r.cost).map(([id,n])=>`<span class="recipe-ingredient ${quantity(id)>=n?'has-material':'missing-material'}" title="${ITEMS[id].name}">${itemArt(id,'material-art')}<span>${quantity(id)}/${n}</span></span>`).join('')}${r.station?'<span class="recipe-station">⚒ MESA</span>':''}</span></span><strong>${canCraft(r)?'FABRICAR':r.station&&!hasBench()?'MESA':'FALTAN'}</strong></button>`).join('')}</div><div class="panel-actions"><button class="primary" data-a="resume">VOLVER</button></div>`;}
function chestPanel(){const chest=structures.get(openChestKey);if(!chest||chest.kind!=='chest')return '<p>Cofre no encontrado.</p>';
 let arr=invSource?.where==='chest'?chest.storage:inventory,preview=invSource?arr?.[invSource.i]:null;
 return `<p class="panel-text panel-instructions">Cofre de madera · 16 espacios. Toca un objeto y luego su destino para transferirlo.</p><div class="craft-tabs"><button data-quick="deposit">DEPOSITAR MATERIALES</button></div><div class="item-details">${selectedDescription(preview)}</div><h3 class="inv-subheading">COFRE</h3><div class="inventory40 chest-grid">${chest.storage.map((it,i)=>slotHtml(it,i,'chest')).join('')}</div><h3 class="inv-subheading">MOCHILA</h3><div class="inventory40">${inventory.map((it,i)=>slotHtml(it,i,'bag')).join('')}</div><div class="panel-actions"><button class="primary" data-a="resume">CERRAR COFRE</button></div>`;}

function moveStack(from,to,split=false){const first=from.where==='bag'?inventory:structures.get(openChestKey)?.storage;
 const second=to.where==='bag'?inventory:structures.get(openChestKey)?.storage;if(!first||!second)return;
 const src=first[from.i],dst=second[to.i];if(!src)return;let amount=split?Math.ceil(src.n/2):src.n;
 if(first===second&&from.i===to.i)return;
 if(dst?.id===src.id){let moved=Math.min(amount,(ITEMS[src.id]?.max||99)-dst.n);dst.n+=moved;src.n-=moved;if(src.n<=0)first[from.i]=null;}
 else if(!dst){second[to.i]={...src,n:amount};src.n-=amount;if(src.n<=0)first[from.i]=null;}
 else if(!split){first[from.i]=dst;second[to.i]=src;}
 refreshHotbar();queueSave();}
let pointerHold=null,splitNext=false;
function hookInventory(body,type){body.querySelectorAll('[data-dispose]').forEach(b=>b.addEventListener('click',()=>disposeFromBag(b.dataset.dispose)));body.querySelectorAll('[data-category]').forEach(b=>b.addEventListener('click',()=>{recipeCategory=b.dataset.category;showModal('craft');}));body.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{invSource=null;showModal(b.dataset.view)}));
 body.querySelectorAll('[data-craft]').forEach(b=>b.addEventListener('click',()=>craft(b.dataset.craft)));
 body.querySelectorAll('[data-quick]').forEach(b=>b.addEventListener('click',()=>{const c=structures.get(openChestKey);if(!c)return;for(let i=0;i<inventory.length;i++){
  let q=inventory[i];if(!q||ITEMS[q.id]?.max===1)continue;let rem=storeIn(c.storage,q.id,q.n);if(rem===0)inventory[i]=null;else q.n=rem;
 }queueSave();refreshHotbar();showModal('chest')}));
 body.querySelectorAll('[data-itemslot]').forEach(b=>{
  b.addEventListener('contextmenu',e=>{e.preventDefault();splitNext=true;});
  b.addEventListener('pointerdown',()=>{clearTimeout(pointerHold);pointerHold=setTimeout(()=>{splitNext=true;b.classList.add('chosen');},550);});
  ['pointerup','pointercancel','pointerleave'].forEach(ev=>b.addEventListener(ev,()=>clearTimeout(pointerHold)));
  b.addEventListener('click',()=>{const where=b.dataset.where,i=+b.dataset.itemslot,arr=where==='bag'?inventory:structures.get(openChestKey)?.storage;
   if(!arr)return;
   if(invSource){moveStack(invSource,{where,i},splitNext);invSource=null;splitNext=false;showModal(type);}
   else if(arr[i]){invSource={where,i};showModal(type);}
   else if(where==='bag'&&i<8){slot=i;refreshHotbar();showModal(type);}
  });
 });}
function collectDrops(){let changed=false;for(let i=groundDrops.length-1;i>=0;i--){const d=groundDrops[i];if(d.layer!==layer||distance(player.x,player.y,d.x,d.y)>1.05)continue;
 const before=d.n,rest=storeIn(inventory,d.id,d.n);if(rest===0)groundDrops.splice(i,1);else d.n=rest;if(rest<before)changed=true;}
 for(let i=deathBags.length-1;i>=0;i--){const b=deathBags[i];if(b.layer!==layer||distance(player.x,player.y,b.x,b.y)>1.2)continue;
 const remaining=[];for(const q of b.items){let n=storeIn(inventory,q.id,q.n);if(n)remaining.push(makeStack(q.id,n));}b.items=remaining;
 if(!remaining.length){deathBags.splice(i,1);toast('Recuperaste tu mochila de expedición.',1900);}changed=true;}if(changed){refreshHotbar();scheduleSave();}}
function die(){clearAimSelection();selectedEnemy=null;dismantleDamage.clear();dismantleFX=null;resetMiningFocus();const pack=[];for(let i=2;i<inventory.length;i++){let it=inventory[i];if(!it||ITEMS[it.id]?.max===1)continue;
 let count=Math.floor(it.n*.30);if(count){pack.push(makeStack(it.id,count));it.n-=count;if(!it.n)inventory[i]=null;}}
 if(pack.length)deathBags.push({layer,x:player.x,y:player.y,items:pack});stats.deaths=(stats.deaths||0)+1;hp=100;
 layer=respawn.layer;player.x=respawn.x;player.y=respawn.y;if(!canMove(player.x,player.y))player.x=.5,player.y=.5;
 screen.camX=player.x;screen.camY=player.y;selectedTile=null;targetCell=null;reveal();refreshHotbar();queueSave();toast('Has reaparecido. Recupera tu mochila en el mapa.',3000,'warning');}

// ALPHA 3.9.1 — Galería de la Viuda y primer jefe con combate por turnos.
// No altera la clave de IndexedDB ni la versión del guardado existente.
const DUNGEON_ROOMS=[
 {id:'entrada',x0:22,x1:35,y0:-5,y1:5},{id:'derrumbe',x0:42,x1:57,y0:-13,y1:-1},
 {id:'despacho',x0:63,x1:78,y0:2,y1:14},{id:'seda',x0:85,x1:101,y0:-14,y1:-1},
 {id:'santuario',x0:103,x1:115,y0:6,y1:17},{id:'refugio',x0:121,x1:135,y0:-1,y1:8},
 {id:'nido',x0:141,x1:165,y0:-13,y1:13},{id:'tesoro',x0:174,x1:187,y0:-5,y1:5}];
const DUNGEON_PATHS=[[[19,3],[22,3],[22,0]],[[19,0],[23,0]],[[34,0],[39,0],[39,-8],[43,-8]],[[56,-8],[60,-8],[60,8],[64,8]],[[77,8],[81,8],[81,-8],[86,-8]],[[100,-8],[105,-8],[105,11],[108,11]],[[114,11],[118,11],[118,3],[122,3]],[[134,3],[143,3]],[[164,3],[179,3]]];
const DUNGEON_SEALS=['derrumbe','seda'];
function dungeonRoom(x,y){return DUNGEON_ROOMS.find(r=>x>=r.x0&&x<=r.x1&&y>=r.y0&&y<=r.y1)||null;}
function dungeonSealsReady(){return DUNGEON_SEALS.every(id=>story39.seals.includes(id));}
function dungeonCorridor(x,y){for(const path of DUNGEON_PATHS){for(let i=1;i<path.length;i++){const [ax,ay]=path[i-1],[bx,by]=path[i];if(ax===bx&&Math.abs(x-ax)<=1&&y>=Math.min(ay,by)-1&&y<=Math.max(ay,by)+1)return true;if(ay===by&&Math.abs(y-ay)<=1&&x>=Math.min(ax,bx)-1&&x<=Math.max(ax,bx)+1)return true;}}return false;}
function dungeonDecoration(kind,x,y){return{kind,id:`decor_${kind}_${x}_${y}`,x:x+.5,y:y+.5,layer:1,decorative:true};}
const STORY_FRAGMENTS={
  entrance:{title:'La Galería Silenciosa',body:'Un tablón carbonizado conserva un aviso: «La galería queda clausurada por orden del Capataz. Nadie debe seguir los golpes que vienen del interior».',chapter:'Capítulo I · Las minas abandonadas'},
  supplies:{title:'Nota del vigilante',body:'«Algo arrastra los carros durante la noche. Esta mañana hallamos seda sobre las lámparas. Nadie quiere descender después del toque de campana».',chapter:'Capítulo I · Las minas abandonadas'},
  miners:{title:'La última guardia',body:'«Los hombres abandonaron sus herramientas. Unos dicen que hay una araña enorme. Otros afirman que su nido no estaba aquí antes de que la gran forja se apagara».',chapter:'Capítulo I · Las minas abandonadas'},
  foreman:{title:'Diario del capataz · Día 47',body:'«Sellamos la galería oriental. Los ocho ojos brillaron detrás del carbón. La criatura no nació aquí: huyó de algo que despertó debajo de los hornos antiguos. Si alguien encuentra este diario, que no siga sus pasos».',chapter:'Capítulo I · La verdad enterrada'},
  widow:{title:'La última seda',body:'La Viuda de Carbón era una guardiana de los túneles exteriores. El miedo y el hambre la transformaron cuando la forja dejó de arder. Sus telarañas cubren una inscripción: «El corazón de la montaña aún late, pero ya no pertenece a los clanes».',chapter:'Capítulo I · Tras la batalla'},
  secret:{title:'El Sello del Primer Fuego',body:'Una placa bajo el nido muestra el emblema de siete guardianes. Uno de los símbolos fue borrado deliberadamente. En el reverso, una dirección: «Busca la sala de las esporas; allí guardamos la siguiente llave».',chapter:'Capítulo II · Una nueva pista'},
  silk:{title:'El hilo que no debe romperse',body:'«El último vigilante escondió un cofre entre las redes. La Viuda protege algo peor que a sí misma».',chapter:'Capítulo I · Galerías de seda'},
  nest:{title:'El último capullo',body:'Bajo una losa encuentras herramientas envueltas en seda negra. El nido conserva recuerdos de los mineros desaparecidos.',chapter:'Capítulo I · Bajo el nido'},
  seal_rubble:{title:'Primer mecanismo · La piedra quebrada',body:'Una inscripción enana advierte: «Dos juramentos cierran la cámara. Uno yace bajo el derrumbe; el otro, donde la seda cubre las estrellas».',chapter:'Capítulo I · Los dos sellos'},
  seal_silk:{title:'Segundo mecanismo · El juramento de seda',body:'«No buscamos encerrar a la criatura. Sellamos el camino para protegerla de lo que viene del fuego apagado».',chapter:'Capítulo I · Los dos sellos'},
  seal:{title:'El altar de los guardianes',body:'La placa indica que los sellos fueron construidos antes de la caída del reino. No parecen obra de la Viuda.',chapter:'Capítulo I · El santuario'}
};
// Alpha 3.9.2 — Diario ordenado: el orden NO depende de cuándo se encuentra cada pista.
// Las notas existentes de 3.9/3.9.1 conservan sus IDs para migrar las partidas.
Object.assign(STORY_FRAGMENTS,{
 remains_entrance:{title:'Un casco sin dueño',body:'«Nos ordenaron regresar al amanecer, pero los túneles comenzaron a susurrar antes de la campana. Nadie ha visto al último relevo».',chapter:'Capítulo I · Las minas abandonadas'},
 remains_rubble:{title:'El minero bajo las piedras',body:'«El primer sello fue tallado antes del derrumbe. No es una prisión para la araña: alguien quería que las galerías permanecieran cerradas».',chapter:'Capítulo I · Las minas abandonadas'},
 remains_silk:{title:'Una advertencia atrapada en seda',body:'«No mires los ojos del fondo de la galería. Quien tocó los capullos dejó de responder a nuestras voces».',chapter:'Capítulo I · Las minas abandonadas'},
 remains_nest:{title:'Las últimas palabras del vigilante',body:'«Si logras salir de aquí, cuenta que la Viuda no llegó primero. Algo la obligó a abandonar las profundidades».',chapter:'Capítulo I · Las minas abandonadas'}
});
const JOURNAL_CHAPTERS=[
 {id:'prologue',name:'Prólogo',subtitle:'El último llamado',description:'El regreso al reino olvidado.'},
 {id:'1',name:'Capítulo I',subtitle:'Las minas abandonadas',description:'Los últimos días de la Galería Silenciosa.'},
 {id:'2',name:'Capítulo II',subtitle:'El bosque de hongos',description:'Las señales que dejó el Primer Fuego.'},
 {id:'3',name:'Capítulo III',subtitle:'Las ruinas del reino',description:'Próximamente.'},
 {id:'4',name:'Capítulo IV',subtitle:'Las cavernas de cristal',description:'Próximamente.'}
];
const JOURNAL_SEQUENCE={
 '1':['entrance','remains_entrance','supplies','miners','seal_rubble','remains_rubble','foreman','silk','remains_silk','seal_silk','seal','nest','remains_nest','widow'],
 '2':['secret']
};
const JOURNAL_NOTE_CHAPTER=Object.fromEntries(Object.entries(JOURNAL_SEQUENCE).flatMap(([chapter,ids])=>ids.map(id=>[id,chapter])));
const journalState={chapter:'1',selected:null};
function chapterFoundCount(id){return (JOURNAL_SEQUENCE[id]||[]).filter(k=>story39.clues.includes(k)).length;}
function freshStory39(){return{prologueSeen:false,introSeen:false,widowDefeated:false,gateOpen:false,seeded:false,dungeonLayoutVersion:0,seals:[],checkpoint:false,clues:[],openedChests:[],remainsSearched:[],enchant:null};}
let story39=freshStory39(),storyScene=null,bossBattle=null,pendingBattle39=null;
function learnLore(id){if(!STORY_FRAGMENTS[id]||story39.clues.includes(id))return false;story39.clues.push(id);journalState.chapter=JOURNAL_NOTE_CHAPTER[id]||'1';journalState.selected=id;queueSave();return true;}
function dungeonTile(x,y){
 const pt=dungeonLocal(x,y);x=pt.x;y=pt.y;
 if(x<19||x>190||y< -21||y>21)return null;
 return dungeonRoom(x,y)||dungeonCorridor(x,y)?T.FLOOR:T.ROCK;
}
function inDungeon(x,y,l=layer){if(l!==1)return false;const pt=dungeonLocal(x,y);return pt.x>=19&&pt.x<=190&&pt.y>=-21&&pt.y<=21;}
// Los restos usan los PNG del usuario: no se reemplazan por figuras genéricas.
const REMAINS_SPRITE_IDS=['co_03','co_04','co_11','co_19','co_22','co_24','co_29','co_37','co_48','co_49','co_21','co_39','co_44','co_60','co_61','co_63','sk_04','sk_08','sk_18','sk_33','sk_45'];
const REMAINS_IMAGES=new Map();
for(const id of REMAINS_SPRITE_IDS){const img=new Image();img.src='./assets/decor/remains/'+id+'.png';REMAINS_IMAGES.set(id,img);}
function remainsProp(id,x,y,sprite,mode='decor',l=1,note=null){
 const searched=(story39.remainsSearched||[]).includes(id);
 return{kind:'mine_remains',id:'remains_'+id,x:x+.5,y:y+.5,layer:l,sprite,
   decorative:mode==='decor',mode,note,searched,label:mode==='decor'?'Restos de una expedición':searched?'Restos ya examinados':mode==='lore'?'Restos con una nota':'Restos de minero · registrar'};
}
const DUNGEON_REMAINS=[
 ['entrada_casco',27,2,'co_03','decor'],['entrada_mochila',31,3,'co_22','loot'],['entrada_nota',29,-2,'co_60','lore','remains_entrance'],
 ['derrumbe_enterrado',44,-5,'co_48','decor'],['derrumbe_huesos',53,-3,'co_21','decor'],['derrumbe_diario',46,-10,'sk_04','lore','remains_rubble'],
 ['despacho_descanso',67,11,'co_29','loot'],['despacho_esqueleto',75,10,'sk_18','decor'],
 ['seda_huesos',89,-12,'co_24','decor'],['seda_mochila',92,-4,'co_49','loot'],['seda_advertencia',97,-6,'co_63','lore','remains_silk'],
 ['santuario_resto',107,14,'sk_33','decor'],['santuario_enterrado',113,15,'co_61','decor'],
 ['refugio_miner',124,6,'co_39','loot'],
 ['nido_1',146,-8,'co_48','decor'],['nido_2',160,6,'co_63','decor'],['nido_3',153,7,'sk_08','decor'],
 ['nido_testigo',162,-7,'co_60','lore','remains_nest'],['tesoro_restos',180,3,'co_44','decor']
];
// Variación procedural ligera: pocos restos por región, sin saturar el suelo.
const remainsChunkCache=new Map();
function nearbyRemains(l){
 if(l<1||l>6)return[];
 const result=[],cx=Math.floor(player.x/CH),cy=Math.floor(player.y/CH);
 for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
  const a=cx+dx,b=cy+dy,k=seed+':'+l+':'+a+':'+b;
  let found=remainsChunkCache.get(k);
  if(!found){found=[];
   for(let z=0;z<2;z++){
    if(hashInt(a*23+z,b*19,l+916)<.56)continue;
    const x=a*CH+3+Math.floor(hashInt(a*57+z,b*31,l+918)*25),y=b*CH+3+Math.floor(hashInt(a*29+z,b*37,l+919)*25);
    if(!inWorld(x,y)||Math.abs(x)<9&&Math.abs(y)<9||inDungeon(x,y,l)||tileAt(x,y,l)!==T.FLOOR)continue;
    const index=Math.floor(hashInt(x,y,l+891)*REMAINS_SPRITE_IDS.length);
    const mode=hashInt(x,y,l+894)>.78?'loot':'decor';
    found.push(remainsProp('world_'+l+'_'+x+'_'+y,x,y,REMAINS_SPRITE_IDS[index],mode,l));
   }
   remainsChunkCache.set(k,found);
   if(remainsChunkCache.size>220)remainsChunkCache.delete(remainsChunkCache.keys().next().value);
  }
  for(const f of found)if(!structureAt(f.x,f.y,l))result.push({...f,searched:(story39.remainsSearched||[]).includes(f.id.slice(8))});
 }
 return result;
}
function interactWithRemains(p){
 if(p.mode==='decor')return;
 const key=p.id.slice(8);
 if((story39.remainsSearched||[]).includes(key)){toast('Estos restos ya fueron examinados.',1650,'common');return;}
 story39.remainsSearched.push(key);
 if(p.note){learnLore(p.note);toast('Hallaste un registro de la expedición. Se añadió al Diario.',2600);queueSave();showModal('journal');return;}
 // Botín controlado, calculado de forma determinista por el ID, una sola vez.
 const v=hashInt(Math.floor(p.x),Math.floor(p.y),p.layer+770);
 const loot=v<.32?[['carbon',2],['antorcha',1]]:v<.66?[['vendaje',1],['hilo',2]]:[['piedra',3],['madera',2]];
 for(const [id,n] of loot)gain(id,n);
 stats.remainsLooted=(stats.remainsLooted||0)+1;queueSave();
 toast('Registraste los restos: '+loot.map(([id,n])=>ITEMS[id].name+' ×'+n).join(' · '),2500);
}
function dungeonProps(){
 const p=[
  {kind:'dungeonentrance',id:'dungeon_entrance',x:23.5,y:.5,label:'Galería Silenciosa · la vieja entrada'},
  {kind:'torch',id:'dungeon_torch_1',x:29.5,y:-3.5,label:'Lámpara del vigilante'},
  {kind:'dungeonchest',id:'dchest_supplies',loot:'supplies',x:31.5,y:2.5,label:'Cofre del vigilante'},
  {kind:'dungeonseal',seal:'derrumbe',id:'sello_derrumbe',x:49.5,y:-9.5,label:story39.seals.includes('derrumbe')?'Sello del derrumbe · activo':'Sello del derrumbe · sin activar'},
  {kind:'dungeonchest',id:'dchest_miners',loot:'miners',x:72.5,y:10.5,label:'Cofre de los mineros'},
  {kind:'dungeonrecord',id:'dungeon_foreman',x:68.5,y:4.5,label:'Diario del capataz'},
  {kind:'torch',id:'dungeon_torch_2',x:64.5,y:7.5,label:'Lámpara del despacho'},
  {kind:'dungeonseal',seal:'seda',id:'sello_seda',x:96.5,y:-10.5,label:story39.seals.includes('seda')?'Sello de seda · activo':'Sello de seda · sin activar'},
  {kind:'dungeonchest',id:'dchest_silk',loot:'silk',x:91.5,y:-3.5,label:'Cofre atrapado en seda'},
  {kind:'dungeonrecord',id:'dungeon_shrine_record',note:'seal',x:109.5,y:8.5,label:'Inscripción de los guardianes'},
  {kind:'dungeoncheckpoint',id:'dungeon_checkpoint',x:127.5,y:3.5,label:'Refugio de la última antorcha'},
  {kind:'dungeongate',id:'dungeon_nest_gate',x:137.5,y:3.5,label:dungeonSealsReady()?'Portón del nido · abierto':'Portón del nido · cerrado'},
  {kind:'dungeonchest',id:'dchest_nest',loot:'nest',x:150.5,y:9.5,label:'Reliquias bajo los capullos'},
  ...(story39.widowDefeated?[]:[{kind:'dungeonboss',id:'boss_widow',x:155.5,y:-.5,label:'Viuda de Carbón · La Tejedora de las Galerías Muertas'}]),
  {kind:'dungeonseal',id:'dungeon_seal',x:170.5,y:3.5,label:story39.gateOpen?'Sello del Primer Fuego abierto':'Sello del Primer Fuego cerrado'},
  {kind:'dungeonchest',id:'dchest_secret',loot:'secret',x:182.5,y:.5,label:'Arca del Primer Fuego'}
 ];
 // Utilería pixel art: salas reconocibles sin bloquear ni interferir con la MANO.
 for(const [kind,pts] of Object.entries({
  rail:[[24,0],[26,0],[29,0],[32,0],[39,-2],[39,-6],[44,-8],[47,-8],[53,-8]],
  wagon:[[32,-2],[45,-10]],crate:[[27,3],[34,3],[66,11],[75,12]],
  rubble:[[44,-4],[46,-12],[53,-4],[57,-10],[56,-2]],
  shelf:[[64,4],[74,4],[75,6]],desk:[[69,6]],
  cocoon:[[87,-11],[94,-13],[98,-5],[105,12],[111,16],[144,-10],[151,-11],[160,-10],[147,11],[161,10]],
  egg:[[89,-9],[99,-12],[145,5],[157,8],[162,-4]],
  runestone:[[106,8],[112,8]],
  bones:[[91,-4],[149,-6],[163,3]],
  coal:[[45,-5],[52,-11],[94,-6],[150,-9],[162,8]],
  webdecor:[[85,-7],[93,-7],[99,-3],[143,2],[148,-2],[154,5],[163,0]],
  lamp:[[128,0],[143,-4],[164,5]]
 }))for(const [x,y] of pts)p.push(dungeonDecoration(kind,x,y));
 for(const [id,x,y,sprite,mode,note] of DUNGEON_REMAINS)p.push(remainsProp('dungeon_'+id,x,y,sprite,mode,1,note));
 if(worldLayoutVersion)for(const prop of p){const v=dungeonPoint(prop.x,prop.y);prop.x=v.x;prop.y=v.y;}
 return p;
}
function seedDungeon(){if(story39.dungeonLayoutVersion>=2)return;
 // Migración 3.9: preservamos la exploración y los cofres, pero renovamos la distribución.
 for(const [k,v] of webs){if(v.owner==='dungeon')webs.delete(k);}
 story39.dungeonLayoutVersion=2;story39.seeded=true;
 for(const [x,y] of [[26,2],[34,-2],[43,-7],[51,-6],[60,4],[72,7],[79,7],[87,-7],[90,-9],[95,-6],[98,-11],[104,8],[111,13],[124,5],[145,4],[153,-8],[157,6],[161,-2]]){
  const pt=dungeonPoint(x+.5,y+.5),wx=Math.floor(pt.x),wy=Math.floor(pt.y),k=webKey(wx,wy,1);
  if(!webs.has(k))webs.set(k,{x:wx,y:wy,layer:1,hp:2,owner:'dungeon'});
 }
 invalidateLights();scheduleSave();
}
function activateDungeonSeal(p){const id=p.seal;if(!id)return;
 if(story39.seals.includes(id)){toast('El sello ya está activado. Busca el otro mecanismo.',1900);return;}
 story39.seals.push(id);learnLore(id==='derrumbe'?'seal_rubble':'seal_silk');
 if(dungeonSealsReady())toast('¡Ambos sellos activados! El portón del nido se ha abierto.',3400);
 else toast('El sello ancestral responde. Aún falta un segundo mecanismo.',2400);
 queueSave();invalidateLights();reveal();
}
function activateDungeonCheckpoint(){
 story39.checkpoint=true;respawn={layer:1,...dungeonPoint(127.5,3.5)};hp=100;stamina=MAX_STAMINA;
 refreshCombatUI();queueSave();toast('Refugio activado · Vida recuperada · Punto de reaparición actualizado.',3100);
}
function openDungeonChest(p){
 if((p.loot==='secret'||p.loot==='nest')&&!story39.widowDefeated){toast('El cofre está protegido por un sello de la Viuda.',2300,'warning');return;}
 if(story39.openedChests.includes(p.id)){
  toast('Cofre registrado en el Diario. Su contenido ya fue recogido.',2300,'common');showModal('journal');return;
 }
 story39.openedChests.push(p.id);learnLore(p.loot);
 const loot=p.loot==='supplies'?[['pocionprecision',1],['vendaje',3],['hilo',4]]:p.loot==='miners'?[['carbon',7],['vendajefuerte',2],['hilo',5],['tonico',2]]:p.loot==='silk'?[['vendaje',2],['hilo',5],['pocionprecision',1]]:p.loot==='nest'?[['sedanegra',3],['cristal',2]]:[['colmillo',1],['sedanegra',4],['cristal',3]];
 for(const [id,n] of loot)gain(id,n);if(p.loot==='supplies'&&quantity('sword')===0)gain('sword',1);queueSave();toast('¡Cofre abierto! Nuevo fragmento de historia en el Diario.',2500);showModal('journal');
}
function readForeman(note='foreman'){const wasNew=learnLore(note);if(wasNew){gain('pocionprecision',1);toast('Encontraste la última página del capataz y una poción.',2300);}showModal('journal');}
function sceneSteps(type){
 if(type==='prologue')return[
  {img:'forge',title:'EL ÚLTIMO LLAMADO',text:'Durante siglos, el fuego de Khaz’dûn dio luz a los clanes que vivían bajo la montaña.'},
  {img:'ruin',title:'LA NOCHE EN QUE CALLARON LAS FORJAS',text:'Una noche, las máquinas se detuvieron. Las galerías quedaron vacías y los guardianes olvidaron sus juramentos.'},
  {img:'return',title:'UN NOMBRE EN LA OSCURIDAD',text:'Eres el último heredero de un clan olvidado. Regresas para encontrar la Última Fragua y descubrir qué apagó su fuego.'}
 ];
 if(type==='widow')return[
  {img:'widow',title:'CAPÍTULO I · LA GALERÍA SILENCIOSA',text:'Tras los dos juramentos de piedra, un pasillo cubierto de capullos conduce al nido. Los últimos mineros nunca regresaron de esta cámara.'},
  {img:'widowclose',title:'VIUDA DE CARBÓN',text:'La Tejedora de las Galerías Muertas. Dos sellos antiguos protegían su nido. Ahora, ocho ojos rojos despiertan entre la seda.'}
 ];
 return[
  {img:'widow',title:'EL SILENCIO DESPUÉS DEL NIDO',text:'La Viuda cae y sus patas dejan de sacudir las vigas. Una inscripción antigua emerge de las telarañas.'},
  {img:'ruin',title:'LO QUE GUARDABA LA SEDA',text:'La araña no era el origen del mal. Huía de un poder mucho más profundo. El Sello del Primer Fuego aguarda detrás del nido.'}
 ];
}
function openStory39(type,replay=false){
 if(!playing)return;
 clearAimSelection();
 if(modalType)closeModal();
 paused=true;resetJoy();cancelSwordCharge();
 storyScene={type,replay,index:0,steps:sceneSteps(type)};$('story-overlay').classList.remove('hidden');
 displayStory39();
}
function displayStory39(){if(!storyScene)return;const o=storyScene,i=o.index,entry=o.steps[i];
 $('story-image').src='./assets/story/'+entry.img+'.png';$('story-title').textContent=entry.title;$('story-text').textContent=entry.text;
 $('story-count').textContent=(i+1)+' / '+o.steps.length;
 $('story-chapter').textContent=o.type==='prologue'?'CRÓNICAS DE KHAZ’DÛN':o.type==='widow'?'MINIBOSS · CAPÍTULO I':'DESPUÉS DEL ENFRENTAMIENTO';
 $('story-next').textContent=i===o.steps.length-1?(o.type==='widow'&&!o.replay?'COMBATIR ⚔':'CONTINUAR ▸'):'SIGUIENTE ▸';
 $('story-skip').classList.toggle('hidden',o.type==='post');
}
function finishStory39(){if(!storyScene)return;const type=storyScene.type,wasReplay=storyScene.replay;storyScene=null;$('story-overlay').classList.add('hidden');
 if(type==='prologue'){story39.prologueSeen=true;paused=false;queueSave();}
 else if(type==='widow'){story39.introSeen=true;if(story39.widowDefeated||wasReplay){paused=false;queueSave();}else startWidowBattle();}
 else {paused=false;queueSave();}
}
function storyNext39(){if(!storyScene)return;storyScene.index++;if(storyScene.index>=storyScene.steps.length)finishStory39();else displayStory39();}
function storySkip39(){if(storyScene?.type==='post')return;finishStory39();}
function journalPanel(){
 const discovered=story39.clues.filter(k=>STORY_FRAGMENTS[k]);
 const active=journalState.chapter;
 const chapter=JOURNAL_CHAPTERS.find(ch=>ch.id===active)||JOURNAL_CHAPTERS[1];
 const notes=(JOURNAL_SEQUENCE[active]||[]);
 // El capítulo no se desbloquea por fecha de hallazgo; el prólogo siempre se puede consultar.
 const chapters=JOURNAL_CHAPTERS.map(ch=>{
  const count=chapterFoundCount(ch.id),current=ch.id===active;
  return `<button type="button" class="journal-chapter${current?' selected':''}" data-chapter="${ch.id}" aria-pressed="${current}" ${!count&&ch.id!=='1'&&ch.id!=='prologue'?'disabled':''}>
   <span class="journal-chapter-title"><img class="journal-chapter-book" src="./assets/ui/chapter_book.png" alt="" aria-hidden="true">${escapeHTML(ch.name)}</span><small>${ch.id==='prologue'?'Introducción':count?count+' nota'+(count===1?'':'s'):'Por descubrir'}</small></button>`;
 }).join('');
 let section='';
 if(active==='prologue'){
  section=`<div class="journal-chapter-heading"><small>CRÓNICAS DE KHAZ’DÛN</small><h3>El último llamado</h3><p>Los clanes guardaban la luz de la montaña. Vuelve al principio de la historia cuando quieras.</p></div><button class="journal-story-action" data-journal="prologue">▤ REVIVIR EL PRÓLOGO</button>`;
 }else{
  const list=notes.map((id,i)=>{const f=STORY_FRAGMENTS[id],known=discovered.includes(id),on=known&&journalState.selected===id;
   return `<div class="journal-entry ${known?'':'locked'} ${on?'open':''}">
    <button type="button" data-note="${id}" ${known?'':'disabled'} aria-expanded="${on?'true':'false'}"><span class="journal-note-num">NOTA ${String(i+1).padStart(2,'0')}</span><span class="journal-note-title">${known?escapeHTML(f.title):'Fragmento sin descubrir'}</span><span class="journal-note-arrow">${known?(on?'▾':'▸'):'🔒'}</span></button>
    ${on?`<div class="journal-note-body">${escapeHTML(f.body)}</div>`:''}
   </div>`;
  }).join('');
  section=`<div class="journal-chapter-heading"><small>${escapeHTML(chapter.name)} · ${escapeHTML(chapter.subtitle)}</small><h3>${active==='1'?'La Galería Silenciosa':escapeHTML(chapter.subtitle)}</h3><p>${escapeHTML(chapter.description)} Los registros permanecen numerados en orden cronológico, incluso si los descubres desordenados.</p></div>
   <div class="journal-list">${notes.length?list:'<p class="journal-empty">Todavía no hay registros para este capítulo.</p>'}</div>`;
 }
 return `<div class="journal-layout">
   <aside class="journal-sidebar" aria-label="Capítulos del diario">${chapters}<div class="journal-sidebar-art" aria-hidden="true"><img src="./assets/ui/journal_mine.png" alt="" draggable="false"></div></aside>
   <div class="journal-content">
    <div class="journal-summary"><strong>Diario del clan <span>· Fragmentos encontrados: ${discovered.length} / ${Object.keys(STORY_FRAGMENTS).length}</span></strong><p>Explora galerías, revisa restos y abre cofres para reconstruir la historia de Khaz’dûn.</p></div>
    <div class="journal-story-actions"><button data-journal="prologue">◀ VOLVER A VER EL PRÓLOGO</button><button data-journal="widow" ${story39.introSeen?'':'disabled'}>◈ INTRO DE LA VIUDA</button></div>
    ${section}
   </div>
  </div>`;
}
function hookJournalControls(){
 const body=$('modal-body');
 body.querySelectorAll('[data-journal]').forEach(b=>b.addEventListener('click',()=>openStory39(b.dataset.journal,true)));
 body.querySelectorAll('[data-chapter]').forEach(b=>b.addEventListener('click',()=>{journalState.chapter=b.dataset.chapter;journalState.selected=null;body.innerHTML=journalPanel();hookJournalControls();}));
 body.querySelectorAll('[data-note]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.note;if(!story39.clues.includes(id))return;const sc=body.querySelector('.journal-content')?.scrollTop||0;journalState.selected=journalState.selected===id?null:id;body.innerHTML=journalPanel();hookJournalControls();const content=body.querySelector('.journal-content');if(content)content.scrollTop=sc;}));
}

const BATTLE_ACTIONS={normal:{min:10,max:25,cost:15,accuracy:.95},charged:{min:25,max:50,cost:35,accuracy:.85},special:{min:45,max:80,cost:60,accuracy:.75}};
function addBattleFloat39(text,target='boss',tone='damage',delay=0){
 if(!bossBattle)return;
 const colors={damage:'#ff6475',heal:'#91ffa7',energy:'#7ad8ff',miss:'#f0e5dc',critical:'#ffd16d',status:'#d8a7f1',normal:'#f0e5dc'};
 (bossBattle.floats||(bossBattle.floats=[])).push({text:String(text),target,color:colors[tone]||colors.normal,at:performance.now()+delay,life:1320});
 if(bossBattle.floats.length>18)bossBattle.floats.splice(0,bossBattle.floats.length-18);
}
function drawBattleFloats39(g,ts,w,h){
 const b=bossBattle;if(!b?.floats)return;
 b.floats=b.floats.filter(f=>ts<f.at+f.life);
 const sx=w/960,sy=h/320;
 for(const f of b.floats){if(ts<f.at)continue;const age=(ts-f.at)/f.life;
  const x=(f.target==='hero'?235:690)*sx,y=(f.target==='hero'?105:60)*sy-age*40*sy;
  g.save();g.globalAlpha=age>.76?(1-age)/.24:1;
  g.font=`bold ${Math.max(17,Math.round(28*sx))}px monospace`;g.textAlign='center';g.lineWidth=5;g.strokeStyle='rgba(4,7,14,.94)';
  g.strokeText(f.text,x,y);g.fillStyle=f.color;g.fillText(f.text,x,y);g.restore();
 }
}
function startWidowBattle(saved=null){
 if(story39.widowDefeated)return;
 const state=saved||{};
 const maxBossHp=Math.round(190*depthStats(1).health),oldMax=Number(state.maxHp)||190;
 const health=Number.isFinite(state.hp)?Math.round(state.hp*maxBossHp/oldMax):maxBossHp;
 bossBattle={hp:clamp(health,1,maxBossHp),maxHp:maxBossHp,energy:clamp(Number.isFinite(state.energy)?state.energy:100,0,100),turn:Math.max(1,Number(state.turn)||1),busy:false,phase:1,defending:false,entangled:Math.max(0,Number(state.entangled)||0),poisoned:Math.max(0,Number(state.poisoned)||0),bossPoison:Math.max(0,Number(state.bossPoison)||0),bossEnergy:Number.isFinite(state.bossEnergy)?state.bossEnergy:100,slow:0,slowResist:0,precise:!!state.precise,anim:null,intent:'mordida',message:'La Viuda de Carbón despierta entre las telarañas. Preparando una mordida.',effects:null,floats:[]};
 bossBattle.phase=bossBattle.hp>bossBattle.maxHp*.7?1:bossBattle.hp>bossBattle.maxHp*.35?2:3;
 paused=true;resetJoy();cancelSwordCharge();UI.hud.classList.add('hidden');$('turn-battle').classList.remove('hidden');
 battleIntent39();renderBattleUI39();queueSave();
}
function battleIntent39(){if(!bossBattle)return;const b=bossBattle;
 const sequence=b.phase===1?['mordida','golpe','seda','mordida']:b.phase===2?['seda','golpe','mordida','veneno']:['golpe','seda','veneno','golpe'];
 b.intent=sequence[(b.turn-1)%sequence.length];
 const hints={mordida:'La Viuda se acerca, mostrando sus colmillos.',golpe:'La Viuda eleva las patas para una embestida fuerte.',seda:'La Viuda tensa su abdomen: prepara una red de seda.',veneno:'Sus colmillos destilan un veneno oscuro.'};
 b.message=hints[b.intent];
}
function battleSaveState(){if(!bossBattle)return null;const b=bossBattle;return{hp:b.hp,maxHp:b.maxHp,energy:b.energy,turn:b.turn,entangled:b.entangled,poisoned:b.poisoned,bossPoison:b.bossPoison,bossEnergy:b.bossEnergy,precise:b.precise};}
function renderBattleUI39(){const b=bossBattle;if(!b)return;
 $('battle-boss-fill').style.width=(100*b.hp/b.maxHp)+'%';$('battle-boss-label').textContent='PV '+Math.max(0,Math.ceil(b.hp))+' / '+b.maxHp;
 $('battle-phase').textContent='FASE '+['','I','II','III'][b.phase];$('battle-hero-name').textContent=player.gender==='female'?'ENANA DEL CLAN':'ENANO DEL CLAN';
 $('battle-hero-hp').style.width=clamp(hp,0,100)+'%';$('battle-hero-hp-text').textContent=Math.ceil(hp);
 $('battle-hero-en').style.width=b.energy+'%';$('battle-hero-en-text').textContent=Math.round(b.energy);
 $('battle-status').textContent=[b.entangled?'ENREDADO '+b.entangled+' turno(s)':'',b.poisoned?'ENVENENADO '+b.poisoned:'',b.precise?'PRÓXIMO GOLPE PERFECTO':'',b.bossPoison?'VIUDA ENVENE­NADA':''].filter(Boolean).join(' · ')||'Sin estados';
 $('battle-turn').textContent='TURNO '+b.turn;$('battle-narration').textContent=b.message;
 document.querySelectorAll('[data-battle]').forEach(btn=>{
  const a=btn.dataset.battle;btn.classList.toggle('hidden',a==='free'?!b.entangled:!!b.entangled&&['normal','charged','special'].includes(a));
  btn.disabled=b.busy||(a in BATTLE_ACTIONS&&b.energy<BATTLE_ACTIONS[a].cost)||a==='free'&&!b.entangled;
 });
 if(!$('battle-items').classList.contains('hidden'))renderBattleItems39();
}
function rollDamage39(a,b){const perfect=b.precise,hit=perfect||Math.random()<a.accuracy;
 if(!hit)return{damage:0,miss:true,critical:false};
 const crit=!perfect&&Math.random()<.08;
 let base=perfect?a.max:Math.floor(a.min+Math.random()*(a.max-a.min+1));
 base+=Math.max(0,player.weaponTier||0)*3;
 base=Math.round(base*(1+progression.skills.combat*.10));
 return{damage:Math.round(base*(crit?1.5:1)),miss:false,critical:crit};
}
function battleAction39(action){const b=bossBattle;if(!b||b.busy)return;
 if(action==='item'){const itemBox=$('battle-items');itemBox.classList.toggle('hidden');renderBattleItems39();return;}
 $('battle-items').classList.add('hidden');
 if(b.entangled&&!['defend','free'].includes(action)){b.message='Estás enredado. Libérate o defiéndete.';renderBattleUI39();return;}
 const spec=BATTLE_ACTIONS[action];if(spec&&b.energy<spec.cost)return;
 b.busy=true;b.defending=action==='defend';
 if(spec){b.energy-=spec.cost;const r=rollDamage39(spec,b);b.precise=false;
  b.message=r.miss?'MISS: tu ataque falló y consumió energía.':`${action==='normal'?'Golpe normal':action==='charged'?'Golpe cargado':'Ataque especial'}: ${r.damage} PV${r.critical?' ¡CRÍTICO!':''}.`;
  b.anim={who:'hero',kind:action,until:performance.now()+760,damage:r.damage};
  renderBattleUI39();
  setTimeout(()=>{if(b!==bossBattle)return;
    b.hp=Math.max(0,b.hp-r.damage);
    if(r.miss)addBattleFloat39('MISS','boss','miss');
    else{addBattleFloat39('-'+r.damage,'boss','damage');if(r.critical)addBattleFloat39('¡CRÍTICO!','boss','critical',100);}
    if(r.damage>0){if(toolRunes.sword==='runa_veneno'&&Math.random()<.25)b.bossPoison=3;
      if(toolRunes.sword==='runa_hielo'&&b.slowResist<=0&&Math.random()<.20){b.slow=1;b.slowResist=3;addBattleFloat39('LENTO','boss','status',200);}if(b.bossPoison===3)addBattleFloat39('VENENO','boss','status',180);}
    const nextPhase=b.hp>b.maxHp*.7?1:b.hp>b.maxHp*.35?2:3;if(nextPhase!==b.phase){b.phase=nextPhase;b.message='La Viuda cambia de postura. ¡FASE '+['','I','II','III'][nextPhase]+'!';}
    renderBattleUI39();queueSave();
    if(b.hp<=0){setTimeout(()=>victoryWidow39(),500);return;}
    setTimeout(()=>bossTurn39(),430);
  },570);
 }else{
  if(action==='defend'){const gained=Math.min(40,100-b.energy);b.energy+=gained;b.message='Te proteges y recuperas '+gained+' de energía.';addBattleFloat39('+'+gained+' EN','hero','energy');}
  if(action==='free'){b.entangled=0;b.message='Cortaste las ataduras. Has gastado tu turno.';addBattleFloat39('LIBRE','hero','status');}
  b.anim={who:'hero',kind:action,until:performance.now()+620,damage:0};renderBattleUI39();
  setTimeout(()=>{if(b===bossBattle)bossTurn39();},570);
 }
}
function renderBattleItems39(){const holder=$('battle-items');const b=bossBattle;if(!b)return;
 const items=[['vendaje','Vendaje (+25 PV)'],['vendajefuerte','Vendaje reforzado (+45 PV)'],['tonico','Tónico (+55 EN)'],['pocionprecision','Precisión (próximo golpe perfecto)']];
 holder.innerHTML='<div class="battle-items-title"><strong>OBJETOS · SIN GASTAR TURNO</strong><button type="button" data-close-items aria-label="Cerrar objetos">✕</button></div><p class="battle-item-hint">Puedes curarte o beber una poción y después atacar o defenderte.</p>'+items.map(([id,name])=>{
  const noNeed=(id==='vendaje'||id==='vendajefuerte')&&hp>=100||id==='tonico'&&b.energy>=100||id==='pocionprecision'&&b.precise;
  return `<button data-battle-item="${id}" ${quantity(id)<1||noNeed?'disabled':''}>${name} · ×${quantity(id)} <small>NO GASTA TURNO</small></button>`;
 }).join('');
 holder.querySelectorAll('[data-battle-item]').forEach(btn=>btn.addEventListener('click',()=>battleUseItem39(btn.dataset.battleItem)));
 holder.querySelector('[data-close-items]')?.addEventListener('click',()=>holder.classList.add('hidden'));
}
function battleUseItem39(id){const b=bossBattle;if(!b||b.busy||quantity(id)<1)return false;
 const effects={vendaje:25,vendajefuerte:45,tonico:55,pocionprecision:0};if(!(id in effects))return false;
 // Validar antes de descontar: un consumible sin efecto nunca se pierde.
 if((id==='vendaje'||id==='vendajefuerte')&&hp>=100){b.message='Ya tienes la vida completa. No se consumió el vendaje.';renderBattleUI39();return false;}
 if(id==='tonico'&&b.energy>=100){b.message='Ya tienes energía completa. No se consumió el tónico.';renderBattleUI39();return false;}
 if(id==='pocionprecision'&&b.precise){b.message='El efecto de precisión ya está activo. No se consumió otra poción.';renderBattleUI39();return false;}
 let feedback='';
 if(id==='vendaje'||id==='vendajefuerte'){const recovered=Math.min(effects[id],100-hp);hp+=recovered;feedback='+'+recovered+' PV';addBattleFloat39(feedback,'hero','heal');b.message='Recuperaste '+recovered+' puntos de vida. ¡Todavía puedes actuar en este turno!';}
 else if(id==='tonico'){const recovered=Math.min(effects[id],100-b.energy);b.energy+=recovered;feedback='+'+recovered+' EN';addBattleFloat39(feedback,'hero','energy');b.message='Recuperaste '+recovered+' de energía. ¡Todavía puedes actuar en este turno!';}
 else{b.precise=true;feedback='PRECISIÓN';addBattleFloat39(feedback,'hero','status');b.message='Tu siguiente golpe acertará con daño máximo base. Ahora elige el ataque.';}
 // Se consume después de comprobar que se aplicó el efecto. NO provoca turno enemigo.
 removeFrom(inventory,id,1);refreshHotbar();b.anim={who:'hero',kind:'item',until:performance.now()+560,damage:0};
 $('battle-items').classList.add('hidden');renderBattleUI39();queueSave();return true;
}
function bossTurn39(){const b=bossBattle;if(!b)return;
 const attackEnergy=['seda','veneno'].includes(b.intent)?22:10;
 if(b.bossEnergy<attackEnergy){b.bossEnergy=Math.min(100,b.bossEnergy+35);b.message='La Viuda está agotada. Retrocede y recupera energía en lugar de atacar.';nextBattleTurn39();return;}
 b.bossEnergy=Math.max(0,b.bossEnergy-attackEnergy+10);
 if(b.slow>0){b.slow=0;b.message='¡Ralentización! La Viuda pierde su turno.';addBattleFloat39('LENTO','boss','status');nextBattleTurn39();return;}
 let damage=0;const intent=b.intent;
 if(intent==='golpe')damage=Math.floor(14+Math.random()*8)+b.phase*2;
 else if(intent==='mordida')damage=Math.floor(6+Math.random()*7)+b.phase*2;
 else if(intent==='seda')damage=Math.floor(3+Math.random()*6)+b.phase;
 else damage=Math.floor(5+Math.random()*6)+b.phase;
 const blocked=b.defending;damage=Math.max(1,Math.round(damage*depthStats(1).damage*(blocked?(equipment.offhand?.id==='escudo'?0.19:0.40):1))-Math.floor(totalArmor()/3));
 b.message=(intent==='seda'?'La Viuda lanzó seda oscura.':intent==='veneno'?'La Viuda clavó sus colmillos venenosos.':intent==='golpe'?'La Viuda descargó una embestida.':'La Viuda atacó con sus mandíbulas.')+' '+damage+' de daño'+(blocked?' (bloqueado)':'')+'.';
 b.anim={who:'boss',kind:intent,until:performance.now()+830,damage};renderBattleUI39();
 setTimeout(()=>{if(b!==bossBattle)return;
  hp=Math.max(0,hp-damage);addBattleFloat39('-'+damage,'hero','damage');
  if(intent==='seda'&&!blocked){b.entangled=Math.max(b.entangled,2);addBattleFloat39('ENREDADO','hero','status',150);}
  if(intent==='veneno'&&!blocked){b.poisoned=Math.max(b.poisoned,3);addBattleFloat39('VENENO','hero','status',150);}
  if(b.poisoned>0){hp=Math.max(0,hp-4);b.energy=Math.max(0,b.energy-5);b.poisoned--;addBattleFloat39('-4 VEN','hero','status',320);}
  if(b.bossPoison>0){const tick=4+Math.floor(Math.random()*3);b.hp=Math.max(0,b.hp-tick);b.bossEnergy=Math.max(0,b.bossEnergy-5);b.bossPoison--;addBattleFloat39('-'+tick+' VEN','boss','status',320);}
  b.slowResist=Math.max(0,b.slowResist-1);
  renderBattleUI39();queueSave();
  if(b.hp<=0){victoryWidow39();return;}
  if(hp<=0){defeatWidow39();return;}
  nextBattleTurn39();
 },650);
}
function nextBattleTurn39(){const b=bossBattle;if(!b)return;b.defending=false;b.busy=false;b.turn++;battleIntent39();renderBattleUI39();queueSave();}
function stopWidowBattle39(){bossBattle=null;$('turn-battle').classList.add('hidden');UI.hud.classList.remove('hidden');paused=false;refreshCombatUI();reveal();}
function victoryWidow39(){if(!bossBattle)return;stopWidowBattle39();story39.widowDefeated=true;
 addExperience(150,'jefe');learnLore('widow');gain('colmillo',1);gain('sedanegra',5);gain('hilo',8);gain('pocionprecision',1);stats.bosses=(stats.bosses||0)+1;
 story39.gateOpen=false;queueSave();toast('¡VIUDA DE CARBÓN DERROTADA! Colmillo, seda y diario.',3400);
 openStory39('post');
}
function defeatWidow39(){stopWidowBattle39();bossBattle=null;hp=1;die();toast('La Viuda te derrotó. Puedes regresar al nido para reintentarlo.',3000,'warning');}
// Cuerpos elípticos dibujados por franjas rectangulares: pixel art real sin suavizado.
function pixelOval39(g,cx,cy,rx,ry,color,step=7){g.fillStyle=color;
 for(let yy=-ry;yy<=ry;yy+=step){const norm=Math.min(.999,(yy+step*.5)/ry),half=Math.round(rx*Math.sqrt(Math.max(0,1-norm*norm)));
  g.fillRect(Math.round(cx-half),Math.round(cy+yy),Math.round(half*2),Math.ceil(step+1));}}
function pixLine39(g,points,color,width=5){g.strokeStyle=color;g.lineWidth=width;g.lineJoin='miter';g.lineCap='square';g.beginPath();g.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)g.lineTo(points[i][0],points[i][1]);g.stroke();}
function drawBattleFrame39(ts){if(!bossBattle)return;const c=$('battle-scene');if(!c)return;const g=c.getContext('2d');const w=c.width,h=c.height;
 g.imageSmoothingEnabled=false;g.fillStyle='#101526';g.fillRect(0,0,w,h);
 const bg=battleBackground39;if(bg.complete&&bg.naturalWidth){g.drawImage(bg,0,0,w,h);}else{g.fillStyle='#31304a';g.fillRect(0,0,w,h);}
 const b=bossBattle,sec=ts*.001,anim=b.anim&&b.anim.until>ts?b.anim:null;
 if(b.anim&&!anim)b.anim=null;
 const bossHit=anim?.who==='hero'&&anim.until-ts<440,heroHit=anim?.who==='boss'&&anim.until-ts<440;
 const heroLunge=anim?.who==='hero'&&['normal','charged','special'].includes(anim.kind)?Math.sin(Math.PI*clamp(1-(anim.until-ts)/760,0,1))*125:0;
 const bossLunge=anim?.who==='boss'?Math.sin(Math.PI*clamp(1-(anim.until-ts)/830,0,1))*68:0;
 const py=252+Math.sin(sec*2.4)*2,px=220+heroLunge;
 g.fillStyle='rgba(0,0,0,.45)';g.fillRect(px-44,282,108,13);
 const sprite=sprites[player.gender+'_right_'+(Math.floor(sec*2)%2)];if(sprite){g.drawImage(sprite,px-36,py-130,99,135);}else{g.fillStyle='#a48d6f';g.fillRect(px,py-94,58,98);}
 const armor=equipmentColor(equipment.chest)||'#8c7659';g.fillStyle=armor;g.fillRect(px-13,py-58,51,30);
 // Espada física animada: al atacar gira y avanza con el cuerpo del enano/a.
 const attackProgress=anim?.who==='hero'?clamp(1-(anim.until-ts)/760,0,1):0;
 g.save();g.translate(px+56,py-64);g.rotate(anim?.who==='hero'&&['normal','charged','special'].includes(anim.kind)?-.95+Math.sin(attackProgress*Math.PI)*1.9:.38);
 g.fillStyle='#614839';g.fillRect(-4,0,9,28);g.fillStyle='#d5ae6d';g.fillRect(-15,0,31,7);
 g.fillStyle=['#aeb5bf','#bb9476','#bbcdd5','#eed087'][Math.min(3,Math.max(0,player.weaponTier||0))];g.fillRect(-6,-76,13,79);
 g.fillStyle='#f4f6ec';g.fillRect(-3,-75,4,60);g.fillStyle='#d8eff9';g.fillRect(-3,-91,4,18);g.restore();
 if(equipment.head){g.fillStyle=equipmentColor(equipment.head);g.fillRect(px-15,py-125,59,18);}
 if(equipment.offhand?.id==='escudo'||anim?.kind==='defend'){g.fillStyle='#aaa9ad';g.fillRect(px+38,py-63,41,63);g.fillStyle='#d5b978';g.fillRect(px+43,py-56,31,48);}
 if(heroHit){g.fillStyle='rgba(247,91,87,.40)';g.fillRect(px-33,py-132,105,140);}
 const sx=675-bossLunge,sy=205+Math.sin(sec*3)*5+(b.hp<=0?40:0),ang=Math.sin(sec*3)*7;
 // Sprite de ocho patas articuladas, abdomen, cabeza, colmillos y ojos; cada parte se anima.
 for(let side of [-1,1])for(let i=0;i<4;i++){
  const ax=sx+side*(20+i*10),ay=sy-25+i*13,bx=sx+side*(74+i*20),by=sy-83+i*18+ang;
  const cx=sx+side*(110+i*22),cy=sy+49+i*6+Math.sin(sec*4+i)*5;
  g.strokeStyle='#0c0b16';g.lineWidth=20;g.beginPath();g.moveTo(ax,ay);g.lineTo(bx,by);g.lineTo(cx,cy);g.stroke();
  g.strokeStyle=i%2?'#51304c':'#3b344e';g.lineWidth=12;g.beginPath();g.moveTo(ax,ay);g.lineTo(bx,by);g.lineTo(cx,cy);g.stroke();
  g.fillStyle='#b05367';g.fillRect(bx-3,by-3,7,7);
 }
 // Abdomen redondeado y segmentado; sombras y runas de carbón encendido.
 pixelOval39(g,sx+3,sy-76,105,82,'#0e0d19',9);
 pixelOval39(g,sx+3,sy-80,96,75,bossHit?'#8c536c':'#3e2941',8);
 pixelOval39(g,sx+7,sy-91,82,61,b.phase===3?'#68314b':'#55334d',7);
 pixelOval39(g,sx-5,sy-122,53,20,'#704052',7);
 // Reflejos violetas, placas quitinosas y fisuras que se iluminan con la furia.
 for(let i=0;i<9;i++){
  const xx=sx-69+i*17,yy=sy-116+Math.sin(i*.85)*16;
  g.fillStyle=i%2?'#a35f68':'#79506b';g.fillRect(xx,yy,10,5);
  g.fillStyle='#241828';g.fillRect(xx+2,yy+7,7,3);
 }
 const rune=b.phase===3?'#ff4d6d':'#bc4465',glow=b.phase===3?'#ff9a5a':'#e67075';
 pixLine39(g,[[sx-18,sy-139],[sx-12,sy-122],[sx-25,sy-105],[sx-14,sy-87]],rune,10);
 pixLine39(g,[[sx+4,sy-135],[sx+18,sy-116],[sx+9,sy-94],[sx+25,sy-76]],rune,9);
 pixLine39(g,[[sx-15,sy-140],[sx-7,sy-124]],glow,3);
 pixLine39(g,[[sx+4,sy-131],[sx+13,sy-116]],glow,3);
 // Tórax y cabeza saliente, nunca rectangular: tarso, pedipalpos y colmillos.
 pixelOval39(g,sx+5,sy-10,72,57,'#100f1b',8);
 pixelOval39(g,sx+2,sy-14,64,51,bossHit?'#a06274':'#39283d',7);
 pixelOval39(g,sx+3,sy-23,54,34,'#52324a',7);
 pixelOval39(g,sx-18,sy-37,22,15,'#6d425f',5);
 pixelOval39(g,sx+30,sy-37,20,15,'#5a324f',5);
 // Ocho ojos rojos, silueta orgánica con brillo interior.
 const eyePositions=[[-37,-13],[-16,-24],[13,-25],[36,-13],[-31,3],[-10,4],[12,4],[31,3]];
 for(const [ex,ey] of eyePositions){
  const rx=sx+ex,ry=sy+ey;
  g.fillStyle='#150c1a';g.fillRect(rx-9,ry-10,19,17);
  g.fillStyle=b.phase===3?'#ff3e6b':'#da456e';g.fillRect(rx-7,ry-8,15,13);
  g.fillStyle='#ff99a2';g.fillRect(rx-5,ry-7,6,5);
  g.fillStyle='#ffccd0';g.fillRect(rx-4,ry-7,3,3);
 }
 for(const flip of [-1,1]){
  // Palpos y colmillos angulosos.
  pixLine39(g,[[sx+flip*40,sy+14],[sx+flip*48,sy+37],[sx+flip*30,sy+55]],'#16101f',13);
  pixLine39(g,[[sx+flip*40,sy+14],[sx+flip*48,sy+37],[sx+flip*30,sy+55]],'#6f4963',7);
  pixLine39(g,[[sx+flip*14,sy+25],[sx+flip*18,sy+48],[sx+flip*7,sy+67]],'#e6c6ad',12);
  g.fillStyle='#fff0d8';g.fillRect(sx+flip*7-3,sy+59,7,11);
 }
 if(bossHit){g.strokeStyle='#ffe0a3';g.lineWidth=9;g.beginPath();g.moveTo(sx-120,sy-123);g.lineTo(sx-17,sy+12);g.stroke();}
 if(anim?.who==='hero'&&anim.kind==='special'){g.strokeStyle='#77e2f0';g.lineWidth=7;g.strokeRect(sx-135,sy-128,270,210);}
 if(anim?.who==='hero'&&anim.kind==='charged'){g.strokeStyle='#ffd68a';g.lineWidth=13;g.beginPath();g.arc(sx,sy-24,125,Math.PI*.7,Math.PI*1.65);g.stroke();}
 if(anim?.who==='boss'&&anim.kind==='seda'){g.strokeStyle='#d9d2eb';g.lineWidth=4;for(let i=0;i<4;i++){g.beginPath();g.moveTo(sx-80,sy+i*17);g.lineTo(px+35,py-64+i*10);g.stroke();}}
 if(b.entangled){g.strokeStyle='#ddd7e6';g.lineWidth=4;for(let i=0;i<4;i++){g.beginPath();g.moveTo(px-24,py-76+i*14);g.lineTo(px+59,py-108+i*17);g.stroke();}}
 if(anim?.kind==='defend'){g.strokeStyle='#85d6dc';g.lineWidth=9;g.beginPath();g.arc(px+30,py-48,81,0,Math.PI*2);g.stroke();}
 drawBattleFloats39(g,ts,w,h);
}
const battleBackground39=new Image();battleBackground39.src='./assets/story/arena.png';
function configureStory39(){
 $('story-next').addEventListener('click',storyNext39);$('story-skip').addEventListener('click',storySkip39);
 document.querySelectorAll('[data-battle]').forEach(btn=>btn.addEventListener('click',()=>battleAction39(btn.dataset.battle)));
}

const key=(l,cx,cy)=>l+':'+cx+':'+cy;
const tileIndex=(x,y)=>((y%CH+CH)%CH)*CH+(x%CH+CH)%CH;
const inWorld=(x,y)=>x>=-MAX+2&&x<MAX-2&&y>=-MAX+2&&y<MAX-2;
function noise(x,y,scale,salt){let px=x/scale,py=y/scale,ix=Math.floor(px),iy=Math.floor(py),fx=px-ix,fy=py-iy;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);
 const a=hashInt(ix,iy,salt),b=hashInt(ix+1,iy,salt),c=hashInt(ix,iy+1,salt),d=hashInt(ix+1,iy+1,salt);return (a+(b-a)*fx)*(1-fy)+(c+(d-c)*fx)*fy;}
function segDist(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy||1),0,1);return distance(x,y,a[0]+t*dx,a[1]+t*dy);}
const TUNNELS=[[[0,0],[19,3],[37,20],[53,27]],[[0,0],[-17,5],[-31,19],[-44,31]],[[0,0],[9,-22],[32,-28]],[[0,0],[-17,-23],[-42,-21]],[[0,0],[6,27],[21,48]]];
function nearTunnel(x,y,l=layer){
 if(!worldLayoutVersion){for(const route of TUNNELS){for(let i=1;i<route.length;i++)if(segDist(x,y,route[i-1],route[i])<2.6)return true;}return false;}
 const g=worldLayout(l),start=g.up,ends=[g.down,g.shaftUp,g.shaftDown,...g.ruins];
 if(l===1){ends.push({x:g.dungeon.x+.5,y:g.dungeon.y+.5});ends.push(g.cache);}
 for(let i=0;i<ends.length;i++){
  const end=ends[i],bend=hashInt(l,i,975)>.5?1:-1,mid={x:(start.x+end.x)/2+(end.y-start.y)*.14*bend,y:(start.y+end.y)/2-(end.x-start.x)*.14*bend};
  if(segDist(x,y,[start.x,start.y],[mid.x,mid.y])<2.8||segDist(x,y,[mid.x,mid.y],[end.x,end.y])<2.8)return true;
 }
 return false;
}
function caveBase(l,x,y){if(!inWorld(x,y))return T.ROCK;
 if(l===1){const cell=dungeonTile(x,y);if(cell!==null)return cell;}
 let px=x+.5,py=y+.5;
 if(distance(px,py,.5,.5)<9)return T.FLOOR;
 if(worldLayoutVersion){const g=worldLayout(l);
  if([g.up,g.down,g.shaftUp,g.shaftDown,g.cache,...g.ruins,...g.starter.map(q=>offsetPoint(START,q))].some(q=>distance(px,py,q.x,q.y)<3.7))return T.FLOOR;
 }else if(distance(px,py,DEEP_STAIR.x,DEEP_STAIR.y)<5||distance(px,py,SHAFT.x,SHAFT.y)<5)return T.FLOOR;
 if(nearTunnel(px,py,l))return T.FLOOR;
 const broad=noise(x,y,28,73+l*18),mid=noise(x,y,13,17+l*14),fine=noise(x,y,5.7,23+l*19),cave=broad*.55+mid*.31+fine*.14;
 if(cave>.475)return T.FLOOR;
 const oreField=noise(x,y,5,193+l*9),sc=noise(x,y,18,214+l*5),roll=hashInt(x,y,92+l*9);
 if(oreField>.69&&sc>.34){let r=roll;
  if(l>=7&&r>.67)return T.ANCIENT;
  if(l>=2&&r>.60&&r<.70)return T.GOLD;
  if(l>=5&&r>.59)return T.ADAMANTITE;
  if(l>=4&&r>.52)return T.MITHRIL;
  if(l>=3&&r>.50)return T.CRYSTAL;
  if(l>=1&&r>.53)return T.IRON;
  if(r>.26)return T.COPPER;
  return T.COAL;
 }
 if(worldLayoutVersion&&l===1&&roll>.997&&oreField>.57&&sc>.42)return T.CRYSTAL;
 if(l>=4&&roll>.985)return l>=6?T.ANCIENT:T.CRYSTAL;
 if(l>=2&&roll>.986&&roll<.992)return T.GOLD;
 if(l>=2&&roll>.978)return T.IRON;
 if(roll>.965)return T.COPPER;
 if(roll>.945)return T.COAL;
 if(roll<.15)return T.SOFT;
 return T.ROCK;
}
function getChunk(l,cx,cy){const k=key(l,cx,cy);let c=chunkCache.get(k);if(c){chunkCache.delete(k);chunkCache.set(k,c);return c;}
 const a=new Uint8Array(CH*CH),edits=mined.get(k);for(let i=0;i<a.length;i++){const x=cx*CH+i%CH,y=cy*CH+(i/CH|0);a[i]=edits&&Object.prototype.hasOwnProperty.call(edits,i)?edits[i]:caveBase(l,x,y);}
 c={a,l,cx,cy};chunkCache.set(k,c);if(chunkCache.size>96)chunkCache.delete(chunkCache.keys().next().value);return c;}
function tileAt(x,y,l=layer){x=Math.floor(x);y=Math.floor(y);if(!inWorld(x,y))return T.ROCK;let cx=Math.floor(x/CH),cy=Math.floor(y/CH),c=getChunk(l,cx,cy);return c.a[tileIndex(x,y)];}
function setTile(x,y,v,l=layer){x=Math.floor(x);y=Math.floor(y);if(!inWorld(x,y))return;let cx=Math.floor(x/CH),cy=Math.floor(y/CH),k=key(l,cx,cy),i=tileIndex(x,y),c=getChunk(l,cx,cy),e=mined.get(k)||{};c.a[i]=v;e[i]=v;mined.set(k,e);invalidateLights();}
function fogAt(x,y,l=layer){x=Math.floor(x);y=Math.floor(y);const f=fog.get(key(l,Math.floor(x/CH),Math.floor(y/CH)));return f?f[tileIndex(x,y)]===1:false;}
function markFog(x,y){const k=key(layer,Math.floor(x/CH),Math.floor(y/CH));let f=fog.get(k);if(!f){f=new Uint8Array(CH*CH);fog.set(k,f);}let i=tileIndex(x,y);if(!f[i]){f[i]=1;stats.explored++;}}
function rayClear(ax,ay,bx,by,includeTarget=false){let d=distance(ax,ay,bx,by),samples=Math.ceil(d*6),stop=includeTarget?1:Math.max(0,(d-.52)/d);for(let i=1;i<=samples;i++){let t=i/samples;if(t>=stop)break;let x=ax+(bx-ax)*t,y=ay+(by-ay)*t;if(tileAt(x,y)!==T.FLOOR||isSolidStructure(structureAt(x,y)))return false;}return true;}
function refreshStaticLighting(){
 if(!lightDirty&&lightLayer===layer)return;
 lightLayer=layer;lightDirty=false;
 staticLights=new Map();staticLightTints=new Map();lightSources=[];
 // Los elementos permanentes existen aunque el jugador esté lejos.
 for(const p of propsFor(layer)){
  const spec=lightSpec(p.kind);if(spec)lightSources.push({...spec,x:p.x,y:p.y});
 }
 for(const p of structures.values()){
  if(p.layer!==layer)continue;
  if(p.kind==='furnace'&&!furnaceWorking(p))continue;
  const spec=lightSpec(p.kind);if(spec)lightSources.push({...spec,x:p.x,y:p.y});
 }
 for(const source of lightSources){
  const R=source.radius,cx=Math.floor(source.x),cy=Math.floor(source.y),reach=Math.ceil(R);
  for(let y=cy-reach;y<=cy+reach;y++)for(let x=cx-reach;x<=cx+reach;x++){
   if(!inWorld(x,y))continue;
   const dist=distance(source.x,source.y,x+.5,y+.5);
   if(dist>R||!rayClear(source.x,source.y,x+.5,y+.5,false))continue;
   const key=x+','+y;
   const intensity=source.power*Math.pow(Math.max(0,1-dist/R),.65);
   if(intensity>(staticLights.get(key)||0)){staticLights.set(key,intensity);staticLightTints.set(key,source.tint||'warm');}
   // La iluminación lejana NO revela ubicaciones secretas antes de explorarlas.
   if(distance(player.x,player.y,x+.5,y+.5)<15)markFog(x,y);
  }
 }
}
function reveal(){
 refreshStaticLighting();
 vis=new Set(staticLights.keys());
 // Cuando el jugador se acerca a una luz existente, descubre la zona iluminada.
 for(const k of staticLights.keys()){const xy=k.split(',').map(Number);if(distance(player.x,player.y,xy[0]+.5,xy[1]+.5)<15)markFog(xy[0],xy[1]);}
 const cx=Math.floor(player.x),cy=Math.floor(player.y),R=lampActive()?MINER_LAMP_RADIUS:PLAYER_VISION_RADIUS,lim=Math.ceil(R);
 for(let y=cy-lim;y<=cy+lim;y++)for(let x=cx-lim;x<=cx+lim;x++){
  if(!inWorld(x,y)||distance(x+.5,y+.5,player.x,player.y)>R)continue;
  if(rayClear(player.x,player.y,x+.5,y+.5,false)){
   vis.add(x+','+y);markFog(x,y);
  }
 }
}
function propsFor(l){
 const down=downPoint(l),eDown=shaftDownPoint(l),eUp=shaftUpPoint(l),up=upPoint(l);
 const props=[
  {id:'down',kind:'stairsdown',x:down.x,y:down.y,label:'Escalera al nivel '+(l+1),msg:'Desciende a las profundidades.',to:l+1,spawn:upPoint(l+1)},
  {id:'shaftdown',kind:'elevator',x:eDown.x,y:eDown.y,label:'Ascensor minero · descender',msg:'Desciende por el pozo antiguo.',to:l+1,spawn:shaftUpPoint(l+1)}
 ];
 if(l>0)props.push({id:'up',kind:'stairsup',x:up.x,y:up.y,label:'Escalera al nivel '+(l-1),msg:'Regresa a la región anterior.',to:l-1,spawn:downPoint(l-1)},
  {id:'shaftup',kind:'elevator',x:eUp.x,y:eUp.y,label:'Ascensor minero · ascender',msg:'Vuelve al pozo superior.',to:l-1,spawn:shaftDownPoint(l-1)});
 if(!worldLayoutVersion){
  props.push({id:'board',kind:'sign',x:3.5,y:-3.5,label:'Tablón del Clan',msg:'Excava para abrir tus túneles. Explora los ocho estratos.'},
    {id:'fire',kind:'fire',x:2.7,y:3.3,label:'Hoguera del descenso',msg:'El calor del Clan sigue aquí.'},
    {id:'crystal',kind:'crystal',x:7.5,y:5.5,label:'Cristal del horizonte',msg:'La luz revela las galerías.'});
  if(l===1)props.push({id:'crystal_cache',kind:'supplycache',x:6.5,y:5.5,label:story39.openedChests.includes('crystal_cache')?'Alijo de los mineros · vacío':'Alijo oculto de los mineros',msg:'Un escondite olvidado entre las rocas.'});
  if(l===0)props.push({id:'banner',kind:'banner',x:-3.5,y:2.5,label:'Estandarte de Khaz’dûn'},
    {id:'forge',kind:'anvil',x:-2.3,y:-3.2,label:'Yunque del Clan',msg:'Pulsa MANO para forjar mejores picos y espadas.'});
 }else{
  const g=worldLayout(l);
  if(l===0){const s=g.starter.map(q=>offsetPoint(START,q));
   props.push({id:'board',kind:'sign',x:s[0].x,y:s[0].y,label:'Tablón del Clan',msg:'Explora para encontrar las entradas y ruinas del reino.'},
     {id:'fire',kind:'fire',x:s[1].x,y:s[1].y,label:'Hoguera del descenso'},
     {id:'banner',kind:'banner',x:s[2].x,y:s[2].y,label:'Estandarte de Khaz’dûn'},
     {id:'forge',kind:'anvil',x:s[3].x,y:s[3].y,label:'Yunque del Clan',msg:'Pulsa MANO para mejorar herramientas.'});
  }
  if(l===1)props.push({id:'crystal_cache',kind:'supplycache',x:g.cache.x,y:g.cache.y,label:story39.openedChests.includes('crystal_cache')?'Alijo de los mineros · vacío':'Alijo oculto de los mineros',msg:'Un escondite olvidado entre las rocas.'});
  if(l>=1&&l<=6)g.ruins.forEach((q,i)=>props.push({id:`ruin_${l}_${i}`,kind:'ruin',x:q.x,y:q.y,label:i?'Campamento minero abandonado':'Restos de una antigua torre',msg:l===1&&i===0?'Un rastro de huellas se pierde hacia el '+directionHint(q,{x:g.dungeon.x+.5,y:g.dungeon.y+.5})+'.':i?'Un plano gastado señala un descenso hacia el '+directionHint(q,g.down)+'.':'Las marcas de pico apuntan hacia el '+directionHint(q,g.shaftDown)+'.'}));
 }
 if(l===7){props[0].id='heart';props[0].kind='monument';props[0].label='La Última Fragua';props[0].to=undefined;props[0].msg='Has alcanzado el corazón del reino.';props.splice(1,1);}
 if(l===1)props.push(...dungeonProps());
 if(l===layer)props.push(...nearbyRemains(l));
 for(const mush of glowPropsFor(l))props.push(mush);
 return props;
}
function glowPropsFor(l){
 let cached=glowPropCache.get(l);if(cached)return cached.filter(p=>!structureAt(p.x,p.y)&&!floorAt(p.x,p.y));
 const props=[];const dense=l===2||l===4;const step=dense?14:20,maxCount=dense?64:26;
 outer:for(let gy=-MAX+10;gy<MAX-10;gy+=step){for(let gx=-MAX+10;gx<MAX-10;gx+=step){
   const chance=dense ? 0.42 : 0.16;if(hashInt(gx*3,gy*5,l+77)>chance)continue;
   const ox=Math.floor((hashInt(gx,gy,l+91)-.5)*step*.7),oy=Math.floor((hashInt(gx,gy,l+103)-.5)*step*.7);
   const x=gx+ox,y=gy+oy;
   if(Math.abs(x)<8&&Math.abs(y)<8)continue;
   if([downPoint(l),shaftDownPoint(l),shaftUpPoint(l),upPoint(l)].some(q=>distance(x,y,q.x,q.y)<8)||inDungeon(x,y,l))continue;
   if(tileAt(x,y,l)!==T.FLOOR)continue;
   props.push({id:`glowmush_${l}_${x}_${y}`,kind:'glowmush',x:x+.5,y:y+.56,label:'Hongo bioluminiscente',msg:'Emite una luz azul fría. Forma parte del bioma y no deja recursos útiles.',layer:l});
   if(props.length>=maxCount)break outer;
 }}
 glowPropCache.set(l,props);
 return props.filter(p=>!structureAt(p.x,p.y)&&!floorAt(p.x,p.y));
}
const currentProps=()=>[...propsFor(layer),...currentBuilt(),...nearbyWood()];
function solid(x,y){return tileAt(x,y)!==T.FLOOR;}
function blockedByDungeonGate(x,y){
 if(layer!==1)return false;
 const q=dungeonLocal(x,y);
 return (!dungeonSealsReady()&&q.x>136.8&&q.x<138.2&&q.y>1.5&&q.y<5.6)
  ||(!story39.gateOpen&&q.x>169.8&&q.x<171.2&&q.y>1.4&&q.y<5.6);
}
function canMove(x,y){const r=.255;
 if(blockedByDungeonGate(x,y))return false;
 const x0=Math.floor(x-r),x1=Math.floor(x+r),y0=Math.floor(y-r),y1=Math.floor(y+r);
 for(let cy=y0;cy<=y1;cy++)for(let cx=x0;cx<=x1;cx++){
  if(!hitSolidCell(cx,cy,r,x,y))continue;
  if(tileAt(cx,cy)!==T.FLOOR||isSolidStructure(structureAt(cx,cy)))return false;
 }return true;
}
function worldToScreen(x,y){return{x:(x-screen.camX)*screen.tile+screen.w/2,y:(y-screen.camY)*screen.tile+screen.h/2};}
function screenToWorld(x,y){return{x:(x-screen.w/2)/screen.tile+screen.camX,y:(y-screen.h/2)/screen.tile+screen.camY};}
function screenCell(x,y){
 const p=screenToWorld(x,y);
 return{x:Math.floor(p.x),y:Math.floor(p.y)};
}
function reticlePoint(){return{x:Math.floor(screen.w/2),y:Math.floor(screen.h/2)};}
function reticleCell(){const {x,y}=reticlePoint();return screenCell(x,y);}
// Use the actual *visible* viewport (browser toolbars included), not a phone model or a fixed CSS breakpoint.
function fitViewport(){
 const vv=window.visualViewport;
 const w=Math.max(200,Math.round(vv?.width||window.innerWidth));
 const h=Math.max(180,Math.round(vv?.height||window.innerHeight));
 const root=document.documentElement;
 root.style.setProperty('--view-width',w+'px');
 root.style.setProperty('--view-height',h+'px');
 root.style.setProperty('--view-left',Math.round(vv?.offsetLeft||0)+'px');
 root.style.setProperty('--view-top',Math.round(vv?.offsetTop||0)+'px');
 const portrait=h>w, compact=h<510||w<800||portrait, tight=h<340||w<440;
 const topButton=clamp(Math.floor(h*.115),38,compact?44:50);
 const joystickSize=clamp(Math.round(Math.min(h*.25,w*.26)),72,portrait?104:120);
 const actionSize=clamp(Math.round(joystickSize*.74),56,88);
 const handSize=clamp(Math.round(actionSize*.8),44,68);
 root.classList.toggle('ui-compact',compact);
 root.classList.toggle('ui-tight',tight);
 root.classList.toggle('ui-portrait',portrait);
 root.classList.toggle('ui-short',h<=560);
 const props={
  '--top-btn':topButton+'px','--top-gap':(compact?5:8)+'px',
  '--joystick-size':joystickSize+'px','--action-size':actionSize+'px','--hand-size':handSize+'px',
  '--dodge-size':Math.max(38,Math.round(handSize*.79))+'px','--lamp-size':Math.max(38,Math.round(actionSize*.58))+'px',
  '--mini-size':clamp(Math.round(h*.195),54,compact?74:88)+'px'
 };
 for(const [key,val] of Object.entries(props))root.style.setProperty(key,val);
}
function resize(){fitViewport();let rect=canvas.getBoundingClientRect();screen.w=Math.max(1,rect.width);screen.h=Math.max(1,rect.height);screen.dpr=Math.min(2,window.devicePixelRatio||1);let iw=Math.round(screen.w*screen.dpr),ih=Math.round(screen.h*screen.dpr);if(canvas.width!==iw||canvas.height!==ih){canvas.width=iw;canvas.height=ih;}
 screen.tile=screen.h>screen.w?clamp(Math.floor(Math.min(screen.w/15,screen.h/16)),24,43):clamp(Math.floor(Math.min(screen.w/23,screen.h/11)),20,43);}
function nearestProp(maxD=1.65){let best=null,bestD=maxD;for(const p of currentProps()){if(isWallStructure(p)||p.decorative)continue;const d=distance(player.x,player.y,p.x,p.y);if(d<bestD&&rayClear(player.x,player.y,p.x,p.y,false)){best=p;bestD=d;}}return best;}
function directionalWall(){let fx=player.dirX,fy=player.dirY,n=Math.hypot(fx,fy)||1;fx/=n;fy/=n;let best=null,score=9;
 for(let y=Math.floor(player.y)-2;y<=Math.floor(player.y)+2;y++)for(let x=Math.floor(player.x)-2;x<=Math.floor(player.x)+2;x++){
 const t=tileAt(x,y);if(!t)continue;let dx=x+.5-player.x,dy=y+.5-player.y,d=Math.hypot(dx,dy),dot=(dx*fx+dy*fy)/(d||1);if(d>1.95||dot<.38||!rayClear(player.x,player.y,x+.5,y+.5,false))continue;
 let s=d-.44*dot;if(s<score){score=s;best={kind:'wall',x,y,type:t};}}
 return best;}
function directionalBuilt(){
 let dx=player.dirX,dy=player.dirY,mag=Math.hypot(dx,dy)||1;dx/=mag;dy/=mag;
 let best=null,bestScore=Infinity;
 for(let y=Math.floor(player.y)-2;y<=Math.floor(player.y)+2;y++)for(let x=Math.floor(player.x)-2;x<=Math.floor(player.x)+2;x++){
  const p=structureAt(x,y);if(!p)continue;
  const vx=p.x-player.x,vy=p.y-player.y,d=Math.hypot(vx,vy);
  const dot=(vx*dx+vy*dy)/(d||1);
  if(d<.25||d>2.15||dot<.47||!rayClear(player.x,player.y,p.x,p.y,false))continue;
  const score=d-dot*.46;
  if(score<bestScore){best={kind:'prop',p};bestScore=score;}
 }
 return best;
}
function selectedPropAt(x,y,props){
 const placed=structureAt(x,y);if(placed)return placed;
 return (props??currentProps()).find(q=>!q.decorative&&Math.floor(q.x)===x&&Math.floor(q.y)===y)||null;
}
function repairTarget(){
 if(targetCell){
  const p=selectedPropAt(targetCell.x,targetCell.y);
  if(p&&distance(player.x,player.y,p.x,p.y)<2.9&&rayToSolidTarget(player.x,player.y,p.x,p.y))return{kind:'prop',p};
  const web=webAt(targetCell.x,targetCell.y);
  if(web&&distance(player.x,player.y,web.x+.5,web.y+.5)<2.6&&rayClear(player.x,player.y,web.x+.5,web.y+.5,false))return{kind:'web',web};
  if(floorAt(targetCell.x,targetCell.y)&&distance(player.x,player.y,targetCell.x+.5,targetCell.y+.5)<2.9)return{kind:'floor',x:targetCell.x,y:targetCell.y};
  return null; // No acción automática sobre otro objeto si uno está seleccionado.
 }
 if(selectedTile){
  const type=tileAt(selectedTile.x,selectedTile.y);
  if(type!==T.FLOOR&&distance(player.x,player.y,selectedTile.x+.5,selectedTile.y+.5)<2.2)
   return{kind:'wall',x:selectedTile.x,y:selectedTile.y,type};
  return null;
 }
 const b=directionalBuilt();if(b)return b;
 const p=nearestProp();if(p)return{kind:'prop',p};return directionalWall();
}
function clearAimSelection(){handSelection=null;miningSelection=null;}
function miningCandidateAt({x,y},props){
 if(!inWorld(x,y))return null;
 const web=webAt(x,y);
 if(web)return{kind:'web',x,y,web,id:web};
 const p=selectedPropAt(x,y,props);
 if(p){
  if(p.kind==='tree'||structureAt(x,y)===p)return{kind:'prop',x,y,p,id:p.kind==='tree'?p.id:p};
  return null;
 }
 const type=tileAt(x,y);
 if(type!==T.FLOOR)return{kind:'wall',x,y,type,id:type};
 const floor=floorAt(x,y);
 return floor?{kind:'floor',x,y,id:floor}:null;
}
function miningTargetInReach(a,tapped){
 if(!a)return false;
 const tree=a.p?.kind==='tree';
 const reach=a.kind==='wall'?(tapped?2.2:1.95):a.kind==='web'?2.6:tapped?2.9:tree?1.65:2.15;
 const x=a.p?.x??a.x+.5,y=a.p?.y??a.y+.5;
 return distance(player.x,player.y,x,y)<reach&&targetPathClear(x,y);
}
function miningTarget(props){
 if(miningSelection){
  const {target,tool,level}=miningSelection;
  if(layer===level&&pickedItem()===tool){
   const a=miningCandidateAt(target,props);
   if(a?.kind===target.kind&&a.id===target.id&&miningTargetInReach(a,true))return a;
  }
  miningSelection=null;
 }
 const a=miningCandidateAt(reticleCell(),props);
 return miningTargetInReach(a,false)?a:null;
}
// La celda objetivo es maciza por definición. No debe bloquear su propio golpe
// al apuntar en diagonal; sí bloquean todas las paredes que están antes.
function rayToSolidTarget(ax,ay,bx,by){
 const tx=Math.floor(bx),ty=Math.floor(by),d=distance(ax,ay,bx,by);
 const samples=Math.max(1,Math.ceil(d*12));
 for(let i=1;i<samples;i++){
  const t=i/samples,x=ax+(bx-ax)*t,y=ay+(by-ay)*t;
  if(Math.floor(x)===tx&&Math.floor(y)===ty)continue;
  if(tileAt(x,y)!==T.FLOOR||isSolidStructure(structureAt(x,y)))return false;
 }
 return true;
}
// El martillo solo repara piezas ya dañadas. Una reparación completa cuesta 1 unidad.
function repairMaterial(action){
 if(action.kind==='floor')return floorAt(action.x,action.y)==='stonefloor'?'piedra':'madera';
 if(action.kind==='wall'){
  const placed=placedBlocks.get(builtKey(layer,action.x,action.y));
  return placed==='tierra'?'tierra':placed==='piedra'?'piedra':ORE[action.type]||'piedra';
 }
 if(action.kind==='prop'){
  const kind=action.p.kind;
  if(['stonewall','campfire','furnace'].includes(kind))return 'piedra';
  if(kind==='torch'||kind==='door'||kind==='woodwall'||kind==='chest'||kind==='workbench'||kind==='bed'||kind==='banner')return 'madera';
 }
 return null;
}
function repairWear(action){
 if(!action)return null;
 let key,damage,position;
 if(action.kind==='floor'){
  key=floorDismantleKey(action.x,action.y);damage=dismantleDamage.get(key);position={x:action.x+.5,y:action.y+.5};
 }else if(action.kind==='prop'&&action.p.layer!==undefined&&structures.has(action.p.id)){
  key=dismantleKey(action.p);damage=dismantleDamage.get(key);position={x:action.p.x,y:action.p.y};
 }else if(action.kind==='wall'){
  key=layer+':'+action.x+':'+action.y;damage=breakDamage.get(key);position={x:action.x+.5,y:action.y+.5};
 }
 if(!key)return null;
 return{key,damage:typeof damage==='number'?damage:damage?.hits||0,position,material:repairMaterial(action),built:action.kind!=='wall'};
}
function repairWithHammer(action){
 const repair=repairWear(action);
 if(!repair?.material){toast('Selecciona una pared, suelo o construcción dañada.',1600,'warning');return;}
 if(repair.damage<=0){toast('Esta pieza está intacta; no necesita reparación.',1500,'warning');return;}
 if(distance(player.x,player.y,repair.position.x,repair.position.y)>2.9){toast('Acércate para reparar.',1600,'warning');return;}
 if(!rayToSolidTarget(player.x,player.y,repair.position.x,repair.position.y)){toast('La pared bloquea la reparación.',1600,'warning');return;}
 if(quantity(repair.material)<1){toast('Necesitas 1 '+ITEMS[repair.material].name.toLowerCase()+' para reparar.',1900,'warning');return;}
 if(!removeFrom(inventory,repair.material,1))return;
 if(repair.built)dismantleDamage.delete(repair.key);else breakDamage.delete(repair.key);
 hitFlash=.11;impactSwing=.22;dismantleFX={...repair.position,ttl:.24,seed:12};
 stats.repairs=(stats.repairs||0)+1;
 refreshHotbar();updateContext();scheduleSave();
 toast('Reparado: -1 '+ITEMS[repair.material].name.toLowerCase(),1250,'important');
}
// --- Alpha 3.7: two hostile creatures, persistent loot and sticky spider webs. ---
const MOB_SPECS={
 slime:{hp:8,speed:1.06,contact:4,view:7,windup:.56,recovery:1.30},
 spider:{hp:12,speed:1.47,contact:6,view:8,windup:.32,recovery:1.14},
 bat:{hp:9,speed:1.78,contact:4,view:9,windup:.38,recovery:1.10},
 skeleton:{hp:17,speed:.97,contact:8,view:8.5,windup:.72,recovery:1.55}
};
const MOB_NAMES={slime:'Slime',spider:'Araña',bat:'Murciélago',skeleton:'Esqueleto minero'};
function creatureKind(gx,gy,l){
 const v=hashInt(gx,gy,241);
 if(l===0)return v>.55?'spider':'slime';
 if(l===1)return v>.68?'bat':v>.37?'spider':'slime';
 if(l===2)return v>.67?'bat':v>.21?'spider':'slime';
 return v>.67?'skeleton':v>.36?'bat':v>.15?'spider':'slime';
}

function webKey(x,y,l=layer){return builtKey(l,Math.floor(x),Math.floor(y));}
function webAt(x,y,l=layer){return webs.get(webKey(x,y,l));}
function webIsProtected(x,y,l=layer){
 if(distance(x+.5,y+.5,.5,.5)<8)return true;
 for(const q of structures.values()){
  if(q.layer!==l)continue;
  if(distance(x+.5,y+.5,q.x,q.y)<3.3)return true;
  if(q.id===mainBase&&distance(x+.5,y+.5,q.x,q.y)<9)return true;
 }
 return false;
}
function canWebAt(x,y,l=layer){
 return inWorld(x,y)&&tileAt(x,y,l)===T.FLOOR&&!structureAt(x,y,l)&&!webAt(x,y,l)&&!webIsProtected(x,y,l);
}
function layWeb(e){
 const x=Math.floor(e.x),y=Math.floor(e.y),k=webKey(x,y,e.layer);
 if(!canWebAt(x,y,e.layer))return false;
 let count=0;for(const w of webs.values())if(w.owner===e.id)count++;
 if(count>=5)return false;
 webs.set(k,{x,y,layer:e.layer,hp:2,owner:e.id});scheduleSave();return true;
}
function strikeWeb(w,weapon){
 if(!w)return false;
 w.hp-=weapon==='sword'?2:1;
 hitFlash=.15;impactSwing=.18;
 if(w.hp>0){scheduleSave();return false;}
 webs.delete(webKey(w.x,w.y,w.layer));
 dropAt('hilo',1,w.x+.5,w.y+.5,w.layer);scheduleSave();return true;
}
function localEnemies(){return [...enemies.values()].filter(e=>e.layer===layer&&e.hp>0&&distance(e.x,e.y,player.x,player.y)<31);}
function chooseCreatureAt(x,y){
 let candidate=null,best=.78;
 for(const e of localEnemies()){
  if(!vis.has(Math.floor(e.x)+','+Math.floor(e.y)))continue;
  const d=distance(x+.5,y+.5,e.x,e.y);
  if(d<best){best=d;candidate=e;}
 }
 return candidate;
}
function creatureSpawnCheck(){
 if(enemies.size>650)return;
 let nearby=localEnemies().length;
 if(nearby>=Math.min(17,11+layer))return;
 const g=9,minGX=Math.floor((player.x-24)/g),maxGX=Math.ceil((player.x+24)/g),minGY=Math.floor((player.y-24)/g),maxGY=Math.ceil((player.y+24)/g);
 for(let gy=minGY;gy<=maxGY;gy++)for(let gx=minGX;gx<=maxGX;gx++){
  if(nearby>=Math.min(17,11+layer))return;
  const id=`${layer}:${gx}:${gy}`;
  if(enemies.has(id)||defeatedEnemies.has(id)||hashInt(gx,gy,203+layer)<(layer===0?.50:Math.max(.14,.32-layer*.023)))continue;
  const x=gx*g+1+Math.floor(hashInt(gx,gy,211)*6),y=gy*g+1+Math.floor(hashInt(gx,gy,219)*6);
  if(distance(x+.5,y+.5,player.x,player.y)<6||distance(x+.5,y+.5,player.x,player.y)>23)continue;
  if(webIsProtected(x,y)||(inDungeon(x,y)&&dungeonLocal(x,y).x>=66)||tileAt(x,y)!==T.FLOOR||structureAt(x,y))continue;
  const kind=creatureKind(gx,gy,layer);
  const elite=layer>=3&&hashInt(gx,gy,433+layer)>(.97-(layer-3)*.012);
  const max=Math.ceil(MOB_SPECS[kind].hp*depthStats(layer).health*(elite?1.45:1));
  enemies.set(id,{id,layer,kind,elite,x:x+.5,y:y+.5,hp:max,maxHp:max,hit:0,attack:0,webClock:2.0+hashInt(gx,gy,9)*4,windup:0,stagger:0,dx:0,dy:1});
  nearby++;
 }
}
function killCreature(e){
 enemies.delete(e.id);defeatedEnemies.add(e.id);
 if(selectedEnemy===e.id)selectedEnemy=null;
 const qty=e.kind==='slime'?1+Math.floor(hashInt(Math.floor(e.x),Math.floor(e.y),333)*3):1+Math.floor(hashInt(Math.floor(e.x),Math.floor(e.y),344)*2);
 const drop={slime:'gel',spider:'hilo',bat:'membrana',skeleton:'hueso'}[e.kind];
 dropAt(drop,qty,e.x,e.y,e.layer);
 stats.kills=(stats.kills||0)+1;
 addExperience(Math.round((({slime:8,spider:12,bat:10,skeleton:16})[e.kind]||8)*depthStats(e.layer).xp*(e.elite?1.7:1)),'combate');
 if(e.kind==='bat'&&e.layer>=1&&e.layer<=3&&hashInt(Math.floor(e.x),Math.floor(e.y),843)<.01)dropAt('cristal',1,e.x,e.y,e.layer);
 if(e.elite)dropAt('carbon',1+Math.floor(e.layer/3),e.x,e.y,e.layer);
 if(e.kind==='spider')stats.spiders=(stats.spiders||0)+1;
 if(e.kind==='slime')stats.slimes=(stats.slimes||0)+1;
 if(e.kind==='bat')stats.bats=(stats.bats||0)+1;
 if(e.kind==='skeleton')stats.skeletons=(stats.skeletons||0)+1;
 scheduleSave();
}
function hurtCreature(e,damage){
 if(!e||e.hp<=0)return;
 e.hp-=damage;e.hit=.24;e.attack=Math.max(e.attack,.50);e.windup=0;e.stagger=.18;
 const dx=e.x-player.x,dy=e.y-player.y,d=Math.hypot(dx,dy)||1;
 const nx=e.x+dx/d*.29,ny=e.y+dy/d*.29;
 if(canMove(nx,e.y))e.x=nx;if(canMove(e.x,ny))e.y=ny;
 battleFlash={x:e.x,y:e.y,n:damage,until:performance.now()+390};
 hitFlash=.13;impactSwing=.18;
 if(e.hp<=0)killCreature(e);
 else scheduleSave();
}
function swordAttack(charged=false){
 if(swordCooldown>0)return false;
 if(charged){if(stamina<CHARGE_COST)charged=false;else{stamina-=CHARGE_COST;staminaDelay=.80;}}
 swordCooldown=charged?.78:.43;
 const reach=charged?2.55:2.05;
 const dx=player.dirX||0,dy=player.dirY||1,dm=Math.hypot(dx,dy)||1;
 let target=selectedEnemy?enemies.get(selectedEnemy):null;
 if(target&&target.layer===layer&&distance(player.x,player.y,target.x,target.y)<=reach&&rayClear(player.x,player.y,target.x,target.y,false)){
  const vx=target.x-player.x,vy=target.y-player.y,n=Math.hypot(vx,vy)||1;
  player.dirX=vx/n;player.dirY=vy/n;
 }else target=null;
 const fx=player.dirX||0,fy=player.dirY||1,fm=Math.hypot(fx,fy)||1;
 const hits=[];
 for(const e of localEnemies()){
  const d=distance(player.x,player.y,e.x,e.y);
  if(d>reach||d<.12||!rayClear(player.x,player.y,e.x,e.y,false))continue;
  const dot=((e.x-player.x)*fx+(e.y-player.y)*fy)/(d*fm);
  if(dot<(charged?.03:.36))continue;
  hits.push({e,d,dot});
 }
 hits.sort((a,b)=>(b.e===target)-(a.e===target)||b.dot-a.dot||a.d-b.d);
 const power=(3+(player.weaponTier||0)*2)*(1+progression.skills.combat*.10);
 for(const {e} of hits.slice(0,charged?4:1)){
  hurtCreature(e,Math.round(power*(charged?2.2:1)));
  if(e.hp>0&&toolRunes.sword==='runa_veneno'&&Math.random()<.25){e.poison=3;e.poisonTick=1;toast('☣ Enemigo envenenado',1500);}
  if(e.hp>0&&toolRunes.sword==='runa_hielo'&&Math.random()<.20){e.stagger=Math.max(e.stagger||0,.95);toast('❄ Enemigo ralentizado',1500);}
 }
 attackFX={ttl:charged?.38:.22,max:charged?.38:.22,dx:fx/fm,dy:fy/fm,charged};
 impactSwing=.23;
 if(!hits.length){
  const cell=targetCell||{x:Math.floor(player.x+fx/fm*1.1),y:Math.floor(player.y+fy/fm*1.1)};
  const web=webAt(cell.x,cell.y);
  if(web&&distance(player.x,player.y,web.x+.5,web.y+.5)<2.55&&rayClear(player.x,player.y,web.x+.5,web.y+.5,false))strikeWeb(web,'sword');
 }
 refreshCombatUI();return hits.length>0;
}
function updateCreatures(dt){
 swordCooldown=Math.max(0,swordCooldown-dt);
 playerInvuln=Math.max(0,playerInvuln-dt);
 spawnClock+=dt;if(spawnClock>=1.5){spawnClock=0;creatureSpawnCheck();}
 for(const e of localEnemies()){
  if((e.poison||0)>0){e.poisonTick=(e.poisonTick||1)-dt;
   if(e.poisonTick<=0){e.poison--;e.poisonTick=1;hurtCreature(e,2);if(e.hp<=0)continue;}}
  e.hit=Math.max(0,(e.hit||0)-dt);
  e.attack=Math.max(0,(e.attack||0)-dt);
  e.stagger=Math.max(0,(e.stagger||0)-dt);
  e.webClock=(e.webClock||0)-dt;
  const dist=distance(e.x,e.y,player.x,player.y),spec=MOB_SPECS[e.kind];
  if(e.kind==='spider'&&e.webClock<=0){layWeb(e);e.webClock=Math.max(3.4,6-layer*.37)+hashInt(Math.floor(e.x),Math.floor(e.y),279)*4;}
  if(e.stagger>0)continue;
  if(e.windup>0){
   e.windup=Math.max(0,e.windup-dt);
   if(e.windup<=0){
    e.attack=spec.recovery/(1+e.layer*.065);
    if(dist<1.13&&rayClear(e.x,e.y,player.x,player.y,false)&&playerInvuln<=0){
     const damage=Math.max(1,Math.round(spec.contact*depthStats(e.layer).damage*(e.elite?1.32:1))-Math.floor(totalArmor()/3));
     hp=Math.max(0,hp-damage);playerInvuln=.70;hitFlash=.27;
     if(hp<=0){die();return;}
    }
   }
   continue;
  }
  if(dist>spec.view+e.layer*.55||dist<.25||!rayClear(e.x,e.y,player.x,player.y,false))continue;
  if(dist<1.12&&e.attack<=0){
   e.windup=spec.windup/(1+e.layer*.045);e.dx=(player.x-e.x)/(dist||1);e.dy=(player.y-e.y)/(dist||1);
   continue;
  }
  if(dist>.83){
   const pace=spec.speed*(1+e.layer*.035)*(e.elite?1.12:1)*dt*(e.attack>0?.78:1);
   let dx=(player.x-e.x)/dist,dy=(player.y-e.y)/dist;
   if(e.kind==='bat'){const sway=Math.sin(blink*4+e.x*2.1)*.18;dx+=-dy*sway;dy+=dx*sway;const m=Math.hypot(dx,dy)||1;dx/=m;dy/=m;}
   e.dx=dx;e.dy=dy;
   const ex=e.x+dx*pace,ey=e.y+dy*pace;
   if(canMove(ex,e.y))e.x=ex;
   if(canMove(e.x,ey))e.y=ey;
  }
 }
}
function drawWeb(w,t){
 const a=worldToScreen(w.x,w.y),s=t;
 ctx.strokeStyle='rgba(195,220,223,.78)';ctx.lineWidth=Math.max(1,t*.042);
 ctx.beginPath();ctx.moveTo(a.x+3,a.y+4);ctx.lineTo(a.x+s-3,a.y+s-4);ctx.moveTo(a.x+s-3,a.y+3);ctx.lineTo(a.x+3,a.y+s-3);
 ctx.moveTo(a.x+s*.5,a.y+3);ctx.lineTo(a.x+s*.5,a.y+s-3);ctx.moveTo(a.x+3,a.y+s*.5);ctx.lineTo(a.x+s-3,a.y+s*.5);ctx.stroke();
 ctx.strokeStyle='rgba(147,182,189,.45)';ctx.strokeRect(a.x+s*.24,a.y+s*.24,s*.52,s*.52);
}
function drawCreature(e,t){
 const p=worldToScreen(e.x,e.y),s=t*.85,x=p.x,y=p.y,flash=e.hit>0;
 pixRect(x-s*.34,y+s*.17,s*.68,s*.14,'rgba(0,0,0,.42)');
 if(e.kind==='slime'){
  const bounce=Math.sin(blink*7+e.x)*s*.035;
  pixRect(x-s*.37,y-s*.35+bounce,s*.74,s*.50,flash?'#f6f9e8':'#346b5e');
  pixRect(x-s*.31,y-s*.45+bounce,s*.62,s*.30,flash?'#ffffff':'#58d3a7');
  pixRect(x-s*.24,y-s*.39+bounce,s*.16,s*.12,'#a2f2c5');
  pixRect(x-s*.20,y-s*.17+bounce,s*.105,s*.13,'#142f30');pixRect(x+s*.10,y-s*.17+bounce,s*.105,s*.13,'#142f30');
 }else if(e.kind==='bat'){
  const flap=Math.sin(blink*11+e.x*3)*s*.09;
  pixRect(x-s*.52,y-s*.29+flap,s*.32,s*.14,flash?'#fff':'#66507d');
  pixRect(x+s*.20,y-s*.29-flap,s*.32,s*.14,flash?'#fff':'#66507d');
  pixRect(x-s*.27,y-s*.36,s*.54,s*.46,flash?'#f1f7ff':'#3f374e');
  pixRect(x-s*.20,y-s*.47,s*.14,s*.16,'#846a91');pixRect(x+s*.07,y-s*.47,s*.14,s*.16,'#846a91');
  pixRect(x-s*.16,y-s*.21,s*.10,s*.09,'#f58da7');pixRect(x+s*.07,y-s*.21,s*.10,s*.09,'#f58da7');
 }else if(e.kind==='skeleton'){
  pixRect(x-s*.21,y-s*.43,s*.42,s*.27,flash?'#fff':'#d6d6be');
  pixRect(x-s*.28,y-s*.17,s*.56,s*.29,flash?'#fff':'#8f9c9b');
  pixRect(x-s*.17,y+s*.10,s*.10,s*.24,'#a1a6a0');pixRect(x+s*.08,y+s*.10,s*.10,s*.24,'#a1a6a0');
  pixRect(x-s*.13,y-s*.33,s*.08,s*.09,'#212c32');pixRect(x+s*.05,y-s*.33,s*.08,s*.09,'#212c32');
  pixRect(x+s*.30,y-s*.34,s*.09,s*.47,'#856844');pixRect(x+s*.24,y-s*.43,s*.28,s*.12,'#a8b6ad');
 }else{
  for(const sign of [-1,1])for(let i=0;i<3;i++){
   const yy=y-s*.21+i*s*.19;
   pixRect(x+sign*s*.17-(sign<0?s*.29:0),yy,s*.28,s*.07,flash?'#f8f7ea':'#38394f');
  }
  pixRect(x-s*.27,y-s*.33,s*.54,s*.50,flash?'#fff6e5':'#29293c');
  pixRect(x-s*.25,y-s*.40,s*.50,s*.29,flash?'#ffffff':'#5b5162');
  pixRect(x-s*.19,y-s*.24,s*.10,s*.10,'#e96574');pixRect(x+s*.09,y-s*.24,s*.10,s*.10,'#e96574');
 }
 if(e.windup>0){
  const power=clamp(1-e.windup/(MOB_SPECS[e.kind].windup||.4),0,1);
  ctx.strokeStyle=`rgba(255,114,93,${.45+power*.5})`;
  ctx.lineWidth=Math.max(2,t*.06);ctx.beginPath();ctx.arc(x,y,s*.62,0,Math.PI*2);ctx.stroke();
  pixRect(x-s*.17,y-s*.81,s*.34,s*.10,'#3c2026');
  pixRect(x-s*.16,y-s*.80,s*.32*power,s*.07,'#ff8c64');
 }
 if(e.hp<e.maxHp||e.id===selectedEnemy){
  const bw=s*.80,bh=Math.max(3,s*.075);pixRect(x-bw/2,y-s*.72,bw,bh,'#1c2026');
  pixRect(x-bw/2,y-s*.72,bw*clamp(e.hp/e.maxHp,0,1),bh,'#dc7b68');
 }
 if(e.id===selectedEnemy){ctx.strokeStyle='#f4cc81';ctx.lineWidth=2;ctx.strokeRect(Math.round(x-s*.47),Math.round(y-s*.56),Math.round(s*.94),Math.round(s*.80));}
}
const releasePopup=$('release-popup');
function canAim(){
 return playing&&!paused&&releasePopup.classList.contains('hidden');
}
function targetPathClear(bx,by){
 const dx=bx-player.x,dy=by-player.y;
 let x=Math.floor(player.x),y=Math.floor(player.y);
 const tx=Math.floor(bx),ty=Math.floor(by),sx=Math.sign(dx),sy=Math.sign(dy);
 // Comprueba cada celda que atraviesa el segmento, incluso cerca de una esquina.
 while(x!==tx||y!==ty){
  const nextX=x===tx?Infinity:(x+(sx>0?1:0)-player.x)/dx;
  const nextY=y===ty?Infinity:(y+(sy>0?1:0)-player.y)/dy;
  if(Math.abs(nextX-nextY)<1e-9&&(blocksTargetPath(x+sx,y)||blocksTargetPath(x,y+sy)))return false;
  if(nextX<=nextY)x+=sx;
  if(nextY<=nextX)y+=sy;
  if((x!==tx||y!==ty)&&blocksTargetPath(x,y))return false;
 }
 // Los portones narrativos bloquean movimiento aunque el terreno sea transitable.
 if(layer===1){
  const steps=Math.ceil(Math.hypot(dx,dy)*12);
  for(let i=1;i<steps;i++){
   const px=player.x+dx*i/steps,py=player.y+dy*i/steps;
   if(Math.floor(px)===tx&&Math.floor(py)===ty)break;
   if(blockedByDungeonGate(px,py))return false;
  }
 }
 return true;
}
function blocksTargetPath(x,y){return tileAt(x,y)!==T.FLOOR||isSolidStructure(structureAt(x,y));}
function handTargetError(p){
 if(!p||p.decorative)return 'Apunta o toca una puerta, cofre o estación.';
 if(isWallStructure(p))return 'Este muro no se utiliza: pícalo con el botón Acción.';
 if(distance(player.x,player.y,p.x,p.y)>HAND_REACH)return 'Acércate para interactuar.';
 if(tileAt(p.x,p.y)!==T.FLOOR||!targetPathClear(p.x,p.y))return 'Una pared bloquea la interacción.';
 if(p.kind==='dungeonboss'){
  if(!dungeonSealsReady())return 'Necesitas activar los dos sellos de la galería antes de desafiar a la Viuda.';
  if(quantity('sword')<1)return 'La Viuda es demasiado peligrosa sin una espada. Abre los cofres y prepárate.';
 }
 return '';
}
function reticleTarget(props){
 const {x,y}=reticleCell();
 if(distance(player.x,player.y,x+.5,y+.5)>HAND_REACH+Math.SQRT1_2)return null;
 return selectedPropAt(x,y,props);
}
function tappedHandTarget(props){
 if(!handSelection||handSelection.layer!==layer||handSelection.player!==player||handSelection.cell!==targetCell)return null;
 const p=selectedPropAt(targetCell.x,targetCell.y,props);
 return p?.id===handSelection.id&&p.kind===handSelection.kind&&(!handSelection.built||p===handSelection.built)?p:null;
}
// La retícula tiene prioridad. El clic secundario conserva su destino explícito.
function doInteract(explicitTarget){
 if(!canAim())return;
 const aimed=explicitTarget===undefined?reticleTarget():explicitTarget;
 const aimError=handTargetError(aimed);
 if(!aimError){clearAimSelection();interactWithProp(aimed);return;}
 if(explicitTarget===undefined){
  const tapped=tappedHandTarget();
  if(tapped){
   const error=handSelection.error||handTargetError(tapped);
   if(!error){miningSelection=null;interactWithProp(tapped);return;}
   handSelection=null;toast(error,1550,'warning');return;
  }
 }
 toast(aimError,1550,'warning');
}
function interactWithProp(p){
 if(p.kind==='supplycache'){
  if(story39.openedChests.includes(p.id)){toast('Este alijo ya fue registrado. No queda nada.',1700);return;}
  story39.openedChests.push(p.id);gain('cristal',1);gain('antorcha',2);
  queueSave();toast('✦ Encontraste 1 cristal y 2 antorchas. ¡Ya puedes preparar tu primera lámpara!',2900);return;
 }
 if(p.kind==='ruin'){toast(p.label+' · '+(p.msg||'Una ruina olvidada.'),2900);return;}
 if(p.kind==='mine_remains'){interactWithRemains(p);return;}
 if(p.kind==='dungeonentrance'){learnLore('entrance');seedDungeon();showModal('journal');return;}
 if(p.kind==='dungeonchest'){openDungeonChest(p);return;}
 if(p.kind==='dungeonrecord'){readForeman(p.note||'foreman');return;}
 if(p.kind==='dungeoncheckpoint'){activateDungeonCheckpoint();return;}
 if(p.kind==='dungeongate'){toast(dungeonSealsReady()?'El nido está abierto. Entra con cautela.':'El portón exige activar los dos sellos antiguos.',2600,dungeonSealsReady()?'important':'warning');return;}
 if(p.kind==='dungeonboss'){openStory39('widow');return;}
 if(p.kind==='dungeonseal'){if(p.seal){activateDungeonSeal(p);return;}if(!story39.widowDefeated){toast('El sello solo cederá cuando caiga la Viuda de Carbón.',2600,'warning');return;}story39.gateOpen=true;queueSave();toast('El sello de seda se ha desvanecido.',2000);return;}
 if(p.kind==='tree'){collectWood(p);return;}
 if(p.kind==='anvil'||(p.layer!==undefined&&structures.has(p.id))){interactBuilt(p);return;}
 if(Number.isInteger(p.to)){changeLevel(p);return;}
 if(p.label)toast(p.label+(p.msg?' · '+p.msg:''),2300);
}
function setActionVisual(iconMarkup,label,active,showContext,ctxIcon,ctxText){
 const sig=[iconMarkup,label,active?'1':'0',showContext?'1':'0',ctxIcon||'',ctxText||''].join('|');
 if(sig===lastActionVisual)return;
 lastActionVisual=sig;
 UI.actionBtn.classList.toggle('active',!!active);
 if(UI.actGlyph.dataset.key!==iconMarkup){UI.actGlyph.dataset.key=iconMarkup;UI.actGlyph.innerHTML=iconMarkup;}
 if(UI.actLabel.textContent!==label)UI.actLabel.textContent=label;
 if(showContext){UI.context.classList.remove('hidden');if(UI.ctxIcon.textContent!==String(ctxIcon||''))UI.ctxIcon.textContent=ctxIcon||'';if(UI.ctxLabel.textContent!==String(ctxText||''))UI.ctxLabel.textContent=ctxText||'';}
 else UI.context.classList.add('hidden');
}
function updateContext(pickTarget){
 const it=pickedItem(),item=ITEMS[it?.id];
 if(item?.place){setActionVisual(itemArt(it.id,'action-art'),'PLANO',true,false);return;}
 if(it?.id==='sword'){const mob=selectedEnemy?enemies.get(selectedEnemy):null;setActionVisual(itemArt('sword','action-art'),'ATACAR',true,!!mob,'⚔',mob?`${MOB_NAMES[mob.kind]||'Criatura'} · ${Math.ceil(mob.hp)} PV`:null);return;}
 if(it?.id==='vendaje'||it?.id==='vendajefuerte'){setActionVisual(itemArt(it.id,'action-art'),'CURAR',true,false);return;}
 if(it?.id==='tonico'){setActionVisual(itemArt('tonico','action-art'),'VIGOR',true,false);return;}
 if(it?.id==='martillo'){
  const repair=repairWear(repairTarget()),material=repair?.material;
  const label=repair?.damage>0?`Reparar · 1 ${ITEMS[material]?.name||'material'}`:repair?.material?'Sin daños':'Selecciona un bloque dañado';
  setActionVisual(itemArt('martillo','action-art'),'REPARAR',true,!!repair,'🔨',label);return;
 }
 if(it?.id==='pick'){
  const a=pickTarget===undefined?miningTarget():pickTarget;
  if(a?.kind==='web'){setActionVisual(itemArt('pick','action-art'),'CORTAR',true,true,'≋','Telaraña · hilo recuperable');return;}
  if(a?.kind==='floor'){
   const id=floorAt(a.x,a.y),kind=id==='stonefloor'?'stonewall':'woodwall';
   setActionVisual(itemArt('pick','action-art'),'PICAR',true,true,'⚒',`Piso · ${demolitionProgress(floorDismantleKey(a.x,a.y))}/${dismantleTotal(kind)} golpes`);return;
  }
  if(a?.kind==='prop'&&a.p.layer!==undefined&&structures.has(a.p.id)){
   setActionVisual(itemArt('pick','action-art'),'PICAR',true,true,'⚒',`Demoler · ${demolitionProgress(dismantleKey(a.p))}/${dismantleTotal(a.p.kind)} golpes`);return;
  }
  if(a?.kind==='wall'){
   const d=breakDamage.get(layer+':'+a.x+':'+a.y)||0;
   if(!wallCanBeMined(a.type)){setActionVisual(itemArt('pick','action-art'),'MEJORAR',true,true,'⚒',NAMES[a.type]+' · Pico insuficiente · RECETAS → FORJA');return;}
   setActionVisual(itemArt('pick','action-art'),'PICAR',true,true,'⚒',NAMES[a.type]+' · '+Math.max(0,HARD[a.type]-d)+' golpes restantes');return;
  }
  setActionVisual(itemArt('pick','action-art'),'PICAR',true,false);return;
 }
 setActionVisual('✦','ACCIÓN',false,false);
}
// Routine mining / tapping messages are intentionally silent. Only actionable or milestone alerts are shown.
function toast(str,ms=2200,kind='important'){
 if(kind==='common')return;
 UI.toast.textContent=str;
 UI.toast.classList.toggle('warning',kind==='warning');
 UI.toast.classList.add('visible');
 toastUntil=performance.now()+Math.min(ms,3200);
}
function wallCanBeMined(type){
 const requiredTier=[T.GOLD,T.CRYSTAL,T.MITHRIL].includes(type)?2:[T.ADAMANTITE,T.ANCIENT].includes(type)?3:1;
 return (player.pick||1)>=requiredTier&&HARD[type]<=(Math.max(1,player.pick||1)+progression.skills.mining)*4+1;
}
function mineWall(a){let diff=HARD[a.type],power=Math.max(1,player.pick||1)+progression.skills.mining,pk=layer+':'+a.x+':'+a.y,old=breakDamage.get(pk)||0;
 if(!wallCanBeMined(a.type)){if(!actionHeld)toast('Pico insuficiente. Mejora en RECETAS → FORJA.',2650,'warning');return;}
 let next=old+power;hitFlash=.18;
 if(next<diff){breakDamage.set(pk,next);scheduleSave();return;}
 breakDamage.delete(pk);setTile(a.x,a.y,T.FLOOR);if(selectedTile&&selectedTile.x===a.x&&selectedTile.y===a.y)selectedTile=null;
 const k=builtKey(layer,a.x,a.y),builtHere=placedBlocks.has(k),ore=placedBlocks.get(k)||(ORE[a.type]||'piedra');placedBlocks.delete(k);ores[ore]=(ores[ore]||0)+1;gain(ore,1);
 if(!builtHere&&toolRunes.pick==='runa_veta'&&['cobre','carbon','hierro','oro','cristal','mithril'].includes(ore)&&Math.random()<.15){gain(ore,1);ores[ore]++;toast('✧ Runa de Veta: +1 '+ITEMS[ore].name,1700);}stats.mined++;if(!builtHere)addExperience(({piedra:1,tierra:1,cobre:4,carbon:3,hierro:7,oro:12,cristal:15,mithril:18,adamantita:23,ancestral:27})[ore]||1,'minería');reveal();
 if(stats.mined===20||stats.mined===60||stats.mined===140)toast('⚒ Próxima mejora: RECETAS → FORJA · Pico de cobre.',2400);
 else if(stats.mined===1||stats.mined%17===0)toast('+'+1+' '+ore+' · '+stats.mined+' bloques excavados',1200,'common');
 if(navigator.vibrate)try{navigator.vibrate(8);}catch{}scheduleSave();
}
function changeLevel(p){clearAimSelection();selectedEnemy=null;dismantleDamage.clear();dismantleFX=null;resetMiningFocus();clearBlueprint();if(!Number.isInteger(p.to)||p.to<0||p.to>=LAYERS)return;
 layer=p.to;if(layer===1){seedDungeon();if(!worldLayoutVersion)learnLore('entrance');}invalidateLights();player.x=p.spawn.x;player.y=p.spawn.y;screen.camX=player.x;screen.camY=player.y;selectedTile=null;breakDamage.clear();vis=new Set();visitedLevels.add(layer);stats.transitions++;reveal();updateHud();queueSave();toast('✦ Nivel '+layer+' · '+LEVELS[layer].name,2700);checkDanger(layer);
}
function doAction(silent=false){
 if(!playing||paused)return;
 actionCD=.16;const it=pickedItem();
 if(ITEMS[it?.id]?.place){if(!silent)tryBuild();return;}
 if(it?.id==='vendaje'||it?.id==='vendajefuerte'){
  if(silent||hp>=100)return;
  if(removeFrom(inventory,it.id,1)){hp=Math.min(100,hp+(it.id==='vendajefuerte'?45:25));refreshHotbar();updateHud();queueSave();}return;
 }
 if(it?.id==='tonico'){
  if(silent||stamina>=MAX_STAMINA)return;
  if(removeFrom(inventory,'tonico',1)){stamina=Math.min(MAX_STAMINA,stamina+55);refreshHotbar();refreshCombatUI();queueSave();}return;
 }
 if(it?.id==='sword'){swordAttack(false);return;}
 if(it?.id==='martillo'){if(!silent)repairWithHammer(repairTarget());return;}
 if(it?.id!=='pick'){if(!silent)toast('Selecciona una herramienta o un objeto para construir.',1400,'warning');return;}
 if(!canAim())return;
 const a=miningTarget();
 if(a?.kind==='web'){strikeWeb(a.web,'pick');return;}
 if(a?.kind==='floor'){mineBuiltFloor(a.x,a.y);return;}
 if(a?.kind==='prop'){
  if(a.p.kind==='tree'){collectWood(a.p);return;}
  if(a.p.layer!==undefined&&structures.has(a.p.id)){mineBuiltStructure(a.p);return;}
  if(!silent)toast('Para usar este lugar pulsa MANO.',1450,'warning');return;
 }
 if(a?.kind==='wall'){mineWall(a);return;}
 if(!silent)toast('Apunta a una pared o estructura para picar.',1450,'warning');
}
function updateHud(){refreshProgressionHud();UI.region.textContent=LEVELS[layer].name;UI.steps.textContent='NIVEL '+layer;const sub=$('hud-subzone');if(sub)sub.textContent=(LEVELS[layer].subtitle||'Exploración')+' · Personaje Nv. '+progression.level;if(UI.miniLevel)UI.miniLevel.textContent=String(layer);UI.quest.textContent=layer===1&&!story39.widowDefeated?'GALERÍA SILENCIOSA · SELLOS '+story39.seals.length+'/2 · '+(dungeonSealsReady()?'NIDO ABIERTO':'EXPLORA Y BUSCA LOS SELLOS'):layer<7?'EXPLORA · Busca entradas y pistas en las ruinas · '+visitedLevels.size+'/8 estratos':'CORAZÓN DESCUBIERTO · Sigue explorando el reino';UI.resources.textContent='♥ '+Math.round(hp)+'/100 · ⚒ PICO '+(player.pick||1)+' · 🛡 '+totalArmor()+' · ⚔ '+(player.weaponTier||0)+' · '+stats.mined+' bloques · ⚔ '+(stats.kills||0)+' bajas';}


function b64(uint){let s='';for(let i=0;i<uint.length;i++)s+=String.fromCharCode(uint[i]);return btoa(s);}
function fromB64(str){const s=atob(str),r=new Uint8Array(CH*CH);for(let i=0;i<Math.min(s.length,r.length);i++)r[i]=s.charCodeAt(i);return r;}
function snapshot(){return{version:4,progression:{...progression,skills:{...progression.skills}},story39:{...story39,clues:[...story39.clues],openedChests:[...story39.openedChests],remainsSearched:[...story39.remainsSearched]},boss39:battleSaveState(),stamina:Math.round(stamina),enemies:[...enemies.values()].map(e=>({...e})),defeatedEnemies:[...defeatedEnemies],webs:[...webs],starterGelGranted,equipment:Object.fromEntries(Object.entries(equipment).map(([k,v])=>[k,v?{...v}:null])),structuralWear:[...dismantleDamage],miningWear:[...breakDamage],blueprints:[...blueprint],floorTiles:[...floorTiles],inventory:inventory.map(it=>it?{...it}:null),runeSockets:{...toolRunes},slot,structures:[...structures],backs:[...backs],placedBlocks:[...placedBlocks],harvested:[...harvested],groundDrops,deathBags,mainBase,respawn,hp,seed,worldLayoutVersion,layer,gender:player.gender,position:{x:player.x,y:player.y},steps:player.steps,pick:player.pick||1,weaponTier:player.weaponTier||0,armorTier:player.armorTier||0,stats:{...stats},ore:{...ores},visited:[...visitedLevels],edits:[...mined.entries()],exploration:[...fog.entries()].map(([k,v])=>[k,b64(v)]),savedAt:new Date().toISOString()};}
function normalizeSave(s){return s&&(s.version===2||s.version===3||s.version===4)&&Number.isFinite(s.seed)&&s.position&&Number.isFinite(s.position.x)&&s.position.x>=-MAX&&s.position.x<=MAX&&Number.isInteger(s.layer)&&s.layer>=0&&s.layer<LAYERS&&Array.isArray(s.edits)&&Array.isArray(s.exploration)?s:null;}
function openDB(){return new Promise(resolve=>{if(!('indexedDB'in window))return resolve(null);let req;try{req=indexedDB.open(DB_NAME,1);}catch{return resolve(null);}req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(DB_STORE))req.result.createObjectStore(DB_STORE)};req.onsuccess=()=>resolve(req.result);req.onerror=()=>resolve(null);req.onblocked=()=>resolve(null);});}
async function readStored(){try{if(db){const r=await new Promise(resolve=>{try{let req=db.transaction(DB_STORE,'readonly').objectStore(DB_STORE).get('current');req.onsuccess=()=>resolve(req.result);req.onerror=()=>resolve(null);}catch{resolve(null)}});if(normalizeSave(r))return r;}}catch{}
 try{return normalizeSave(JSON.parse(localStorage.getItem(SAVE_KEY)||'null'));}catch{return null;}}
async function writeStored(data){if(db){try{await new Promise((resolve,reject)=>{let tx=db.transaction(DB_STORE,'readwrite');tx.objectStore(DB_STORE).put(data,'current');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});return true;}catch(e){console.warn('IndexedDB save fallback',e);}}
 try{localStorage.setItem(SAVE_KEY,JSON.stringify(data));return true;}catch(e){console.warn('No save space',e);return false;}}
let delayedSave=null;function scheduleSave(){clearTimeout(delayedSave);delayedSave=setTimeout(()=>queueSave(),1200);}
function queueSave(silent=true){if(!playing)return Promise.resolve(false);const data=snapshot();saveChain=saveChain.then(()=>writeStored(data)).then(ok=>{if(!ok&&!silent)toast('No fue posible guardar: revisa el espacio del navegador.',2900,'warning');else if(!silent)toast('Expedición guardada en este dispositivo.');return ok;});return saveChain;}
function restore(s){clearAimSelection();story39={...freshStory39(),...(s.story39&&typeof s.story39==='object'?s.story39:{prologueSeen:true})};story39.seals=Array.isArray(story39.seals)?story39.seals.filter(x=>DUNGEON_SEALS.includes(x)):[];if(story39.widowDefeated)story39.seals=[...DUNGEON_SEALS];story39.clues=Array.isArray(story39.clues)?story39.clues.filter(x=>STORY_FRAGMENTS[x]).slice(0,20):[];story39.openedChests=Array.isArray(story39.openedChests)?story39.openedChests.filter(x=>typeof x==='string').slice(0,30):[];story39.remainsSearched=Array.isArray(story39.remainsSearched)?[...new Set(story39.remainsSearched.filter(x=>typeof x==='string'))].slice(0,3000):[];remainsChunkCache.clear();pendingBattle39=s.boss39&&!story39.widowDefeated?s.boss39:null;bossBattle=null;stamina=clamp(Number.isFinite(s.stamina)?s.stamina:100,0,100);staminaDelay=0;dodgeTime=0;dodgeCooldown=0;swordCharging=false;attackFX=null;enemies=new Map();defeatedEnemies=new Set(Array.isArray(s.defeatedEnemies)?s.defeatedEnemies.filter(x=>typeof x==='string').slice(0,15000):[]);webs=new Map();selectedEnemy=null;
 for(const e of Array.isArray(s.enemies)?s.enemies.slice(0,800):[]){if(e&&typeof e.id==='string'&&!!MOB_SPECS[e.kind]&&Number.isInteger(e.layer)&&e.layer>=0&&e.layer<LAYERS&&Number.isFinite(e.x)&&Number.isFinite(e.y)&&Number.isFinite(e.hp)&&e.hp>0&&inWorld(e.x,e.y))enemies.set(e.id,{id:e.id,kind:e.kind,layer:e.layer,x:e.x,y:e.y,hp:e.hp,maxHp:e.maxHp||MOB_SPECS[e.kind].hp,hit:0,attack:0,webClock:3,windup:0,stagger:0,dx:0,dy:1,elite:!!e.elite,poison:clamp(Number(e.poison)||0,0,3),poisonTick:clamp(Number(e.poisonTick)||1,.01,2)});}
 for(const entry of Array.isArray(s.webs)?s.webs.slice(0,2000):[]){const [k,w]=entry||[];if(typeof k==='string'&&w&&Number.isInteger(w.layer)&&w.layer>=0&&w.layer<LAYERS&&inWorld(w.x,w.y))webs.set(k,{x:w.x,y:w.y,layer:w.layer,hp:Math.max(1,Math.min(2,w.hp||2)),owner:String(w.owner||'')});}
 dismantleDamage.clear();breakDamage.clear();dismantleFX=null;resetMiningFocus();invalidateLights();blueprint.clear();blueprintHistory=[];ghostCells=[];seed=s.seed>>>0;worldLayoutVersion=s.worldLayoutVersion===1?1:0;layoutCache.clear();layer=s.layer;player={x:s.position.x,y:s.position.y,gender:s.gender==='female'?'female':'male',dirX:0,dirY:1,face:'down',walk:0,steps:+s.steps||0,pick:clamp(+s.pick||1,1,5),weaponTier:clamp(+s.weaponTier||0,0,3),armorTier:clamp(+s.armorTier||0,0,3)};
 stats={mined:0,explored:0,visits:0,transitions:0,...s.stats};progression=restoreProgression(s.progression,stats);refreshProgressionHud();ores=s.ore&&typeof s.ore==='object'?{...s.ore}:{};visitedLevels=new Set(s.visited||[0]);
 mined=new Map();fog=new Map();chunkCache.clear();glowPropCache.clear();for(const [k,e] of s.edits){if(typeof k==='string'&&e&&typeof e==='object')mined.set(k,e);}for(const [k,a] of s.exploration){try{if(typeof k==='string'&&typeof a==='string')fog.set(k,fromB64(a))}catch{}}

 structures=new Map(Array.isArray(s.structures)?s.structures:[]);backs=new Map(Array.isArray(s.backs)?s.backs:[]);floorTiles=new Map(Array.isArray(s.floorTiles)?s.floorTiles:[]);
 for(const [k,id] of backs.entries()){
  if(structures.has(k))continue;
  const cell=parseBuiltKey(k);
  if(id==='woodback'||id==='stoneback')structures.set(k,{x:cell.x+.5,y:cell.y+.5,layer:cell.layer,kind:id==='woodback'?'woodwall':'stonewall',id:k,open:false});
 }
 backs=new Map();
 for(const [k,p] of structures.entries()){if(p.kind==='platform'){floorTiles.set(k,'platform');structures.delete(k);}}
 if(Array.isArray(s.structuralWear))for(const entry of s.structuralWear.slice(0,4000)){
  const [k,d]=entry||[];if(typeof k==='string'&&d&&Number.isFinite(d.hits)&&Number.isFinite(d.total)&&d.hits>0&&d.hits<d.total&&Number.isInteger(d.layer)){
   if(k.startsWith('s:')&&structures.has(k.slice(2))||k.startsWith('f:')&&floorTiles.has(k.slice(2)))dismantleDamage.set(k,d);
  }
 }
 if(Array.isArray(s.miningWear))for(const entry of s.miningWear.slice(0,4000)){
  const [k,damage]=entry||[];const coords=typeof k==='string'?k.split(':').map(Number):[];
  if(coords.length===3&&coords.every(Number.isInteger)&&coords[0]>=0&&coords[0]<LAYERS&&Number.isFinite(damage)&&damage>0){const type=tileAt(coords[1],coords[2],coords[0]);if(type!==T.FLOOR&&damage<HARD[type])breakDamage.set(k,damage);}
 }
 placedBlocks=new Map(Array.isArray(s.placedBlocks)?s.placedBlocks:[]);harvested=new Set(Array.isArray(s.harvested)?s.harvested:[]);
 if(Array.isArray(s.blueprints)){for(const entry of s.blueprints.slice(0,BLUEPRINT_MAX)){if(!Array.isArray(entry)||!entry[1]||!ITEMS[entry[1].id])continue;const c=entry[1];if(Number.isInteger(c.x)&&Number.isInteger(c.y)&&Number.isInteger(c.layer)&&c.layer===layer)blueprint.set(plannedKey(c.id,c.x,c.y,c.layer),{id:c.id,x:c.x,y:c.y,layer:c.layer});}}
 groundDrops=Array.isArray(s.groundDrops)?s.groundDrops:[];deathBags=Array.isArray(s.deathBags)?s.deathBags:[];
 mainBase=typeof s.mainBase==='string'?s.mainBase:null;respawn=s.respawn&&Number.isInteger(s.respawn.layer)?s.respawn:{layer:0,x:.5,y:.5};
 equipment={head:null,chest:null,legs:null,feet:null,offhand:null};
 toolRunes={sword:null,pick:null};
 for(const kind of ['sword','pick']){const v=s.runeSockets?.[kind];if(runeAllowed(v,kind))toolRunes[kind]=v;}
 if(!toolRunes.sword&&story39.enchant)toolRunes.sword=story39.enchant==='veneno'?'runa_veneno':story39.enchant==='hielo'?'runa_hielo':null;
 story39.enchant=toolRunes.sword==='runa_veneno'?'veneno':toolRunes.sword==='runa_hielo'?'hielo':null;
 runeTarget='sword';
 if(s.equipment&&typeof s.equipment==='object'){for(const k of Object.keys(equipment)){const it=s.equipment[k];if(it&&ITEMS[it.id]?.equip===k)equipment[k]={...it,n:1,rune:runeAllowed(it.rune,k)&&(k!=='offhand'||it.id==='escudo')?it.rune:null,...(it.id==='lampara'?{fuel:Math.max(0,Math.min(LAMP_CAP,Number(it.fuel)||0)),on:it.on!==false}:{})};}}
 else if(player.armorTier>0){const id='pechera_'+['','cobre','hierro','oro'][Math.min(3,player.armorTier)];equipment.chest={id,n:1};}
 hp=clamp(+s.hp||100,1,100);slot=clamp(+s.slot||0,0,7);targetCell=null;invSource=null;openChestKey=null;
 if(Array.isArray(s.inventory)&&s.inventory.length===40){inventory=s.inventory.map(it=>it&&ITEMS[it.id]&&Number.isInteger(it.n)&&it.n>0?{...it,id:it.id,n:clamp(it.n,1,ITEMS[it.id].max),...(it.rune?{rune:runeAllowed(it.rune,ITEMS[it.id]?.equip)&&(it.id!=='lampara')?it.rune:null}:{})}:null);}
 else{startingInventory();for(const [id,n] of Object.entries(ores))if(ITEMS[id]&&n>0){let remaining=storeIn(inventory,id,n);if(remaining)dropAt(id,remaining,.5,.5,0);}}
 if(!s.starterGelGranted){const rest=storeIn(inventory,'gel',4);if(rest)dropAt('gel',rest,player.x,player.y,layer);starterGelGranted=true;}else starterGelGranted=true;
 refreshHotbar();updateBlueprintUI();chunkCache.clear();selectedTile=null;if(!canMove(player.x,player.y)){if(layer===1&&inDungeon(player.x,player.y)){({x:player.x,y:player.y}=dungeonPoint(26.5,.5));}else{player.x=START.x;player.y=START.y;}}screen.camX=player.x;screen.camY=player.y;}
function newGame(){progression=freshProgression();refreshProgressionHud();story39=freshStory39();remainsChunkCache.clear();bossBattle=null;pendingBattle39=null;stamina=MAX_STAMINA;staminaDelay=0;dodgeTime=0;dodgeCooldown=0;swordCharging=false;attackFX=null;enemies.clear();defeatedEnemies.clear();webs.clear();selectedEnemy=null;dismantleDamage.clear();dismantleFX=null;resetMiningFocus();invalidateLights();blueprint.clear();blueprintHistory=[];ghostCells=[];seed=(Math.random()*0x7fffffff)>>>0;worldLayoutVersion=1;layoutCache.clear();layer=0;chunkCache.clear();glowPropCache.clear();mined.clear();fog.clear();vis.clear();stats={mined:0,explored:0,visits:1,transitions:0};ores={piedra:0,tierra:0,cobre:0};visitedLevels=new Set([0]);breakDamage.clear();selectedTile=null;structures.clear();backs.clear();floorTiles.clear();placedBlocks.clear();harvested.clear();groundDrops=[];deathBags=[];mainBase=null;respawn={layer:0,x:.5,y:.5};hp=100;targetCell=null;equipment={head:null,chest:null,legs:null,feet:null,offhand:null};toolRunes={sword:null,pick:null};runeTarget='sword';starterGelGranted=true;startingInventory();refreshHotbar();
 player={x:START.x,y:START.y,gender:selCharacter,dirX:0,dirY:1,face:'down',walk:0,steps:0,pick:1,weaponTier:0,armorTier:0};screen.camX=player.x;screen.camY=player.y;startPlay();toast('⛏ Toca una pared y mantén PICAR.',2600);}
function continueGame(s){restore(s);startPlay();toast('Has regresado a '+LEVELS[layer].name,1400,'common');}
function startPlay(){clearAimSelection();refreshProgressionHud();if(layer===1)seedDungeon();refreshHotbar();refreshLampButton();playing=true;paused=false;refreshCombatUI();UI.menu.classList.add('hidden');UI.hud.classList.remove('hidden');UI.modal.classList.add('hidden');modalType='';reveal();updateHud();updateContext();updateBlueprintUI();queueSave();if(!story39.prologueSeen)openStory39('prologue');else if(pendingBattle39){const saved=pendingBattle39;pendingBattle39=null;startWidowBattle(saved);}try{canvas.focus({preventScroll:true})}catch{}}
function setCharacter(ch){selCharacter=ch;document.querySelectorAll('[data-character]').forEach(el=>{let on=el.dataset.character===ch;el.classList.toggle('selected',on);el.setAttribute('aria-pressed',String(on));});}
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let mapView={x:0,y:0,zoom:3.6};
function showModal(type){if(!playing)return;clearAimSelection();const previousModalType=modalType;paused=true;resetJoy();actionHeld=false;cancelSwordCharge();dodgeTime=0;resetMiningFocus();UI.actionBtn.classList.remove('pressed');modalType=type;UI.modal.classList.remove('hidden');const title=$('modal-title'),body=$('modal-body');
 if(type==='pause'){
  title.textContent='Expedición en pausa';body.innerHTML=`<p class="panel-text"><b>${player.gender==='female'?'Enana minera':'Enano minero'}</b> · Nivel ${layer}: <b>${escapeHTML(LEVELS[layer].name)}</b>. Tus minas son un mundo procedural persistente; la partida de la 1.6 sigue independiente.</p><div class="panel-grid"><div class="info-tile"><strong>${stats.placed||0} construcciones</strong><span>Bloques, muebles y refugios</span></div><div class="info-tile"><strong>${stats.crafted||0} fabricados</strong><span>Objetos hechos en esta partida</span></div><div class="info-tile"><strong>${stats.mined} bloques</strong><span>Minerales y roca picados</span></div><div class="info-tile"><strong>${stats.kills||0} criaturas</strong><span>Enemigos derrotados</span></div><div class="info-tile"><strong>${stats.explored} casillas</strong><span>Mapa revelado</span></div><div class="info-tile"><strong>${visitedLevels.size} / 8 niveles</strong><span>Profundidades visitadas</span></div><div class="info-tile"><strong>Personaje nivel ${progression.level}</strong><span>${progression.points} puntos de habilidad · ${progression.xp} XP</span></div><div class="info-tile"><strong>Pico nivel ${player.pick}</strong><span>Dominio minero provisional</span></div></div><div class="panel-actions"><button class="primary" data-a="resume">▶ CONTINUAR</button><button data-a="save">▣ GUARDAR</button><button data-a="export">⇩ RESPALDO</button><button data-a="import">⇧ IMPORTAR</button><button data-a="craft">⚒ RECETAS</button><button data-a="journal">▤ DIARIO</button><button data-a="updates">✧ NOVEDADES</button><button data-a="skills">✧ HABILIDADES</button><button data-a="help">? GUÍA</button><button data-a="new">↻ NUEVO MUNDO</button></div>`;
 }else if(type==='updates'){
  title.textContent='Novedades · Historial';body.innerHTML=releaseHistoryMarkup();
 }else if(type==='map'){
  mapView={x:player.x,y:player.y,zoom:5};const mapHeight=(screen.w>screen.h&&screen.h<480)?188:440;title.textContent='Mapa · Nivel '+layer;body.innerHTML=`<p class="panel-text">${escapeHTML(LEVELS[layer].name)} · El terreno se revela al caminar o picar. Arrastra el mapa para explorar lo descubierto.</p><canvas id="exploration-map" class="map-canvas" width="624" height="${mapHeight}"></canvas><div class="map-controls"><button data-m="plus">＋</button><button data-m="minus">－</button><button data-m="center">⌖ CENTRAR</button><span id="map-coord">x ${Math.floor(player.x)}, y ${Math.floor(player.y)}</span></div><p class="legend">◆ Tú · <b>●</b> Escaleras descubiertas · Negro = desconocido · El mapa es diferente en cada nivel.</p><div class="panel-actions"><button class="primary" data-a="resume">VOLVER A EXPLORAR</button></div>`;
  drawMap();setupMapControls();
 }else if(type==='journal'){
  title.textContent='Diario de Khaz’dûn';body.innerHTML=journalPanel();
 }else if(type==='bag'){
  title.textContent='Mochila · 40 espacios';body.innerHTML=inventoryPanel();
 }else if(type==='craft'){
  title.textContent='Recetas · Artesanía';body.innerHTML=craftPanel();
 }else if(type==='forge'){
  title.textContent='Forja · Picos y Espadas';body.innerHTML=forgePanel();
 }else if(type==='equip'){
  title.textContent='Personaje · Equipamiento';body.innerHTML=equipmentPanel();
 }else if(type==='runes'){
  title.textContent='Runas · Engastes';body.innerHTML=runesScreen();
 }else if(type==='skills'){
  title.textContent='Progresión · Habilidades';body.innerHTML=skillsPanel();
 }else if(type==='chest'){
  title.textContent='Cofre · Almacenamiento';body.innerHTML=chestPanel();
 }else if(type==='furnace'){
  title.textContent='Horno · La Forja';body.innerHTML=furnacePanel();
 }else{
  title.textContent='Guía de exploración';body.innerHTML=`<p class="panel-text">Alpha 3 conserva el mundo cenital de la Alpha 2.1 y añade construcción real, bolsa, cofres, camas y refugios.</p>
  <div class="help-control"><span>Interactuar</span><span>MANO (F) abre cofres, puertas, escaleras y estaciones, sin cambiar la hotbar</span></div>
  <div class="help-control"><span>Seleccionar</span><span>Toca un objeto: solo lo marcas, no lo usas automáticamente</span></div>
  <div class="help-control"><span>Moverse</span><span>Joystick · WASD · flechas</span></div>
  <div class="help-control"><span>Picar</span><span>Elige el pico, toca una pared y mantén ACCIÓN. Oro y cristal requieren Pico de cobre (RECETAS → FORJA)</span></div>
  <div class="help-control"><span>Construir</span><span>Elige un objeto en la barra, toca una casilla libre y pulsa Acción</span></div>
  <div class="help-control"><span>Experiencia</span><span>Minar, fundir y combatir da XP. Abre HABILIDADES desde el indicador NV del HUD o el menú Personaje</span></div>
  <div class="help-control"><span>Combate</span><span>Equipa ESPADA y pulsa ACCIÓN para atacar en tu dirección o toca un enemigo para seleccionarlo</span></div>
  <div class="help-control"><span>Telarañas</span><span>Te ralentizan a la mitad; pícalas o córtalas con ESPADA para conseguir hilo</span></div>
  <div class="help-control"><span>Madera</span><span>Toca un tronco para seleccionarlo y pulsa MANO para recoger madera</span></div>
  <div class="help-control"><span>Mochila</span><span>Toca objetos para moverlos, mantén para dividir; basurero: soltar o eliminar con confirmación</span></div>
  <div class="help-control"><span>Runas</span><span>PERSONAJE → ENGASTES: selecciona Espada, Pico o armadura, inserta la runa compatible y extrae para recuperarla</span></div>
  <div class="help-control"><span>Fabricar</span><span>Recetas básicas en la mesa. Para picos y espadas abre RECETAS → FORJA</span></div>
  <div class="help-control"><span>Personaje</span><span>MOCHILA → PERSONAJE para equipar armaduras y lámpara; recarga manualmente con cartuchos</span></div>
  <div class="help-control"><span>Mazmorra</span><span>Minas Abandonadas: encuentra pistas para localizar la entrada de la Galería Silenciosa; cambia según el mundo. Los jefes se enfrentan por turnos</span></div>
  <div class="help-control"><span>Diario</span><span>Pausa → DIARIO para leer fragmentos y revisar escenas descubiertas</span></div>
  <div class="help-control"><span>Base</span><span>Coloca un Estandarte para designar / trasladar tu fortaleza</span></div>
  <div class="help-control"><span>Cofre y cama</span><span>Interacción cercana para almacenar o descansar</span></div>
  <p class="panel-text">Las primeras criaturas ya están activas: la espada combate, las arañas dejan hilos, los murciélagos membranas y los esqueletos huesos. Mantén ATACAR para cargar un golpe y usa ESQUIVAR para evitar ataques. El combate avanzado, comerciantes e invasiones vendrán después. Guarda tu partida regularmente y exporta un respaldo antes de actualizar.</p>
  <div class="panel-actions"><button class="primary" data-a="resume">ENTENDIDO</button></div>`;
 }
 if(previousModalType!==type){const card=UI.modal.querySelector('.panel-card');if(card)card.scrollTop=0;}
 if(type==='bag'||type==='craft'||type==='chest')hookInventory(body,type);
 if(type==='runes')body.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>showModal(b.dataset.view)));
 if(type==='forge'){body.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>showModal(b.dataset.view)));body.querySelectorAll('[data-upgrade]').forEach(b=>b.addEventListener('click',()=>upgradeEquipment(b.dataset.upgrade,'forge')));}
 if(type==='journal')hookJournalControls();
 if(type==='skills')body.querySelectorAll('[data-skill]').forEach(b=>b.addEventListener('click',()=>allocateSkill(b.dataset.skill)));
 if(type==='equip'){
  body.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>showModal(b.dataset.view)));
  body.querySelectorAll('[data-equip]').forEach(b=>b.addEventListener('click',()=>equipFromBag(+b.dataset.equip)));
  body.querySelectorAll('[data-unequip]').forEach(b=>b.addEventListener('click',()=>unequip(b.dataset.unequip)));
  body.querySelectorAll('[data-lamp]').forEach(b=>b.addEventListener('click',()=>b.dataset.lamp==='refuel'?refillLamp():toggleLamp(true)));
 }
 if(type==='runes'||type==='equip'){
  body.querySelectorAll('[data-rune-target]').forEach(b=>b.addEventListener('click',()=>{runeTarget=b.dataset.runeTarget;showModal('runes');}));
  body.querySelectorAll('[data-rune-apply]').forEach(b=>b.addEventListener('click',()=>applyRune(runeTarget,b.dataset.runeApply)));
  body.querySelectorAll('[data-rune-remove]').forEach(b=>b.addEventListener('click',()=>extractRune(runeTarget)));
 }
 if(type==='equip')renderEquipmentPreview();
 if(type==='furnace'){
  body.querySelectorAll('[data-furnace-load]').forEach(b=>b.addEventListener('click',()=>transferToFurnace(Number(b.dataset.furnaceLoad))));
  body.querySelectorAll('[data-furnace-slot]').forEach(b=>b.addEventListener('click',()=>takeFurnaceSlot(b.dataset.furnaceSlot)));
  body.querySelectorAll('[data-upgrade]').forEach(b=>b.addEventListener('click',()=>upgradeEquipment(b.dataset.upgrade,'furnace')));

 }
 body.querySelectorAll('[data-a]').forEach(btn=>btn.addEventListener('click',()=>{const a=btn.dataset.a;
  if(a==='resume')closeModal();else if(a==='save')queueSave(false);else if(a==='help')showModal('help');else if(a==='journal')showModal('journal');else if(a==='updates')showModal('updates');else if(a==='skills')showModal('skills');else if(a==='equip')showModal('equip');else if(a==='pause')showModal('pause');else if(a==='craft')showModal('craft');else if(a==='export')exportGame();else if(a==='import')$('import-file').click();else if(a==='new'){
   if(confirm('¿Volver al menú y crear un mundo nuevo? Antes puedes exportar el guardado. La partida 1.6 y Alpha 1 NO se modificarán.')){closeModal();playing=false;paused=true;UI.hud.classList.add('hidden');UI.menu.classList.remove('hidden');$('btn-resume').classList.remove('hidden');}}
 }));
}
function closeModal(){invSource=null;UI.modal.classList.add('hidden');paused=false;modalType='';try{canvas.focus({preventScroll:true})}catch{}}
function exportGame(){const data=JSON.stringify(snapshot());const blob=new Blob([data],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='La-Ultima-Fragua-Alpha3942-respaldo.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Respaldo descargado. Guárdalo en un lugar seguro.');}
// Alpha 3.9.3.1: minimapa local, circular y limitado a la exploración descubierta.
// Canvas independiente del mapa grande; no modifica el guardado ni el terreno.
let minimapLast=0;
function drawMiniMap(){
 const c=UI.miniMap;if(!c||!playing||paused||UI.hud.classList.contains('hidden'))return;
 const g=c.getContext('2d'),S=c.width,center=S/2,scale=5.1,range=Math.ceil(center/scale);
 g.imageSmoothingEnabled=false;g.clearRect(0,0,S,S);g.fillStyle='#0c1220';g.fillRect(0,0,S,S);
 const pal=['#63746d','#394755','#73503c','#b47b4d','#292d35','#aeb7b7','#64a9b9','#6881bf','#ad6857','#8c79b2','#d0b45d'];
 const ax=Math.floor(player.x),ay=Math.floor(player.y);
 for(let y=ay-range;y<=ay+range;y++)for(let x=ax-range;x<=ax+range;x++){
   if(!inWorld(x,y)||!fogAt(x,y))continue;
   const px=Math.round(center+(x+.5-player.x)*scale),py=Math.round(center+(y+.5-player.y)*scale);
   if(Math.hypot(px-center,py-center)>center-4)continue;
   const t=tileAt(x,y);g.fillStyle=pal[t]||'#55636b';g.fillRect(px-2,py-2,Math.ceil(scale),Math.ceil(scale));
 }
 // Marca de escalera conocida y enemigos descubiertos, sin revelar terreno oculto.
 for(const p of propsFor(layer)){
  if(p.to===undefined||!fogAt(p.x,p.y))continue;
  const x=center+(p.x-player.x)*scale,y=center+(p.y-player.y)*scale;
  if(Math.hypot(x-center,y-center)<center-7){g.fillStyle='#e6bf79';g.fillRect(Math.round(x)-2,Math.round(y)-2,4,4);}
 }
 for(const e of enemies.values()){
  if(e.layer!==layer||e.hp<=0||!vis.has(Math.floor(e.x)+','+Math.floor(e.y)))continue;
  const x=center+(e.x-player.x)*scale,y=center+(e.y-player.y)*scale;
  if(Math.hypot(x-center,y-center)<center-7){g.fillStyle='#e37879';g.fillRect(Math.round(x)-2,Math.round(y)-2,4,4);}
 }
 // Flecha que gira según la dirección de movimiento del personaje.
 const a=player.dirX||player.dirY?Math.atan2(player.dirY,player.dirX):Math.PI/2;
 g.save();g.translate(center,center);g.rotate(a);g.fillStyle='#f8ebbf';g.beginPath();g.moveTo(7,0);g.lineTo(-5,-4);g.lineTo(-2,0);g.lineTo(-5,4);g.closePath();g.fill();g.restore();
}
function drawMap(){const c=$('exploration-map');if(!c)return;const g=c.getContext('2d');g.imageSmoothingEnabled=false;g.fillStyle='#090e16';g.fillRect(0,0,c.width,c.height);
 const z=mapView.zoom,x0=Math.floor(mapView.x-c.width/(2*z)),x1=Math.ceil(mapView.x+c.width/(2*z)),y0=Math.floor(mapView.y-c.height/(2*z)),y1=Math.ceil(mapView.y+c.height/(2*z));
 const pal=['#71837d','#4f5765','#70503a','#a46c45','#252a34','#a5aeb2','#6daeb5','#7c91cb','#c26f56','#9a8ec1','#d7b85b'];
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
  if(!inWorld(x,y)||!fogAt(x,y))continue;const t=tileAt(x,y);g.fillStyle=pal[t]||'#4f5760';g.fillRect(Math.floor((x-mapView.x)*z+c.width/2),Math.floor((y-mapView.y)*z+c.height/2),Math.ceil(z)+1,Math.ceil(z)+1);}
 for(const p of currentProps()){if(!fogAt(Math.floor(p.x),Math.floor(p.y)))continue;const x=(p.x-mapView.x)*z+c.width/2,y=(p.y-mapView.y)*z+c.height/2;g.fillStyle=(p.to===undefined)?'#d59c70':'#f2cf89';g.fillRect(x-3,y-3,7,7);}
 for(const b of deathBags)if(b.layer===layer&&fogAt(b.x,b.y)){g.fillStyle='#f48c63';g.fillRect((b.x-mapView.x)*z+c.width/2-3,(b.y-mapView.y)*z+c.height/2-3,6,6);}
 const px=(player.x-mapView.x)*z+c.width/2,py=(player.y-mapView.y)*z+c.height/2;g.fillStyle='#ffffff';g.beginPath();g.arc(px,py,4,0,Math.PI*2);g.fill();$('map-coord').textContent='x '+Math.floor(mapView.x)+', y '+Math.floor(mapView.y)+' · Nivel '+layer;
}
function setupMapControls(){document.querySelectorAll('[data-m]').forEach(btn=>btn.addEventListener('click',()=>{const a=btn.dataset.m;if(a==='plus')mapView.zoom=clamp(mapView.zoom*1.4,1.6,12);if(a==='minus')mapView.zoom=clamp(mapView.zoom/1.4,1.6,12);if(a==='center')mapView.x=player.x,mapView.y=player.y;drawMap();}));
 const c=$('exploration-map');let drag=null;c.addEventListener('pointerdown',e=>{e.preventDefault();c.setPointerCapture(e.pointerId);drag={id:e.pointerId,x:e.clientX,y:e.clientY};});c.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const rect=c.getBoundingClientRect(),sx=c.width/rect.width,sy=c.height/rect.height;mapView.x-=(e.clientX-drag.x)*sx/mapView.zoom;mapView.y-=(e.clientY-drag.y)*sy/mapView.zoom;drag.x=e.clientX;drag.y=e.clientY;drawMap();});['pointerup','pointercancel'].forEach(t=>c.addEventListener(t,()=>drag=null));}


// Low-resolution pixel-constructed miners. Drawn at 24 × 32 logical pixels, then scaled NEAREST-NEIGHBOR.
const sprites={};
function makeSprite(gender,face,frame){const c=document.createElement('canvas');c.width=24;c.height=32;let p=c.getContext('2d');p.imageSmoothingEnabled=false;
 const dot=(x,y,w,h,color)=>{p.fillStyle=color;p.fillRect(x,y,w,h);};const hair=gender==='female'?'#bd7245':'#935832';
 const leather='#a66b43',darkLeather='#5b3d37',shirt='#a55b3b',gold='#d6b16c',skin='#e7b17c',shadowSkin='#b97851',helmet='#c5a36d',topHelm='#8e684b';
 const stride=frame===0?1:-1;
 // Boots and trouser legs for readable full-body silhouette.
 dot(6,24,5,5,'#3a3b48');dot(13,24,5,5,'#3a3b48');dot(5+(stride>0?1:0),27,6,3,'#302c31');dot(13+(stride<0?1:0),27,6,3,'#302c31');
 dot(5,16,14,10,leather);dot(8,18,8,8,shirt);dot(6,22,12,3,'#644136');dot(10,22,4,2,gold);
 if(face==='up'){
   dot(5,10,14,10,'#b27c51');dot(4,11,3,8,hair);dot(17,11,3,8,hair);dot(6,17,12,8,'#695241');dot(8,20,8,5,'#b08c5d');dot(9,22,6,2,'#b9aa85');
   dot(6,5,12,9,helmet);dot(7,3,10,4,topHelm);dot(4,9,16,3,'#74563d');dot(8,4,8,3,'#d4b882');dot(11,1,2,3,'#e2ca8d');
 }else if(face==='left'||face==='right'){
   const mirror=face==='left';
   // Facing-profile silhouette: prominent nose and beard/braids.
   dot(5,8,14,12,skin);dot(5,11,14,2,shadowSkin);
   if(!mirror){dot(18,13,3,3,skin);dot(15,12,2,2,'#30252a');}else{dot(3,13,3,3,skin);dot(7,12,2,2,'#30252a');}
   if(gender==='male'){dot(mirror?4:11,16,9,9,hair);dot(mirror?5:13,22,5,3,'#704331');dot(mirror?7:13,25,3,2,hair);}
   else{dot(mirror?14:5,12,4,12,hair);dot(mirror?15:6,20,3,5,'#d69b5f');dot(mirror?6:13,16,3,4,'#986141');}
   dot(5,5,14,7,helmet);dot(7,3,10,5,topHelm);dot(3,10,18,3,'#76533b');dot(9,4,7,3,'#f3cf93');dot(mirror?5:17,7,3,3,'#ffdb76');
 }else{
   dot(6,8,12,13,skin);dot(7,14,10,4,shadowSkin);dot(9,13,2,2,'#392c30');dot(15,13,2,2,'#392c30');dot(12,16,3,2,'#d18a59');
   if(gender==='male'){dot(5,17,14,8,hair);dot(8,23,8,3,'#74412f');dot(7,18,3,4,'#bd7b42');dot(14,18,3,4,'#bd7b42');dot(10,19,4,2,'#edbc75');}
   else{dot(4,12,4,14,hair);dot(17,12,4,14,hair);dot(5,22,3,4,'#e0b077');dot(18,22,3,4,'#e0b077');dot(8,17,8,4,'#b46d51');}
   dot(5,4,14,7,helmet);dot(8,2,8,4,topHelm);dot(3,9,18,3,'#6c503d');dot(9,4,6,3,'#eed398');dot(11,5,3,3,'#ffe395');
 }
 // Strapped mining pack visible only from back, hands at the sides in front-facing poses.
 dot(3,18,3,7,darkLeather);dot(18,18,3,7,darkLeather);dot(4,20,3,5,skin);dot(18,20,3,5,skin);
 // Tiny pick silhouette in leading hand, not an emoji: pick head and oak handle.
 if(face==='down'||face==='right'){
   dot(21,12,2,14,'#8c6848');dot(19,10,5,2,'#9eb4ae');dot(16,11,7,2,'#b3c8bb');dot(18,13,2,3,'#7b9797');
 }else if(face==='left'){
   dot(1,12,2,14,'#8c6848');dot(0,10,5,2,'#9eb4ae');dot(1,12,5,2,'#b3c8bb');
 }
 return c;}
for(const g of ['male','female'])for(const f of ['up','down','left','right'])for(let i=0;i<2;i++)sprites[g+'_'+f+'_'+i]=makeSprite(g,f,i);


function pixRect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.max(1,Math.round(w)),Math.max(1,Math.round(h)));}
function drawProp(p,t){let a=worldToScreen(p.x,p.y),s=t*.84,x=Math.round(a.x),y=Math.round(a.y);const dark='#2b272d';
 if(p.kind==='mine_remains'){
  const img=REMAINS_IMAGES.get(p.sprite);
  ctx.fillStyle='rgba(2,4,9,.38)';ctx.beginPath();ctx.ellipse(x,y+s*.32,s*.41,s*.15,0,0,2*Math.PI);ctx.fill();
  if(img?.complete&&img.naturalWidth){ctx.save();ctx.imageSmoothingEnabled=false;ctx.globalAlpha=p.searched?.74:1;
    ctx.drawImage(img,Math.round(x-s*.67),Math.round(y-s*.61),Math.round(s*1.34),Math.round(s*1.34));ctx.restore();}
  if(!p.decorative&&!p.searched){ctx.fillStyle=p.mode==='lore'?'#e7c18a':'#91cfac';ctx.fillRect(x+s*.27,y-s*.56,Math.max(2,s*.10),Math.max(2,s*.10));}
  return;
 }
 if(p.decorative){
  if(p.kind==='rail'){pixRect(x-s*.43,y-s*.34,s*.88,s*.08,'#9c8882');pixRect(x-s*.43,y+s*.25,s*.88,s*.08,'#9c8882');pixRect(x-s*.34,y-s*.32,s*.12,s*.64,'#78574e');pixRect(x+s*.24,y-s*.32,s*.12,s*.64,'#78574e');}
  else if(p.kind==='wagon'){pixRect(x-s*.42,y-s*.2,s*.87,s*.38,'#5f4140');pixRect(x-s*.35,y-s*.27,s*.72,s*.10,'#bc8e66');pixRect(x-s*.25,y+s*.18,s*.16,s*.12,'#252330');pixRect(x+s*.16,y+s*.18,s*.16,s*.12,'#252330');}
  else if(p.kind==='crate'){pixRect(x-s*.38,y-s*.36,s*.75,s*.71,'#79563d');pixRect(x-s*.38,y-s*.36,s*.75,s*.11,'#cea175');pixRect(x-s*.08,y-s*.32,s*.10,s*.64,'#c19b70');}
  else if(p.kind==='rubble'){for(let i=0;i<4;i++){const dx=(i-1)*s*.17;pixRect(x+dx,y-s*.07-i*s*.09,s*.28,s*.21,['#8c7a76','#635961','#a48b7b','#4f4a56'][i]);}}
  else if(p.kind==='shelf'){pixRect(x-s*.42,y-s*.5,s*.85,s*.83,'#5e3b31');for(let i=0;i<3;i++){pixRect(x-s*.4,y-s*.3+i*s*.25,s*.8,s*.08,'#bd8252');pixRect(x-s*.25,y-s*.41+i*s*.25,s*.14,s*.12,'#9c8684');pixRect(x+s*.09,y-s*.41+i*s*.25,s*.11,s*.14,'#d8a668');}}
  else if(p.kind==='desk'){pixRect(x-s*.46,y-s*.24,s*.94,s*.53,'#4a2d28');pixRect(x-s*.46,y-s*.39,s*.94,s*.21,'#ba8157');pixRect(x-s*.25,y-s*.31,s*.35,s*.10,'#e4cc9e');}
  else if(p.kind==='cocoon'){pixRect(x-s*.03,y-s*.51,s*.07,s*.21,'#ac9eaf');pixRect(x-s*.29,y-s*.26,s*.60,s*.55,'#65566d');pixRect(x-s*.20,y-s*.3,s*.43,s*.53,'#b2a4c2');for(let i=0;i<3;i++)pixRect(x-s*.23,y-s*.22+i*s*.16,s*.45,s*.05,'#ddd0dd');}
  else if(p.kind==='egg'){pixRect(x-s*.3,y-s*.1,s*.26,s*.38,'#968298');pixRect(x-s*.03,y-s*.25,s*.3,s*.49,'#b5a0ac');pixRect(x+s*.1,y-s*.07,s*.11,s*.07,'#e1c3d4');}
  else if(p.kind==='runestone'){pixRect(x-s*.35,y-s*.34,s*.68,s*.62,'#5f556e');pixRect(x-s*.27,y-s*.42,s*.54,s*.22,'#8e7995');pixRect(x-s*.06,y-s*.2,s*.11,s*.35,'#91b3d7');}
  else if(p.kind==='bones'){pixRect(x-s*.32,y+s*.05,s*.65,s*.10,'#d2c4ad');pixRect(x-s*.18,y-s*.2,s*.38,s*.19,'#e0c8b1');pixRect(x-s*.12,y-s*.15,s*.08,s*.08,'#413343');}
  else if(p.kind==='coal'){pixRect(x-s*.31,y-s*.12,s*.63,s*.36,'#201e2b');pixRect(x-s*.21,y-s*.21,s*.41,s*.19,'#4c3c49');pixRect(x-s*.02,y-s*.16,s*.10,s*.09,'#9d4b53');}
  else if(p.kind==='webdecor'){ctx.strokeStyle='rgba(202,196,226,.7)';ctx.lineWidth=Math.max(1,s*.048);for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(x-s*.4,y-s*.4+i*s*.18);ctx.lineTo(x+s*.4,y+s*.36-i*s*.15);ctx.stroke();}}
  else if(p.kind==='lamp'){pixRect(x-s*.12,y-s*.46,s*.24,s*.75,'#9a764e');pixRect(x-s*.16,y-s*.56,s*.33,s*.20,'#e1ad70');pixRect(x-s*.08,y-s*.52,s*.16,s*.13,'#fff0a5');}
  return;
 }
 if(p.kind==='supplycache'){
  const empty=story39.openedChests.includes(p.id);
  pixRect(x-s*.43,y-s*.18,s*.88,s*.53,'#46362e');pixRect(x-s*.4,y-s*.36,s*.80,s*.27,empty?'#5d626a':'#b58b57');
  pixRect(x-s*.34,y-s*.28,s*.67,s*.08,empty?'#757d81':'#e3c182');
  if(!empty){pixRect(x-s*.09,y-s*.19,s*.18,s*.23,'#77c9e6');pixRect(x-s*.035,y-s*.15,s*.075,s*.12,'#d5faff');}return;
 }
 if(p.kind==='ruin'){
  pixRect(x-s*.46,y+s*.07,s*.93,s*.28,'#363440');pixRect(x-s*.39,y-s*.36,s*.25,s*.54,'#777280');
  pixRect(x+s*.17,y-s*.48,s*.24,s*.69,'#676675');pixRect(x-s*.37,y-s*.52,s*.81,s*.13,'#aaa093');
  pixRect(x-s*.06,y-s*.17,s*.15,s*.24,'#ab824e');return;
 }
 if(p.kind==='dungeoncheckpoint'){const lit=Math.sin(blink*3)*.08;pixRect(x-s*.3,y-s*.38,s*.6,s*.8,'#62505b');pixRect(x-s*.23,y-s*.54,s*.47,s*.22,'#cf9560');pixRect(x-s*.11,y-s*.35,s*.22,s*.36,'#ffce73');pixRect(x-s*.08,y-s*.31,s*.16,s*.23,'#fff2b2');if(story39.checkpoint){ctx.strokeStyle='rgba(241,197,126,.9)';ctx.lineWidth=2;ctx.strokeRect(x-s*.37,y-s*.56,s*.75,s*1.04);}return;}
 if(p.kind==='dungeongate'){const open=dungeonSealsReady();pixRect(x-s*.48,y-s*.65,s*.96,s*1.2,'#3c313e');pixRect(x-s*.40,y-s*.56,s*.80,s*.93,open?'#242c36':'#6a505e');if(!open){for(let i=-2;i<=2;i++)pixRect(x+i*s*.13,y-s*.53,s*.07,s*.84,'#b08b9b');pixRect(x-s*.15,y-s*.18,s*.30,s*.17,'#df8f83');}else pixRect(x+s*.28,y-s*.4,s*.12,s*.70,'#9a8b8d');return;}
 if(p.kind==='dungeonentrance'){pixRect(x-s*.43,y-s*.48,s*.87,s*.65,'#554849');pixRect(x-s*.37,y-s*.42,s*.75,s*.18,'#b58c62');pixRect(x-s*.22,y-s*.22,s*.42,s*.19,'#d7bd8f');return;}
 if(p.kind==='dungeonrecord'){pixRect(x-s*.43,y-s*.35,s*.86,s*.59,'#382d31');pixRect(x-s*.35,y-s*.41,s*.72,s*.63,'#c6a571');pixRect(x-s*.28,y-s*.26,s*.49,s*.06,'#795941');pixRect(x-s*.27,y-s*.08,s*.41,s*.06,'#795941');return;}
 if(p.kind==='dungeonchest'){const opened=story39.openedChests.includes(p.id);pixRect(x-s*.40,y-s*.13,s*.80,s*.53,'#3d2931');pixRect(x-s*.4,y-s*.32,s*.80,s*.34,opened?'#5b5c67':'#a66d4a');pixRect(x-s*.35,y-s*.27,s*.70,s*.09,opened?'#7b7880':'#e5ba76');pixRect(x-s*.06,y-s*.17,s*.12,s*.29,'#e1c17b');return;}
 if(p.kind==='dungeonseal'){const active=p.seal?story39.seals.includes(p.seal):story39.gateOpen;pixRect(x-s*.30,y-s*.42,s*.6,s*.85,active?'#44615e':'#59455c');pixRect(x-s*.23,y-s*.34,s*.45,s*.70,active?'#74bca9':'#b89fbc');pixRect(x-s*.15,y-s*.27,s*.27,s*.54,active?'#225e5b':'#472b4b');pixRect(x-s*.06,y-s*.04,s*.12,s*.11,active?'#d3fff1':'#e4aac7');return;}
 if(p.kind==='dungeonboss'){
  const pulse=Math.sin(blink*4)*s*.045;pixRect(x-s*.59,y-s*.42+pulse,s*1.17,s*.85,'#1b1525');
  for(const v of [-1,1])for(let j=0;j<4;j++){pixRect(x+v*s*.26-(v<0?s*.48:0),y-s*.35+j*s*.19+pulse,s*.48,s*.08,j%2?'#5e334d':'#39293e');}
  pixRect(x-s*.42,y-s*.49+pulse,s*.84,s*.43,'#5f324a');pixRect(x-s*.31,y-s*.43+pulse,s*.27,s*.10,'#9c3f58');
  pixRect(x-s*.32,y-s*.13+pulse,s*.64,s*.34,'#2d2237');
  for(let i=-2;i<=2;i++){pixRect(x+i*s*.13,y-s*.08+pulse,s*.10,s*.10,'#ff5578');pixRect(x+i*s*.13,y-s*.08+pulse,s*.04,s*.04,'#ffe8c3');}
  return;
 }

 if(p.kind==='stairsup'||p.kind==='stairsdown'){
  pixRect(x-s*.48,y-s*.27,s*.96,s*.64,'#171923');pixRect(x-s*.45,y-s*.36,s*.9,s*.5,p.kind==='stairsdown'?'#ad8c6a':'#7b97a3');
  for(let i=0;i<4;i++)pixRect(x-s*.41,y-s*.30+i*s*.13,s*.82,s*.055,i%2?'#4a4547':'#c6b08c');
  pixRect(x-s*.09,y-s*.06,s*.18,s*.19,p.kind==='stairsdown'?'#eab76c':'#a6dbe0');return;
 }
 if(p.kind==='elevator'){
  pixRect(x-s*.53,y-s*.51,s*1.07,s*1.06,'#423d3c');pixRect(x-s*.41,y-s*.40,s*.82,s*.85,'#967650');
  pixRect(x-s*.32,y-s*.29,s*.65,s*.08,'#303641');pixRect(x-s*.32,y+s*.11,s*.65,s*.08,'#303641');
  pixRect(x-s*.11,y-s*.13,s*.24,s*.25,'#88bdc4');pixRect(x-s*.04,y-s*.08,s*.09,s*.1,'#d2eee4');return;
 }
 if(p.kind==='fire'){
  const flick=Math.sin(blink*8)*2;pixRect(x-s*.44,y+s*.12,s*.9,s*.21,'#3e302a');pixRect(x-s*.29,y-s*.02,s*.6,s*.19,'#8b593c');pixRect(x-s*.2,y-s*.5+flick,s*.39,s*.58,'#d7693c');pixRect(x-s*.1,y-s*.35+flick,s*.22,s*.35,'#ffd078');pixRect(x-s*.02,y-s*.27+flick,s*.08,s*.16,'#fff1aa');return;
 }
 if(p.kind==='workbench'){
  // A proper workbench: raised wooden slab, four legs, hammer and a small anvil.
  pixRect(x-s*.42,y+s*.21,s*.84,s*.19,'#3d2c28');
  pixRect(x-s*.45,y-s*.19,s*.13,s*.58,'#694632');pixRect(x+s*.30,y-s*.19,s*.13,s*.58,'#694632');
  pixRect(x-s*.48,y-s*.41,s*.97,s*.36,'#583d30');pixRect(x-s*.43,y-s*.45,s*.87,s*.25,'#c1945d');
  pixRect(x-s*.43,y-s*.21,s*.87,s*.10,'#8c5e3e');
  pixRect(x-s*.27,y-s*.38,s*.25,s*.10,'#9da7a6');pixRect(x-s*.19,y-s*.40,s*.11,s*.06,'#d2d8cb');
  pixRect(x+s*.12,y-s*.39,s*.055,s*.27,'#734936');pixRect(x+s*.06,y-s*.47,s*.18,s*.10,'#a7b0ae');
  pixRect(x-s*.34,y-s*.10,s*.70,s*.05,'#d5ad70');return;
 }
 if(p.kind==='furnace'){
  const glowing=furnaceWorking(p),blaze=glowing?Math.sin(blink*7)*s*.025:0;
  pixRect(x-s*.48,y+s*.10,s*.97,s*.30,'rgba(6,8,12,.46)');
  pixRect(x-s*.45,y-s*.43,s*.90,s*.82,'#35373d');
  pixRect(x-s*.38,y-s*.49,s*.78,s*.22,'#939394');
  pixRect(x-s*.43,y-s*.27,s*.15,s*.62,'#65696d');
  pixRect(x+s*.29,y-s*.27,s*.15,s*.62,'#52565d');
  pixRect(x-s*.25,y-s*.18,s*.51,s*.48,'#181c23');
  pixRect(x-s*.19,y-s*.10,s*.39,s*.36,'#9d3e23');
  pixRect(x-s*.15,y-s*.06+blaze,s*.31,s*.26,'#e7742f');
  pixRect(x-s*.07,y-s*.015+blaze,s*.16,s*.17,'#ffd47a');
  pixRect(x-s*.08,y-s*.60,s*.18,s*.20,'#7e8689');
  pixRect(x-s*.09,y-s*.67,s*.20,s*.09,'#c2c4be');
  pixRect(x-s*.37,y+s*.20,s*.74,s*.11,'#b2a391');
  return;
 }
 if(p.kind==='tree'){
  pixRect(x-s*.13,y-s*.04,s*.25,s*.42,'#65452f');pixRect(x-s*.35,y-s*.48,s*.68,s*.48,'#638069');
  pixRect(x-s*.23,y-s*.65,s*.47,s*.27,'#85a077');pixRect(x-s*.14,y-s*.57,s*.15,s*.14,'#afc28c');return;
 }
 if(isWallStructure(p)){
  const xx=Math.floor(p.x),yy=Math.floor(p.y),stone=p.kind==='stonewall';
  const n=isRoomWall(xx,yy-1),e=isRoomWall(xx+1,yy),south=isRoomWall(xx,yy+1),w=isRoomWall(xx-1,yy);
  const isStone=stone?'#979f9c':'#b68b59',light=stone?'#d9d7c9':'#f0cb93';
  const front=stone?'#62696a':'#775039',shadow=stone?'#343d42':'#523727',mortar=stone?'#3c484e':'#68452c';
  // Autounión: todas las orientaciones comparten el mismo ancho, altura y
  // punto de anclaje. Antes los tramos N/S tenían otra geometría y se veían
  // más bajos al conectarse a esquinas, puertas y tramos E/O.
  if((n||south)&&!w&&!e){
   const left=x-s*.595, width=s*1.19, top=y-s*.83,faceTop=y-s*.38,faceBottom=y+s*.43;
   pixRect(left-s*.035,top+s*.025,width+s*.07,faceBottom-top+s*.03,'rgba(7,10,16,.28)');
   pixRect(left,top,width,faceBottom-top,front);
   // Columnas de esquina: bordes verticales continuos, sin separadores por celda.
   pixRect(left,top,s*.10,faceBottom-top,light);
   pixRect(left+s*.10,faceTop,s*.04,faceBottom-faceTop,stone?'#7a8582':'#996d47');
   pixRect(left+width-s*.13,top,s*.13,faceBottom-top,shadow);
   pixRect(left+width-s*.16,faceTop,s*.026,faceBottom-faceTop,mortar);
   if(stone){
    for(let i=0;i<3;i++){
     const xx=left+s*(.23+i*.20);
     pixRect(xx,faceTop,s*.023,faceBottom-faceTop,'rgba(24,37,43,.23)');
    }
    if((yy%3+3)%3===1){
     pixRect(left+s*.17,faceTop+s*.26,width-s*.31,s*.034,mortar);
     pixRect(left+s*.42,faceTop+s*.28,s*.13,s*.065,'rgba(233,238,226,.12)');
    }
   }else{
    for(let i=0;i<5;i++){
     const xx=left+s*(.19+i*.15);
     pixRect(xx,faceTop,s*.022,faceBottom-faceTop,'rgba(50,31,22,.28)');
    }
    if((yy%4+4)%4===2)pixRect(left+s*.13,faceTop+s*.52,width-s*.24,s*.05,'#a67a51');
   }
   if(!n){
    pixRect(left-s*.035,top-s*.07,width+s*.07,s*.12,light);
    pixRect(left,top+s*.06,width,s*.075,isStone);
   }
   if(!south){
    pixRect(left,faceBottom-s*.11,width,s*.095,shadow);
    pixRect(left-s*.035,faceBottom-s*.02,width+s*.07,s*.045,light);
   }
   return;
  }
  const left=x-s*.595,right=x+s*.595,top=y-s*.83,topBottom=y-s*.38,faceBottom=y+s*.43;
  // continuous top deck with highlighted perimeter only on exposed edges
  pixRect(left,top,s*1.19,s*.46,stone?'#8e9694':'#a57850');
  pixRect(left,top,s*1.19,s*.16,isStone);
  pixRect(left,top+s*.13,s*1.19,s*.035,light);
  if(!n)pixRect(left,top,s*1.19,s*.045,light);
  // Side faces are shaded, but internal seams aren't outlined.
  pixRect(left,topBottom,s*1.19,s*.77,front);
  if(!south){
   pixRect(left,faceBottom-s*.11,s*1.19,s*.10,shadow);
   pixRect(left,topBottom,s*1.19,s*.065,stone?'#707b78':'#916740');
  }else{
   pixRect(left,faceBottom-s*.13,s*1.19,s*.07,stone?'#737a77':'#84583c');
  }
  // continuous courses; seams stagger against the world coordinate so adjacent wall tiles connect.
  if(stone){
   for(let j=1;j<=3;j++){
    const line=topBottom+j*s*.155;
    pixRect(left,line,s*1.19,s*.024,mortar);
    const shift=(yy+j)%2?s*.25:0;
    for(let k=-1;k<5;k++){
     const brickx=left+shift+k*s*.30;
     if(brickx>=left&&brickx<right)pixRect(brickx,line-s*.125,s*.025,s*.125,mortar);
    }
   }
   for(let k=0;k<3;k++){
    const brickx=left+s*.13+k*s*.38;
    pixRect(brickx,top+s*.23,s*.19,s*.07,k===1?'#aeb5af':'#79837f');
   }
  }else{
   for(let k=0;k<7;k++){
    const px=left+k*s*.18;
    pixRect(px,topBottom+s*.075,s*.026,s*.55,shadow);
    pixRect(px+s*.06,top+s*.21,s*.025,s*.20,'#68452e');
   }
   pixRect(left,topBottom+s*.38,s*1.19,s*.06,'#bc9267');
  }
  // Outer edges only; no vertical separator between connected blocks.
  if(!w){pixRect(left,top,s*.095,s*1.26,light);pixRect(left+s*.085,topBottom,s*.035,s*.77,shadow);}
  if(!e){pixRect(right-s*.10,top,s*.10,s*1.26,shadow);}
  if(!south){pixRect(left,faceBottom-s*.08,s*1.19,s*.045,'rgba(0,0,0,.34)');}
  // Esquinas y cruces: añade un pilar central para unir el tramo vertical con el horizontal.
  if((w||e)&&(n||south)){
   const spineW=s*.40,spineL=x-spineW*.5,spineT=top+s*.14,spineB=faceBottom-s*.03;
   pixRect(spineL,spineT,spineW,spineB-spineT,front);
   pixRect(spineL,spineT,s*.07,spineB-spineT,light);
   pixRect(spineL+spineW-s*.08,spineT,s*.08,spineB-spineT,shadow);
   if(stone){
    pixRect(spineL+s*.08,spineT+s*.19,spineW-s*.16,s*.03,mortar);
    pixRect(spineL+s*.08,spineT+s*.41,spineW-s*.16,s*.03,mortar);
    pixRect(spineL+s*.12,spineT+s*.60,s*.04,s*.16,mortar);
    pixRect(spineL+s*.25,spineT+s*.60,s*.04,s*.16,mortar);
   }else{
    for(let i=0;i<3;i++)pixRect(spineL+s*(.11+i*.11),spineT,s*.026,spineB-spineT,shadow);
   }
   pixRect(x-s*.29,top+s*.02,s*.58,s*.08,light);
   if(w)pixRect(left+s*.04,topBottom+s*.06,s*.28,s*.09,stone?'#818987':'#946842');
   if(e)pixRect(right-s*.32,topBottom+s*.06,s*.28,s*.09,stone?'#818987':'#946842');
  }
  return;
 }
 if(p.kind==='bed'){
  pixRect(x-s*.50,y+s*.20,s*1.0,s*.18,'#362b2b');
  pixRect(x-s*.48,y-s*.58,s*.96,s*.96,'#755038');
  pixRect(x-s*.43,y-s*.49,s*.86,s*.78,'#b4564d');
  pixRect(x-s*.40,y-s*.46,s*.80,s*.28,'#e3d8bb');
  pixRect(x-s*.32,y-s*.40,s*.62,s*.13,'#f5ecdb');
  pixRect(x-s*.40,y-s*.13,s*.80,s*.33,'#953f42');
  pixRect(x-s*.43,y+s*.18,s*.86,s*.09,'#ddab71');
  for(const ox of [-.5,.40]){pixRect(x+s*ox,y-s*.61,s*.11,s*.98,'#5d3a2c');pixRect(x+s*ox,y-s*.61,s*.11,s*.14,'#cda06b');}return;
 }
 if(p.kind==='door'){
  const axis=doorAxis(Math.floor(p.x),Math.floor(p.y));
  const open=!!p.open;
  const l=structureAt(p.x-1,p.y),r=structureAt(p.x+1,p.y),up=structureAt(p.x,p.y-1),dn=structureAt(p.x,p.y+1);
  const useStone=[l,r,up,dn].some(q=>q?.kind==='stonewall');
  const trim=useStone?'#bab9af':'#bb9161',side=useStone?'#74777a':'#72503b',bright=useStone?'#dddbcc':'#d7ad78';
  if(axis==='vertical'){
   // Sideways doorway in a north/south running wall, not a flat floor tile.
   pixRect(x-s*.21,y-s*.78,s*.54,s*1.18,'rgba(0,0,0,.45)');
   pixRect(x-s*.26,y-s*.76,s*.32,s*1.11,side);
   pixRect(x+s*.08,y-s*.76,s*.18,s*1.11,trim);
   pixRect(x-s*.29,y-s*.79,s*.57,s*.16,bright);
   if(!open){pixRect(x-s*.17,y-s*.53,s*.28,s*.78,'#7f5234');
    for(let i=0;i<3;i++)pixRect(x-s*.14+i*s*.09,y-s*.5,s*.025,s*.68,'#bd8150');
    pixRect(x-s*.09,y-s*.19,s*.12,s*.10,'#f1cb7f');}
   else{pixRect(x+s*.12,y-s*.5,s*.12,s*.68,'#825939');pixRect(x+s*.15,y-s*.36,s*.05,s*.1,'#e2b16d');}
  }else{
   // Archway built from thick masonry, matching adjoining wall height.
   pixRect(x-s*.52,y-s*.64,s*1.04,s*.99,'rgba(0,0,0,.42)');
   pixRect(x-s*.5,y-s*.67,s*1.0,s*.90,side);
   pixRect(x-s*.39,y-s*.55,s*.78,s*.74,'#22252a');
   pixRect(x-s*.5,y-s*.71,s*1.0,s*.17,bright);
   pixRect(x-s*.5,y-s*.58,s*.18,s*.82,trim);
   pixRect(x+s*.32,y-s*.58,s*.18,s*.82,side);
   pixRect(x-s*.31,y-s*.47,s*.62,s*.08,trim);
   if(!open){
    pixRect(x-s*.29,y-s*.39,s*.58,s*.59,'#674128');
    pixRect(x-s*.23,y-s*.37,s*.46,s*.56,'#a97143');
    for(let i=0;i<3;i++)pixRect(x-s*.15+i*s*.16,y-s*.34,s*.025,s*.50,'#704329');
    pixRect(x+s*.1,y-s*.03,s*.11,s*.11,'#f0c36f');
   }else{
    pixRect(x+s*.28,y-s*.37,s*.11,s*.56,'#b07a4c');
    pixRect(x+s*.30,y-s*.12,s*.06,s*.08,'#e9bd73');
    pixRect(x-s*.28,y+s*.1,s*.56,s*.085,'#51443a');
   }
  }return;
 }
 if(p.kind==='platform'){
  pixRect(x-s*.49,y-s*.11,s*.98,s*.72,'#5c4332');
  pixRect(x-s*.49,y-s*.11,s*.98,s*.10,'#c19763');
  for(let j=0;j<4;j++)pixRect(x-s*.35+j*s*.22,y-s*.04,s*.02,s*.52,'rgba(0,0,0,.22)');
  pixRect(x-s*.49,y+s*.18,s*.98,s*.04,'rgba(255,235,190,.12)');return;
 }
 if(p.kind==='torch'){
  pixRect(x-s*.08,y-s*.03,s*.16,s*.46,'#78513c');pixRect(x-s*.16,y-s*.43,s*.34,s*.39,'#e5a456');
  pixRect(x-s*.05,y-s*.37,s*.12,s*.23,'#fff0b2');return;
 }
 if(p.kind==='campfire'){drawProp({...p,kind:'fire'},t);return;}
 if(p.kind==='chest'){
   pixRect(x-s*.46,y+s*.15,s*.92,s*.23,'rgba(0,0,0,.4)');
   pixRect(x-s*.44,y-s*.15,s*.88,s*.50,'#49302a');
   pixRect(x-s*.40,y-s*.40,s*.80,s*.35,'#ba8248');
   pixRect(x-s*.40,y-s*.27,s*.80,s*.12,'#e0ab64');
   pixRect(x-s*.37,y-s*.04,s*.74,s*.32,'#975f37');
   pixRect(x-s*.34,y+s*.03,s*.68,s*.06,'#c3894e');
   pixRect(x-s*.35,y-s*.37,s*.10,s*.60,'#d6b06f');pixRect(x+s*.24,y-s*.37,s*.11,s*.60,'#d6b06f');
   pixRect(x-s*.09,y-s*.04,s*.18,s*.20,'#d8b96f');pixRect(x-s*.025,y+s*.015,s*.05,s*.09,'#43342d');return;
 }
 if(p.kind==='anvil'){
  pixRect(x-s*.20,y-s*.04,s*.4,s*.46,'#433d3e');pixRect(x-s*.42,y-s*.29,s*.9,s*.3,'#76838a');pixRect(x-s*.36,y-s*.42,s*.62,s*.15,'#a2aab0');pixRect(x+s*.3,y-s*.26,s*.23,s*.12,'#5b646b');return;
 }
 if(p.kind==='gate'){
  pixRect(x-s*.48,y-s*.72,s*.98,s*1.28,'#272d39');pixRect(x-s*.41,y-s*.68,s*.82,s*1.12,'#745e51');pixRect(x-s*.32,y-s*.58,s*.64,s*.94,'#27333d');pixRect(x-s*.06,y-s*.42,s*.12,s*.52,'#5fa4aa');pixRect(x-s*.18,y-s*.11,s*.36,s*.1,'#9cd5d3');return;
 }
 if(p.kind==='banner'){
  pixRect(x-s*.04,y-s*.67,s*.1,s*1.1,'#b38a5d');pixRect(x-s*.08,y-s*.69,s*.59,s*.1,'#e0bc82');pixRect(x+s*.05,y-s*.57,s*.4,s*.54,'#9d6242');pixRect(x+s*.18,y-s*.42,s*.15,s*.15,'#e7bc7c');return;
 }
 if(p.kind==='crystal'){
  pixRect(x-s*.28,y-s*.18,s*.5,s*.46,'#3f5f6c');pixRect(x-s*.06,y-s*.62,s*.25,s*.57,'#77c7c4');pixRect(x+s*.18,y-s*.36,s*.21,s*.46,'#4999b1');pixRect(x-s*.01,y-s*.53,s*.07,s*.16,'#c8f4e4');return;
 }
 if(p.kind==='glowmush'){
  ctx.fillStyle='rgba(95,239,233,.18)';ctx.beginPath();ctx.ellipse(x,y+s*.04,s*.52,s*.30,0,0,Math.PI*2);ctx.fill();
  pixRect(x-s*.06,y-s*.02,s*.12,s*.28,'#94d9cf');
  pixRect(x-s*.30,y-s*.21,s*.22,s*.16,'#4ad4db');pixRect(x-s*.05,y-s*.26,s*.24,s*.18,'#75edee');pixRect(x+s*.18,y-s*.17,s*.18,s*.13,'#34a9cb');
  pixRect(x-s*.28,y-s*.18,s*.19,s*.05,'#d2ffff');pixRect(x-s*.01,y-s*.22,s*.16,s*.05,'#ecffff');pixRect(x+s*.21,y-s*.13,s*.10,s*.04,'#b9f3ff');return;
 }
 if(p.kind==='monument'){
  pixRect(x-s*.4,y-s*.09,s*.8,s*.45,'#343b46');pixRect(x-s*.28,y-s*.8,s*.55,s*.8,'#73737b');pixRect(x-s*.14,y-s*.61,s*.25,s*.34,'#5ba4a3');pixRect(x-s*.04,y-s*.51,s*.09,s*.11,'#b4dcda');return;
 }
 // signpost
 pixRect(x-s*.06,y-s*.13,s*.12,s*.56,'#725137');pixRect(x-s*.42,y-s*.45,s*.86,s*.42,'#a1714a');pixRect(x-s*.35,y-s*.36,s*.69,s*.13,'#d8b078');pixRect(x-s*.27,y-s*.14,s*.55,s*.045,'#604e3a');
}
function drawPlayer(t){const p=worldToScreen(player.x,player.y),frame=Math.floor(player.walk*5)%2,sp=sprites[player.gender+'_'+player.face+'_'+frame];
 const w=t*.89,h=t*1.22,x=Math.round(p.x-w/2),y=Math.round(p.y-h+.28*t);
 ctx.fillStyle='rgba(0,0,0,.5)';ctx.beginPath();ctx.ellipse(p.x,p.y+t*.18,t*.34,t*.16,0,0,Math.PI*2);ctx.fill();
 ctx.imageSmoothingEnabled=false;ctx.drawImage(sp,x,y,w,h);
 const palette=['','#bf8851','#9bafb4','#e0b956','#b0cccf','#d8a77b'];
 const armor=equipment.chest?0:(player.armorTier||0);
 if(armor){const c=palette[Math.min(armor,5)],px=w/24,py=h/32;
  ctx.fillStyle=c;ctx.fillRect(Math.round(x+7*px),Math.round(y+18*py),Math.ceil(10*px),Math.ceil(5*py));
  ctx.fillStyle='rgba(35,37,42,.43)';ctx.fillRect(Math.round(x+8*px),Math.round(y+21*py),Math.ceil(8*px),Math.ceil(2*py));
  ctx.fillStyle=c;ctx.fillRect(Math.round(x+8*px),Math.round(y+7*py),Math.ceil(8*px),Math.ceil(2*py));
 }
 if((player.pick||1)>1){ctx.fillStyle=palette[Math.min(player.pick-1,5)];
  ctx.fillRect(Math.round(x+w*.76),Math.round(y+h*.36),Math.max(2,Math.round(w*.17)),Math.max(2,Math.round(h*.045)));}
 if(pickedItem()?.id==='sword'&&(player.weaponTier||0)>0){const metal=palette[Math.min(player.weaponTier,5)];
  ctx.fillStyle=metal;ctx.fillRect(Math.round(x+w*.78),Math.round(y+h*.31),Math.max(2,Math.round(w*.07)),Math.max(3,Math.round(h*.29)));
  ctx.fillStyle='#6b513a';ctx.fillRect(Math.round(x+w*.73),Math.round(y+h*.56),Math.max(3,Math.round(w*.16)),Math.max(2,Math.round(h*.04)));}

 // Armadura modular (casco, pechera, pantalones, botas y objeto secundario).
 const box=(ax,ay,ww,hh,color)=>{if(!color)return;ctx.fillStyle=color;ctx.fillRect(Math.round(x+ax*w/24),Math.round(y+ay*h/32),Math.ceil(ww*w/24),Math.ceil(hh*h/32));};
 box(6,5,12,4,equipmentColor(equipment.head));box(7,17,10,6,equipmentColor(equipment.chest));
 box(7,24,5,3,equipmentColor(equipment.legs));box(13,24,5,3,equipmentColor(equipment.legs));
 box(5,28,7,3,equipmentColor(equipment.feet));box(13,28,7,3,equipmentColor(equipment.feet));
 if(equipment.offhand?.id==='escudo'){box(0,14,5,13,'#a77d4e');box(1,16,3,9,'#c0c7c7');}
 if(equipment.offhand?.id==='lampara'){box(0,18,4,7,'#b89155');box(1,19,2,4,lampActive()?'#b5efc5':'#555f69');}
 if(hitFlash>0){ctx.strokeStyle='rgba(244,207,137,.7)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y-t*.14,t*.6,-.9,1.4);ctx.stroke();}
}


function drawGround(x,y,sx,sy,t){const biome=LEVELS[layer],q=hashInt(x,y,12),room=inDungeon(x,y)?dungeonRoom(x,y):null;
 const palette={entrada:'#38333d',derrumbe:'#41363c',despacho:'#473b37',seda:'#2f303e',santuario:'#38324c',refugio:'#403c3a',nido:'#282035',tesoro:'#343442'};
 ctx.fillStyle=room?palette[room.id]:(inDungeon(x,y)?'#33313d':biome.floor);ctx.fillRect(sx,sy,t+1,t+1);
 if(inDungeon(x,y)){
  // Distintos patrones de baldosas, rieles, grietas, seda y brasas según el recinto.
  ctx.fillStyle='rgba(200,176,155,.13)';ctx.fillRect(sx+1,sy+t*.12,t*.84,Math.max(2,t*.05));
  ctx.fillStyle='rgba(8,10,18,.33)';ctx.fillRect(sx+t*.80,sy+1,Math.max(2,t*.05),t*.81);
  if((x+y)%3===0){ctx.fillStyle='rgba(139,110,116,.28)';ctx.fillRect(sx+t*.16,sy+t*.52,t*.26,Math.max(2,t*.055));}
  if(room?.id==='entrada'){if(y===0||y===2){ctx.fillStyle='#97877b';ctx.fillRect(sx,sy+t*.33,t,Math.max(2,t*.07));ctx.fillRect(sx,sy+t*.70,t,Math.max(2,t*.07));}if(x%2===0){ctx.fillStyle='#765445';ctx.fillRect(sx+t*.25,sy+t*.17,t*.11,t*.72);}}
  if(room?.id==='derrumbe'){if(q>.55){ctx.fillStyle='#785c57';ctx.fillRect(sx+t*.16,sy+t*.46,t*.32,t*.14);ctx.fillStyle='#2c252c';ctx.fillRect(sx+t*.49,sy+t*.36,t*.13,t*.38);}}
  if(room?.id==='despacho'){ctx.fillStyle='rgba(183,125,73,.17)';ctx.fillRect(sx+t*.08,sy+t*.08,t*.77,t*.76);if(x%3===0){ctx.fillStyle='#6c5549';ctx.fillRect(sx,sy+t*.45,t,Math.max(2,t*.055));}}
  if(room?.id==='seda'||room?.id==='nido'){if(q>.28){ctx.strokeStyle=room?.id==='nido'?'rgba(178,150,206,.37)':'rgba(146,159,198,.28)';ctx.lineWidth=Math.max(1,t*.035);ctx.beginPath();ctx.moveTo(sx+1,sy+t*.18);ctx.lineTo(sx+t*.75,sy+t*.84);ctx.moveTo(sx+t*.85,sy+t*.2);ctx.lineTo(sx+t*.18,sy+t*.72);ctx.stroke();}if(q>.91){ctx.fillStyle='#6c5273';ctx.fillRect(sx+t*.4,sy+t*.34,t*.21,t*.10);}}
  if(room?.id==='nido'&&distance(x+.5,y+.5,155.5,-.5)<8){ctx.fillStyle='rgba(114,46,87,.27)';ctx.fillRect(sx,sy,t+1,t+1);if(q>.72){ctx.fillStyle='#6e405e';ctx.fillRect(sx+t*.12,sy+t*.18,t*.34,t*.09);}}
  if(room?.id==='santuario'&&q>.63){ctx.fillStyle='rgba(117,117,200,.28)';ctx.fillRect(sx+t*.33,sy+t*.31,t*.25,t*.10);}
  if(room?.id==='tesoro'&&q>.85){ctx.fillStyle='#937f65';ctx.fillRect(sx+t*.21,sy+t*.22,t*.12,t*.1);}
  if(room?.id==='refugio'&&q>.72){ctx.fillStyle='#987554';ctx.fillRect(sx+t*.22,sy+t*.32,t*.19,t*.08);}
 }
 ctx.fillStyle=hashInt(x,y,14)>.6?'rgba(231,210,172,.13)':'rgba(5,8,15,.12)';ctx.fillRect(sx+t*.18,sy+t*.22,t*.16,Math.max(2,t*.075));ctx.fillRect(sx+t*.65,sy+t*.63,t*.12,Math.max(2,t*.06));
 if(layer===2&&q>.83){ctx.fillStyle='#7bbaa0';ctx.fillRect(sx+t*.5,sy+t*.34,t*.06,t*.24);ctx.fillStyle='#b28fc3';ctx.fillRect(sx+t*.35,sy+t*.24,t*.34,t*.14);}
 if(layer===4&&q>.88){ctx.fillStyle='#7cd1d2';ctx.fillRect(sx+t*.52,sy+t*.39,t*.12,t*.26);ctx.fillStyle='#b8edf1';ctx.fillRect(sx+t*.54,sy+t*.39,t*.05,t*.12);}
 if(layer===5&&q>.86){ctx.fillStyle='#c45d40';ctx.fillRect(sx+t*.19,sy+t*.49,t*.25,t*.06);ctx.fillStyle='#f0a767';ctx.fillRect(sx+t*.37,sy+t*.51,t*.10,t*.06);}
 if(layer===0&&q>.84){ctx.fillStyle='#738965';ctx.fillRect(sx+t*.65,sy+t*.28,t*.08,t*.2);ctx.fillRect(sx+t*.58,sy+t*.36,t*.2,t*.07);}
 if(layer===5&&q>.985){ctx.fillStyle='#d96d47';ctx.fillRect(sx+t*.18,sy+t*.44,t*.6,t*.13);}
 if(layer===6&&q>.93){ctx.fillStyle='#a68ad6';ctx.fillRect(sx+t*.55,sy+t*.4,t*.08,t*.08);}
 ctx.fillStyle='rgba(3,8,14,.09)';ctx.fillRect(sx,sy,t,1);}
function drawWall(x,y,sx,sy,t,type){const biome=LEVELS[layer];ctx.fillStyle='#20222a';ctx.fillRect(sx,sy+2,t+1,t-1);
 ctx.fillStyle=biome.wall;ctx.fillRect(sx+1,sy,t-2,t*.77);
 ctx.fillStyle=biome.color;ctx.fillRect(sx+1,sy+t*.72,t-1,t*.27);ctx.fillStyle='rgba(255,250,224,.19)';ctx.fillRect(sx+1,sy,t-2,2);
 ctx.fillStyle='rgba(0,0,0,.28)';ctx.fillRect(sx+t-3,sy,3,t);
 const sh=hashInt(x,y,44);ctx.fillStyle=sh>.48?'rgba(0,0,0,.16)':'rgba(255,255,255,.10)';ctx.fillRect(sx+t*.19,sy+t*.25,t*.16,t*.07);ctx.fillRect(sx+t*.63,sy+t*.5,t*.17,t*.065);
 if(type===T.SOFT){
  ctx.fillStyle='#775036';ctx.fillRect(sx+1,sy,t-2,t*.99);
  ctx.fillStyle='#9d6a45';ctx.fillRect(sx+1,sy,t-2,t*.18);
  ctx.fillStyle='#4e352c';ctx.fillRect(sx+t*.13,sy+t*.33,t*.18,t*.13);
  ctx.fillRect(sx+t*.61,sy+t*.64,t*.21,t*.12);
  ctx.fillStyle='#bd9062';ctx.fillRect(sx+t*.53,sy+t*.26,t*.13,t*.09);
  ctx.fillRect(sx+t*.29,sy+t*.77,t*.16,t*.08);
 }
 else if(type===T.COPPER){ctx.fillStyle='#c77d4e';ctx.fillRect(sx+t*.18,sy+t*.16,t*.24,t*.24);ctx.fillRect(sx+t*.63,sy+t*.44,t*.22,t*.2);ctx.fillStyle='#f5bb78';ctx.fillRect(sx+t*.21,sy+t*.2,t*.08,t*.06);}
 else if(type===T.GOLD){
  ctx.fillStyle='#ac7b2d';ctx.fillRect(sx+t*.15,sy+t*.15,t*.32,t*.24);ctx.fillRect(sx+t*.52,sy+t*.49,t*.32,t*.27);
  ctx.fillStyle='#ffe39a';ctx.fillRect(sx+t*.22,sy+t*.18,t*.14,t*.10);ctx.fillRect(sx+t*.61,sy+t*.52,t*.12,t*.1);
  ctx.fillStyle='#705124';ctx.fillRect(sx+t*.31,sy+t*.33,t*.20,t*.07);
 }
 else if(type===T.COAL){ctx.fillStyle='#1e2430';ctx.fillRect(sx+t*.2,sy+t*.21,t*.24,t*.19);ctx.fillRect(sx+t*.61,sy+t*.38,t*.21,t*.25);ctx.fillStyle='#7f8188';ctx.fillRect(sx+t*.24,sy+t*.24,t*.08,t*.045);}
 else if(type===T.IRON){ctx.fillStyle='#9aafaf';ctx.fillRect(sx+t*.23,sy+t*.16,t*.24,t*.21);ctx.fillRect(sx+t*.58,sy+t*.5,t*.24,t*.15);ctx.fillStyle='#c5d6ce';ctx.fillRect(sx+t*.25,sy+t*.18,t*.1,t*.07);}
 else if(type===T.CRYSTAL||type===T.MITHRIL){ctx.fillStyle=type===T.MITHRIL?'#8a9be0':'#73c4c5';ctx.fillRect(sx+t*.25,sy+t*.13,t*.19,t*.29);ctx.fillRect(sx+t*.56,sy+t*.42,t*.22,t*.24);ctx.fillStyle='#e6f5eb';ctx.fillRect(sx+t*.29,sy+t*.17,t*.07,t*.09);}
 else if(type===T.ADAMANTITE){ctx.fillStyle='#d8725d';ctx.fillRect(sx+t*.2,sy+t*.22,t*.26,t*.18);ctx.fillRect(sx+t*.64,sy+t*.42,t*.18,t*.22);ctx.fillStyle='#ffc487';ctx.fillRect(sx+t*.22,sy+t*.2,t*.1,t*.07);}
 else if(type===T.ANCIENT){ctx.fillStyle='#c3a3dd';ctx.fillRect(sx+t*.19,sy+t*.18,t*.25,t*.2);ctx.fillRect(sx+t*.59,sy+t*.46,t*.21,t*.16);ctx.fillStyle='#f2d2ed';ctx.fillRect(sx+t*.25,sy+t*.21,t*.08,t*.07);}
 // Sparkle belongs to the ore, not the entire tile: short glints at different phases.
 if([T.COPPER,T.IRON,T.GOLD,T.CRYSTAL,T.MITHRIL,T.ADAMANTITE].includes(type)){
  const phase=hashInt(x,y,835)*6.28,twinkle=Math.sin(blink*2.4+phase);
  if(twinkle>.73){ctx.fillStyle=type===T.GOLD?'rgba(255,245,183,.95)':'rgba(220,252,248,.83)';
   const px=sx+t*(.28+hashInt(x,y,918)*.39),py=sy+t*(.19+hashInt(x,y,929)*.43);
   ctx.fillRect(Math.round(px),Math.round(py),Math.max(2,Math.round(t*.10)),Math.max(2,Math.round(t*.045)));
   ctx.fillRect(Math.round(px+t*.035),Math.round(py-t*.028),Math.max(1,Math.round(t*.035)),Math.max(2,Math.round(t*.12)));
  }
 }
}

function drawBackgroundWall(x,y,sx,sy,t){const id=backs.get(builtKey(layer,x,y));if(!id)return;
 ctx.fillStyle=id==='woodback'?'rgba(161,103,61,.24)':'rgba(110,123,133,.20)';ctx.fillRect(sx+2,sy+2,t-4,t-4);
 ctx.fillStyle='rgba(255,240,210,.07)';ctx.fillRect(sx+2,sy+2,t-4,2);}
function drawBuiltFloor(x,y,sx,sy,t){const material=floorAt(x,y);if(!material)return;
 const n=floorAt(x,y-1)===material,e=floorAt(x+1,y)===material,so=floorAt(x,y+1)===material,w=floorAt(x-1,y)===material;
 const q=hashInt(x,y,12);
 if(material==='platform'){
  pixRect(sx,sy,t+1,t+1,'#866240');
  for(let j=0;j<3;j++){
   let yy=sy+j*t/3;pixRect(sx,yy,t+1,t*.32,j%2?'#ab7b4e':'#b98b58');
   pixRect(sx,yy+t*.30,t+1,t*.035,'#694a34');
   const off=(y+j)%2?t*.66:t*.28;
   pixRect(sx+off,yy+t*.06,t*.035,t*.21,'#765138');
  }
 }else{
  pixRect(sx,sy,t+1,t+1,'#717977');
  pixRect(sx+1,sy+1,t-1,t-1,(x+y)%3===0?'#8d948f':'#858b88');
  if((x+y)%2===0){pixRect(sx+t*.13,sy+t*.2,t*.18,t*.03,'#a6aaa3');pixRect(sx+t*.65,sy+t*.72,t*.18,t*.03,'#5b696a');}
  pixRect(sx,sy+t-2,t+1,2,'#4d5857');pixRect(sx+t-2,sy,2,t,'#53605f');
 }
 const trim=material==='platform'?'#dfb17c':'#c3c7bf';
 if(!n)pixRect(sx,sy,t,3,trim);
 if(!e)pixRect(sx+t-3,sy,3,t,trim);
 if(!so)pixRect(sx,sy+t-3,t,3,trim);
 if(!w)pixRect(sx,sy,3,t,trim);
}
function drawGroundDrop(p,t){let a=worldToScreen(p.x,p.y),x=a.x,y=a.y;ctx.fillStyle='#211e25';ctx.fillRect(x-t*.20,y-t*.15,t*.4,t*.35);
 ctx.fillStyle=p.id==='madera'?'#bf9459':'#8ab6ab';ctx.fillRect(x-t*.13,y-t*.17,t*.26,t*.24);}
function drawDeathBag(p,t){let a=worldToScreen(p.x,p.y),x=a.x,y=a.y;ctx.fillStyle='#d5a467';ctx.fillRect(x-t*.20,y-t*.28,t*.44,t*.49);
 ctx.fillStyle='#4e332e';ctx.fillRect(x-t*.11,y-t*.18,t*.21,t*.09);}
// Overlay cenital de desgaste: grietas + barra corta + chispas del golpe.
function drawDemolitionEffects(t){
 for(const [k,record] of dismantleDamage){
  if(record.layer!==layer||!vis.has(Math.floor(record.x)+','+Math.floor(record.y)))continue;
  const a=worldToScreen(record.x,record.y),progress=record.hits/record.total;
  if(a.x< -t||a.y< -t||a.x>screen.w+t||a.y>screen.h+t)continue;
  const floor=k.startsWith('f:'), y=a.y-(floor?t*.22:t*.60),weight=Math.max(1.3,t*.04);
  ctx.save();ctx.lineWidth=weight;ctx.strokeStyle='rgba(28,21,20,.85)';ctx.beginPath();
  ctx.moveTo(a.x-t*.18,y);ctx.lineTo(a.x-t*.03,y+t*.14);
  ctx.lineTo(a.x+t*.03,y+t*.28);ctx.lineTo(a.x+t*.21,y+t*.35);
  if(progress>.42){ctx.moveTo(a.x-t*.03,y+t*.14);ctx.lineTo(a.x-t*.22,y+t*.27);}
  if(progress>.70){ctx.moveTo(a.x+t*.03,y+t*.28);ctx.lineTo(a.x+t*.11,y+t*.48);}
  ctx.stroke();
  const width=Math.max(21,t*.86),bx=a.x-width*.5,by=a.y-(floor?t*.48:t*.94);
  pixRect(bx-2,by-2,width+4,7,'rgba(8,12,21,.92)');
  pixRect(bx,by,width,3,'#57473d');pixRect(bx,by,width*progress,3,'#f1ba68');
  ctx.restore();
 }
 if(dismantleFX?.ttl>0){
  const {x,y,ttl,seed:fxSeed}=dismantleFX,a=worldToScreen(x,y);
  const strength=Math.min(1,ttl/.20);
  for(let i=0;i<5;i++){
   const ang=(fxSeed+i*1.256)*1.7,dist=t*(.15+(.28-ttl)*1.0+i*.023);
   pixRect(a.x+Math.cos(ang)*dist,a.y-t*.28+Math.sin(ang)*dist,
     t*.045,t*.045,i%2?'rgba(250,205,119,'+strength+')':'rgba(226,237,218,'+strength+')');
  }
 }
}
function drawPickSwing(t){
 if(impactSwing<=0||pickedItem()?.id==='sword')return;
 const pos=worldToScreen(player.x,player.y),phase=1-impactSwing/.24;
 const direction=player.face==='left'?-1:1;
 const arcX=pos.x+t*(direction*.36+Math.sin(phase*Math.PI)*direction*.13);
 const arcY=pos.y-t*(.46+Math.cos(phase*Math.PI)*.09);
 pixRect(arcX,arcY,t*.07,t*.27,'#835a3e');
 pixRect(arcX-t*.10,arcY-t*.08,t*.31,t*.07,'#c0d1cb');
 pixRect(arcX+t*.12,arcY-t*.04,t*.08,t*.08,'#789591');
}
function drawCombatEffects(t){
 if(attackFX&&attackFX.ttl>0){
  const a=worldToScreen(player.x,player.y);
  const ang=Math.atan2(attackFX.dy,attackFX.dx),progress=1-attackFX.ttl/attackFX.max;
  ctx.save();ctx.lineWidth=Math.max(3,t*(attackFX.charged?.14:.09));
  ctx.strokeStyle=attackFX.charged?`rgba(145,235,247,${.92-progress*.78})`:`rgba(255,224,158,${.9-progress*.73})`;
  ctx.beginPath();ctx.arc(a.x,a.y,t*(attackFX.charged?2.1:1.50),ang-(attackFX.charged?1.4:.75)+progress*.24,ang+(attackFX.charged?1.4:.75)+progress*.24);ctx.stroke();
  if(attackFX.charged){ctx.lineWidth=Math.max(2,t*.04);ctx.strokeStyle=`rgba(247,255,244,${.7-progress*.6})`;
   ctx.beginPath();ctx.arc(a.x,a.y,t*1.68,ang-1.25,ang+1.25);ctx.stroke();}
  ctx.restore();
 }
 if(dodgeTime>0){const a=worldToScreen(player.x,player.y);ctx.save();ctx.globalAlpha=.25;
  ctx.fillStyle='#70d5d5';ctx.beginPath();ctx.ellipse(a.x-dodgeX*t*.46,a.y-dodgeY*t*.46,t*.34,t*.49,0,0,Math.PI*2);ctx.fill();ctx.restore();}
}
function drawMiningTarget(t,a){
 if(!a)return;
 if(a.kind==='wall'&&!wallCanBeMined(a.type))return;
 if(a.p?.kind==='chest'&&a.p.storage?.some(Boolean))return;
 const key=a.kind==='floor'?floorDismantleKey(a.x,a.y):a.p&&structures.has(a.p.id)?dismantleKey(a.p):null;
 if(key&&actionHeld&&actionFocus&&actionFocus!==key)return;
 const cell=worldToScreen(a.x,a.y);
 ctx.save();ctx.strokeStyle='#dda263';ctx.globalAlpha=.8;ctx.lineWidth=1;
 ctx.strokeRect(Math.floor(cell.x)+2.5,Math.floor(cell.y)+2.5,t-5,t-5);
 ctx.restore();
}
function drawHandReticle(t,props){
 if(!canAim())return;
 const p=reticleTarget(props),active=!handTargetError(p);
 ctx.save();
 ctx.globalAlpha=.75;
 ctx.fillStyle=active?'#a5e5aa':'#eef1ef';
 const {x,y}=reticlePoint();
 const size=clamp(Math.round(t*.19),5,7);
 ctx.fillRect(x-1,y-size,2,size*2);
 ctx.fillRect(x-size,y-1,size-1,2);
 ctx.fillRect(x+1,y-1,size-1,2);
 if(active){
  const cell=worldToScreen(Math.floor(p.x),Math.floor(p.y));
  ctx.strokeStyle='#a5e5aa';ctx.globalAlpha=.48;ctx.lineWidth=1;
  ctx.strokeRect(Math.floor(cell.x)+1.5,Math.floor(cell.y)+1.5,t-3,t-3);
 }
 ctx.restore();
}
function render(t){const w=screen.w,h=screen.h;ctx.setTransform(canvas.width/w,0,0,canvas.height/h,0,0);ctx.imageSmoothingEnabled=false;ctx.fillStyle='#101824';ctx.fillRect(0,0,w,h);
 const x0=Math.floor(screen.camX-w/(2*t))-1,x1=Math.ceil(screen.camX+w/(2*t))+1,y0=Math.floor(screen.camY-h/(2*t))-1,y1=Math.ceil(screen.camY+h/(2*t))+1,entities=[];
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
 const a=worldToScreen(x,y),kind=tileAt(x,y);if(kind===T.FLOOR){drawGround(x,y,Math.floor(a.x),Math.floor(a.y),t);drawBackgroundWall(x,y,Math.floor(a.x),Math.floor(a.y),t);drawBuiltFloor(x,y,Math.floor(a.x),Math.floor(a.y),t);}
 else{ctx.fillStyle='#192430';ctx.fillRect(Math.floor(a.x),Math.floor(a.y),t+1,t+1);entities.push({kind:'wall',y:y+.92,x,yy:y,a,type:kind});}}
 for(const web of webs.values())if(web.layer===layer&&web.x>=x0-1&&web.x<=x1+1&&web.y>=y0-1&&web.y<=y1+1&&vis.has(web.x+','+web.y))drawWeb(web,t);
 for(const mob of localEnemies())if(mob.x>=x0-1&&mob.x<=x1+1&&mob.y>=y0-1&&mob.y<=y1+1)entities.push({kind:'mob',y:mob.y,p:mob});
 const props=currentProps();
 if(handSelection&&!handSelection.error&&handTargetError(tappedHandTarget(props)))handSelection=null;
 const pickEquipped=pickedItem()?.id==='pick';
 const pickTarget=pickEquipped&&canAim()?miningTarget(props):null;
 if(pickEquipped&&canAim())updateContext(pickTarget);
 for(const p of props)if(p.kind!=='platform'&&p.x>=x0-2&&p.x<=x1+2&&p.y>=y0-2&&p.y<=y1+2)entities.push({kind:'prop',y:isWallStructure(p)?p.y+.42:p.y,p});
 for(const d of groundDrops)if(d.layer===layer&&d.x>x0-1&&d.x<x1+1&&d.y>y0-1&&d.y<y1+1)entities.push({kind:'drop',y:d.y,p:d});
 for(const d of deathBags)if(d.layer===layer&&d.x>x0-1&&d.x<x1+1&&d.y>y0-1&&d.y<y1+1)entities.push({kind:'deathbag',y:d.y,p:d});
 entities.push({kind:'player',y:player.y});entities.sort((a,b)=>a.y-b.y);
 for(const e of entities){if(e.kind==='wall')drawWall(e.x,e.yy,Math.floor(e.a.x),Math.floor(e.a.y),t,e.type);else if(e.kind==='prop')drawProp(e.p,t);else if(e.kind==='mob')drawCreature(e.p,t);else if(e.kind==='drop')drawGroundDrop(e.p,t);else if(e.kind==='deathbag')drawDeathBag(e.p,t);else drawPlayer(t);}
 drawDemolitionEffects(t);drawPickSwing(t);drawCombatEffects(t);
 // Uncommitted construction blueprints: ghost drawings, never real walls until accepted.
 for(const c of [...blueprint.values(),...ghostCells]){
  if(c.layer!==layer||c.x<x0-1||c.x>x1+1||c.y<y0-1||c.y>y1+1)continue;
  const a=worldToScreen(c.x,c.y),kind=buildKind(c.id),valid=validateBlueprintCell(c);
  ctx.save();ctx.globalAlpha=.62;renderBlueprintPreview=true;
  if(kind==='woodback'||kind==='stoneback'||kind==='door'){
   drawProp({x:c.x+.5,y:c.y+.5,kind:kind==='woodback'?'woodwall':kind==='stoneback'?'stonewall':'door',open:false},t);
  }else if(kind==='platform'||kind==='stonefloor'){
   ctx.fillStyle=kind==='platform'?'#bc8a55':'#adb3b2';ctx.fillRect(a.x,a.y,t,t);
  }else{
   ctx.fillStyle='#dbb279';ctx.fillRect(a.x+4,a.y+4,t-8,t-8);
  }
  renderBlueprintPreview=false;ctx.restore();
  ctx.strokeStyle=valid?'#9df0d1':'#ff7569';ctx.lineWidth=2.4;ctx.strokeRect(a.x+2,a.y+2,t-4,t-4);
  if(!valid){ctx.fillStyle='rgba(216,48,51,.25)';ctx.fillRect(a.x+2,a.y+2,t-4,t-4);}
 }
 // El contorno solo indica la selección; tocar jamás ejecuta una interacción.
 if(!pickEquipped&&targetCell){const a=worldToScreen(targetCell.x,targetCell.y);ctx.strokeStyle='#edc783';ctx.lineWidth=2.5;
  ctx.strokeRect(Math.round(a.x)+3,Math.round(a.y)+3,t-6,t-6);
  ctx.fillStyle='rgba(237,199,131,.12)';ctx.fillRect(Math.round(a.x)+4,Math.round(a.y)+4,t-8,t-8);}
 // Nearby mining highlight, damage cracks and transparent fog of war.
 if(!pickEquipped&&selectedTile&&tileAt(selectedTile.x,selectedTile.y)!==T.FLOOR){let a=worldToScreen(selectedTile.x,selectedTile.y);ctx.lineWidth=2;ctx.strokeStyle='#f1c687';ctx.strokeRect(a.x+2,a.y+2,t-4,t-4);}
 const a=pickEquipped?pickTarget:pickedItem()?.id==='martillo'?repairTarget():null;
 if(a?.kind==='wall'){let v=breakDamage.get(layer+':'+a.x+':'+a.y)||0;if(v>0){let b=worldToScreen(a.x,a.y);ctx.strokeStyle='rgba(19,15,21,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(b.x+t*.25,b.y+t*.3);ctx.lineTo(b.x+t*.55,b.y+t*.55);ctx.lineTo(b.x+t*.46,b.y+t*.84);ctx.stroke();}}
 for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
  const a=worldToScreen(x,y),v=vis.has(x+','+y);
  if(!fogAt(x,y)){
   ctx.fillStyle='rgba(4,7,13,.987)';
   ctx.fillRect(Math.floor(a.x),Math.floor(a.y),t+1,t+1);
  }else if(!v){
   // El mapa recuerda lo descubierto, pero sin luz permanece en penumbra.
   ctx.fillStyle='rgba(5,8,15,.965)';
   ctx.fillRect(Math.floor(a.x),Math.floor(a.y),t+1,t+1);
  }else{
   const dist=distance(x+.5,y+.5,player.x,player.y);
   const lightKey=x+','+y;
   const torch=staticLights.get(lightKey)||0;
   const torchTint=staticLightTints.get(lightKey)||'warm';
   const personalRadius=lampActive()?MINER_LAMP_RADIUS:PLAYER_VISION_RADIUS;
   // La iluminación del jugador se atenúa hacia el límite de su radio.
   // No se iluminan casillas detrás de muros: reveal() ya usa rayClear().
   const personal=dist<=personalRadius?Math.max(.06,1-Math.pow(dist/personalRadius,1.65)) :0;
   const fixed=clamp(torch,0,1);
   const intensity=Math.max(personal,fixed);
   const shade=clamp(.90-intensity*.87,.04,.90);
   ctx.fillStyle=`rgba(6,9,17,${shade})`;
   ctx.fillRect(Math.floor(a.x),Math.floor(a.y),t+1,t+1);
   if(torch>.05){
    ctx.fillStyle=`rgba(245,166,87,${Math.min(.16,torch*.10)})`;
    ctx.fillRect(Math.floor(a.x),Math.floor(a.y),t+1,t+1);
   }
  }
 }
 // Player's lamp is a subtle warm glow; never changes the silhouette approved in Alpha 1.
 if(lampActive()){const p=worldToScreen(player.x,player.y),rr=t*2.2,grad=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,rr);grad.addColorStop(0,'rgba(237,180,112,.10)');grad.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=grad;ctx.fillRect(p.x-rr,p.y-rr,rr*2,rr*2);}
 drawMiningTarget(t,pickTarget);
 drawHandReticle(t,props);
}
function update(dt){if(!playing||paused)return;
 dodgeCooldown=Math.max(0,dodgeCooldown-dt);
 staminaDelay=Math.max(0,staminaDelay-dt);
 if(staminaDelay===0)stamina=Math.min(MAX_STAMINA,stamina+(22+progression.skills.combat*4)*dt);
 if(swordCharging)swordHoldTime=Math.min(.95,swordHoldTime+dt);
 if(attackFX)attackFX.ttl-=dt;
 if(dodgeTime>0){
  dodgeTime=Math.max(0,dodgeTime-dt);
  const pace=(webAt(player.x,player.y)?6.2:9.0)*dt;
  let x=clamp(player.x+dodgeX*pace,-MAX+.8,MAX-.8);
  if(canMove(x,player.y))player.x=x;
  let y=clamp(player.y+dodgeY*pace,-MAX+.8,MAX-.8);
  if(canMove(player.x,y))player.y=y;
 }
 if(frameCount%5===0)refreshCombatUI();
 const lit=equippedLamp();if(lit&&lampActive()){lit.fuel=Math.max(0,(Number(lit.fuel)||0)-dt);if(!lit.fuel){lit.on=false;reveal();toast('La lámpara se apagó. Recárgala desde Personaje.',2000,'warning');}}let x=joystick.x,y=joystick.y;if(keys.has('ArrowLeft')||keys.has('KeyA'))x--;if(keys.has('ArrowRight')||keys.has('KeyD'))x++;if(keys.has('ArrowUp')||keys.has('KeyW'))y--;if(keys.has('ArrowDown')||keys.has('KeyS'))y++;
 let m=Math.hypot(x,y);if(dodgeTime>0)m=0;if(m>.02){if(m>1)x/=m,y/=m;let speed=webAt(player.x,player.y)?1.93:3.95,oldX=player.x,oldY=player.y;
 // Resolve each axis independently so diagonal motion slides along walls.
 let nx=clamp(player.x+x*speed*dt,-MAX+.8,MAX-.8);if(canMove(nx,player.y))player.x=nx;
 let ny=clamp(player.y+y*speed*dt,-MAX+.8,MAX-.8);if(canMove(player.x,ny))player.y=ny;
 let moved=distance(oldX,oldY,player.x,player.y);player.steps+=moved;player.walk+=dt*2.65;
 if(Math.abs(x)>.04||Math.abs(y)>.04){player.dirX=x;player.dirY=y;if(Math.abs(x)>Math.abs(y)*1.25)player.face=x>0?'right':'left';else player.face=y>0?'down':'up';}
 }else player.walk=0;
 updateCreatures(dt);
 hitFlash=Math.max(0,hitFlash-dt);impactSwing=Math.max(0,impactSwing-dt);if(dismantleFX){dismantleFX.ttl-=dt;if(dismantleFX.ttl<=0)dismantleFX=null;}blink+=dt;frameCount++;
 // La repetición utiliza la cámara del último cuadro visible y vuelve a validar el alcance.
 if(actionHeld&&pickedItem()?.id!=='sword'){actionCD-=dt;if(actionCD<=0){doAction(true);actionCD=.19+Math.max(0,.13-player.pick*.025);}}
 const f=1-Math.exp(-9*dt);
 const ahead=CAMERA_LOOK_AHEAD/(Math.hypot(player.dirX,player.dirY)||1);
 screen.camX+=(clamp(player.x+player.dirX*ahead,-MAX+20,MAX-20)-screen.camX)*f;
 screen.camY+=(clamp(player.y+player.dirY*ahead,-MAX+12,MAX-12)-screen.camY)*f;
 if(frameCount%7===0){reveal();collectDrops();if(pickedItem()?.id!=='pick')updateContext();updateHud();}
 if(layer>=5&&tileAt(player.x,player.y)===T.FLOOR&&hashInt(Math.floor(player.x),Math.floor(player.y),12)>.985){hazardClock+=dt;if(hazardClock>=.7){hp-=Math.max(2,6-Math.floor(totalArmor()/3));hazardClock=0;if(hp<=0)die();}}else hazardClock=0;
 autoSaveTime+=dt;if(autoSaveTime>9){autoSaveTime=0;queueSave();}
}
function tick(ts){if(ts-minimapLast>360){minimapLast=ts;drawMiniMap();}let dt=lastTs?Math.min(.055,(ts-lastTs)/1000):.016;lastTs=ts;if(!playing){blink+=dt;screen.camX+=(START.x-screen.camX)*Math.min(1,dt*2);screen.camY+=(START.y-screen.camY)*Math.min(1,dt*2);}
 if(playing&&Math.floor(ts/400)!==Math.floor((ts-dt*1000)/400))tickAllFurnaces();
 update(dt);render(screen.tile);if(bossBattle)drawBattleFrame39(ts);refreshFurnaceProgress();if(toastUntil&&ts>toastUntil){UI.toast.classList.remove('visible');toastUntil=0;}requestAnimationFrame(tick);}
function resetJoy(){joystick.active=false;joystick.id=null;joystick.x=joystick.y=0;UI.knob.style.left='50%';UI.knob.style.top='50%';}
function steer(clientX,clientY){let box=UI.joystick.getBoundingClientRect(),cx=box.left+box.width/2,cy=box.top+box.height/2,rad=box.width*.32,dx=clientX-cx,dy=clientY-cy,dist=Math.hypot(dx,dy),s=Math.min(1,dist/rad)/(dist||1);joystick.x=dx*s;joystick.y=dy*s;UI.knob.style.left=(50+joystick.x*25)+'%';UI.knob.style.top=(50+joystick.y*25)+'%';}
function startActionPress(){if(!playing||paused||actionHeld)return;actionHeld=true;resetMiningFocus();UI.actionBtn.classList.add('pressed');if(pickedItem()?.id==='sword')beginSwordCharge();else doAction(false);}
function stopActionPress(){if(swordCharging)endSwordCharge();actionHeld=false;resetMiningFocus();UI.actionBtn.classList.remove('pressed');}
// Mouse/pen use Pointer Events. Touch uses independent Touch identifiers below, preventing
// the joystick from being released when a second finger taps an action button (iOS PWA).
let actionPointerId=null,actionTouchId=null,lastTouchCommand=0;
UI.joystick.addEventListener('pointerdown',e=>{
 if(e.pointerType==='touch'||!playing||paused||joystick.active)return;
 e.preventDefault();UI.joystick.setPointerCapture(e.pointerId);joystick.active=true;joystick.id='p'+e.pointerId;steer(e.clientX,e.clientY);
});
UI.joystick.addEventListener('pointermove',e=>{if(joystick.id!=='p'+e.pointerId)return;e.preventDefault();steer(e.clientX,e.clientY);});
['pointerup','pointercancel','lostpointercapture'].forEach(t=>UI.joystick.addEventListener(t,e=>{if(joystick.id==='p'+e.pointerId)resetJoy();}));
UI.actionBtn.addEventListener('pointerdown',e=>{
 if(e.pointerType==='touch'||!playing||paused||actionPointerId!==null)return;
 e.preventDefault();UI.actionBtn.setPointerCapture(e.pointerId);actionPointerId=e.pointerId;startActionPress();
});
['pointerup','pointercancel','lostpointercapture'].forEach(t=>UI.actionBtn.addEventListener(t,e=>{
 if(e.pointerId!==actionPointerId)return;actionPointerId=null;stopActionPress();
}));
// En touchstart se procesa solamente el dedo nuevo; los demás controles conservan
// sus identificadores y continúan funcionando simultáneamente.
const touchOptions={passive:false};
UI.joystick.addEventListener('touchstart',e=>{
 if(!playing||paused||joystick.active)return;
 const touch=e.changedTouches[0];if(!touch)return;e.preventDefault();
 joystick.active=true;joystick.id=touch.identifier;steer(touch.clientX,touch.clientY);
},touchOptions);
UI.actionBtn.addEventListener('touchstart',e=>{
 if(!playing||paused||actionTouchId!==null)return;
 const touch=e.changedTouches[0];if(!touch)return;e.preventDefault();
 actionTouchId=touch.identifier;startActionPress();
},touchOptions);
// Un único listener a nivel del documento garantiza continuidad aun si el dedo
// sale de los límites visuales del joystick o llega otra pulsación a la pantalla.
document.addEventListener('touchmove',e=>{
 let active=false;
 for(const touch of e.changedTouches){if(joystick.active&&joystick.id===touch.identifier){steer(touch.clientX,touch.clientY);active=true;}if(actionTouchId===touch.identifier)active=true;}
 if(active)e.preventDefault();
},touchOptions);
function releaseTouchControls(e){
 for(const touch of e.changedTouches){
  if(joystick.active&&joystick.id===touch.identifier)resetJoy();
  if(actionTouchId===touch.identifier){actionTouchId=null;stopActionPress();}
 }
}
document.addEventListener('touchend',releaseTouchControls,touchOptions);
document.addEventListener('touchcancel',releaseTouchControls,touchOptions);
// Botones de un toque, independientes del joystick. Se cancela el click sintético
// para que una pulsación de móvil no active la acción dos veces.
function mobileTap(el,handler){
 el.addEventListener('touchstart',e=>{if(!playing||paused)return;e.preventDefault();e.stopPropagation();lastTouchCommand=performance.now();handler();},touchOptions);
 el.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();if(performance.now()-lastTouchCommand<650)return;handler();});
}
mobileTap(UI.dodgeBtn,()=>dodge());
mobileTap(UI.interactBtn,()=>doInteract());
mobileTap(UI.lampBtn,()=>{if(equippedLamp())toggleLamp(false);});
canvas.addEventListener('contextmenu',e=>{e.preventDefault();if(canAim()){const cell=pointerWorldCell(e);const pr=selectedPropAt(cell.x,cell.y);if(pr){targetCell=cell;selectedTile=null;}updateContext();doInteract(pr);}});
function pointerWorldCell(e){
 const rect=canvas.getBoundingClientRect();
 return screenCell((e.clientX-rect.left)*screen.w/rect.width,(e.clientY-rect.top)*screen.h/rect.height);
}
canvas.addEventListener('pointerdown',e=>{
 if(!canAim()||e.button!==0)return;
 const {x,y}=pointerWorldCell(e);if(!inWorld(x,y))return;
 clearAimSelection();
 const creature=chooseCreatureAt(x,y);
 if(creature){selectedEnemy=creature.id;targetCell=null;selectedTile=null;updateContext();return;}
 selectedEnemy=null;
 const tool=pickedItem();
 if(tool?.id==='pick'){
  const target=miningCandidateAt({x,y});
  if(miningTargetInReach(target,true))miningSelection={target,tool,level:layer};
 }
 const web=webAt(x,y);
 if(web){targetCell={x,y};selectedTile=null;updateContext();return;}
 const pr=selectedPropAt(x,y);
 if(pr){
  targetCell={x:Math.floor(pr.x),y:Math.floor(pr.y)};selectedTile=null;
  handSelection={cell:targetCell,id:pr.id,kind:pr.kind,built:structureAt(x,y),layer,player,error:handTargetError(pr)};
  // Solo seleccionar, incluso con el pico o una construcción equipada.
  updateContext();return;
 }
 if(tileAt(x,y)!==T.FLOOR){targetCell=null;selectedTile={x,y};updateContext();return;}
 if(floorAt(x,y)){
  targetCell={x,y};selectedTile=null;updateContext();return;
 }
 if(isBuildItem()){
  e.preventDefault();drawing={id:e.pointerId,start:{x,y},end:{x,y}};
  ghostCells=blueprintCells(drawing.start,drawing.end,pickedItem()?.id).slice(0,BLUEPRINT_MAX);
  try{canvas.setPointerCapture(e.pointerId);}catch{}
  targetCell=null;selectedTile=null;updateBlueprintUI();return;
 }
 targetCell=null;selectedTile=null;updateContext();
});
canvas.addEventListener('pointermove',e=>{
 if(!drawing||drawing.id!==e.pointerId)return;
 e.preventDefault();drawing.end=pointerWorldCell(e);
 ghostCells=blueprintCells(drawing.start,drawing.end,pickedItem()?.id).slice(0,BLUEPRINT_MAX);
});
function finishBlueprintPointer(e,commit){if(!drawing||drawing.id!==e.pointerId)return;
 if(commit){const {start,end}=drawing;addBlueprint(start,end);}else{ghostCells=[];}
 drawing=null;updateBlueprintUI();
}
canvas.addEventListener('pointerup',e=>finishBlueprintPointer(e,true));
canvas.addEventListener('pointercancel',e=>finishBlueprintPointer(e,false));
blueUI.root.querySelectorAll('[data-plan-mode]').forEach(btn=>btn.addEventListener('click',()=>{
 blueprintMode=btn.dataset.planMode;updateBlueprintUI();
}));
blueUI.confirm.addEventListener('click',confirmBlueprint);
blueUI.cancel.addEventListener('click',clearBlueprint);
$('blueprint-undo').addEventListener('click',undoBlueprint);
window.addEventListener('keydown',e=>{if(['Space','ArrowDown','ArrowUp','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();keys.add(e.code);
 if(e.repeat)return;if(e.code==='Enter'&&playing&&!paused&&blueprint.size){confirmBlueprint();return;}if(e.code==='Backspace'&&playing&&!paused&&blueprint.size){e.preventDefault();clearBlueprint();return;}if(e.code==='KeyF'&&playing&&!paused){doInteract();return;}if((e.code==='ShiftLeft'||e.code==='ShiftRight'||e.code==='KeyQ')&&playing&&!paused){dodge();return;}if((e.code==='KeyE'||e.code==='Space')&&playing&&!paused){actionHeld=true;resetMiningFocus();if(pickedItem()?.id==='sword')beginSwordCharge();else doAction(false);}if(e.code==='Escape'&&storyScene){storySkip39();return;}if(e.code==='Escape'&&bossBattle)return;if(e.code==='Escape'&&playing){if(modalType)closeModal();else showModal('pause');}if(e.code==='KeyM'&&playing&&!paused&&!modalType)showModal('map');if(e.code==='KeyI'&&playing&&!paused&&!modalType)showModal('bag');if(e.code==='KeyC'&&playing&&!paused&&!modalType)showModal('craft');if(/^Digit[1-8]$/.test(e.code)&&playing&&!modalType)chooseSlot(+e.code.slice(-1)-1);});
window.addEventListener('keyup',e=>{keys.delete(e.code);if(e.code==='KeyE'||e.code==='Space'){if(swordCharging)endSwordCharge();actionHeld=false;resetMiningFocus();}});
window.addEventListener('blur',()=>{keys.clear();resetJoy();actionTouchId=null;actionPointerId=null;actionHeld=false;cancelSwordCharge();resetMiningFocus();if(playing&&!paused){queueSave();showModal('pause');}});
$('pick-male').addEventListener('click',()=>setCharacter('male'));$('pick-female').addEventListener('click',()=>setCharacter('female'));
$('btn-play').addEventListener('click',async()=>{if(await readStored()){if(!confirm('¿Generar nuevo mundo Alpha '+RELEASE_VERSION+'? Reemplaza la expedición actual. Se recomienda hacer un respaldo antes. La Alpha 1 y la v1.6 no cambiarán.'))return;}newGame();});
$('btn-resume').addEventListener('click',async()=>{const s=await readStored();if(s)continueGame(s);else newGame();});
UI.hudToggle.addEventListener('click',()=>{
 const hudExpanded=!UI.hudToggle.matches('[aria-expanded="true"]');
 $('hud-details').classList.toggle('hidden',!hudExpanded);
 UI.hudToggle.setAttribute('aria-expanded',String(hudExpanded));
 UI.hudToggle.setAttribute('aria-label',hudExpanded?'Reducir información':'Mostrar más información');
 UI.hudToggle.textContent=hudExpanded?'⌃':'⌄';
});
$('btn-progression').addEventListener('click',()=>showModal('skills'));UI.mapBtn.addEventListener('click',()=>showModal('map'));$('btn-journal').addEventListener('click',()=>showModal('journal'));$('btn-pack').addEventListener('click',()=>showModal('bag'));$('btn-craft').addEventListener('click',()=>showModal('craft'));$('btn-pause').addEventListener('click',()=>showModal('pause'));$('modal-close').addEventListener('click',closeModal);
UI.modal.addEventListener('click',e=>{if(e.target===UI.modal)closeModal();});
$('import-file').addEventListener('change',async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;try{const data=normalizeSave(JSON.parse(await file.text()));if(!data)throw Error('Guardado inválido');if(!confirm('¿Reemplazar la partida Alpha 3.9.4.2 actual con este respaldo?'))return;const ok=await writeStored(data);if(!ok)throw Error('No se pudo almacenar');restore(data);startPlay();toast('Respaldo importado correctamente.');}catch(err){alert('No se pudo importar: '+err.message);}});
window.addEventListener('resize',resize);window.addEventListener('orientationchange',()=>setTimeout(resize,100));if(window.visualViewport){window.visualViewport.addEventListener('resize',resize);window.visualViewport.addEventListener('scroll',resize);}window.addEventListener('pagehide',()=>queueSave());document.addEventListener('visibilitychange',()=>{if(document.hidden)queueSave();});
async function init(){configureStory39();resize();seed=57813;screen.camX=START.x;screen.camY=START.y;db=await openDB();saveReady=true;const s=await readStored();$('btn-resume').classList.toggle('hidden',!s);requestAnimationFrame(tick);showReleaseNotesIfNew();
 if('serviceWorker'in navigator&&location.protocol==='https:')navigator.serviceWorker.register('./sw.js').catch(()=>{});
 window.__FRAGUA_ALPHA2_DEBUG__={worldLayout:()=>({version:worldLayoutVersion,layer,seed,perLayer:Array.from({length:8},(_,i)=>worldLayoutVersion?worldLayout(i):null),dungeon:worldLayoutVersion?worldLayout(1).dungeon:null}),depthStats,spawnProps:(l)=>propsFor(l).filter(p=>['stairsdown','stairsup','elevator','dungeonentrance','ruin','supplycache'].includes(p.kind)).map(p=>({id:p.id,x:p.x,y:p.y,to:p.to,spawn:p.spawn})),newGame,dungeonProps:()=>dungeonProps().map(p=>({id:p.id,kind:p.kind,x:p.x,y:p.y})),getProgression:()=>({...progression,skills:{...progression.skills}}),xp:(n)=>addExperience(n,'prueba'),learnSkill:(id)=>allocateSkill(id),openSkills:()=>showModal('skills'),smeltInterval:()=>effectiveSmeltMs(),releaseVersion:()=>RELEASE_VERSION,releaseHistory:()=>RELEASE_HISTORY.map(v=>v.version),isReleasePopupOpen:()=>!$('release-popup').classList.contains('hidden'),openReleaseHistory:()=>showModal('updates'),forgeStatus:()=>({pick:player.pick,pickName:pickTierName(),weaponTier:player.weaponTier,station:forgeStationReady(),pickCost:ingotUpgradeCost('pick'),swordCost:ingotUpgradeCost('sword')}),forgeUpgrade:(kind)=>upgradeEquipment(kind,'forge'),journalHTML:()=>journalPanel(),remainsNearby:()=>currentProps().filter(p=>p.kind==='mine_remains').map(p=>({id:p.id,x:p.x,y:p.y,mode:p.mode,searched:p.searched})),inspectRemains:(id)=>{const p=currentProps().find(q=>q.id===id);if(!p)return false;interactWithRemains(p);return story39.remainsSearched.includes(id.slice(8));},drawBattle39:()=>drawBattleFrame39(performance.now()),getStory39:()=>({...story39}),getBoss39:()=>bossBattle?{hp:bossBattle.hp,energy:bossBattle.energy,turn:bossBattle.turn,phase:bossBattle.phase,intent:bossBattle.intent,entangled:bossBattle.entangled}:null,dungeonTile:(x,y)=>dungeonTile(x,y),startWidow:()=>{openStory39('widow');return true;},beginBattle:()=>{startWidowBattle();return true;},battleAction:battleAction39,battleItems:()=>Object.fromEntries(['vendaje','tonico','pocionprecision'].map(k=>[k,quantity(k)])),openDungeonChest:(kind)=>{const prop=dungeonProps().find(p=>p.loot===kind);if(prop)openDungeonChest(prop);},getCombat:()=>({stamina,dodgeTime,dodgeCooldown,invulnerable:playerInvuln,swordCooldown,charging:swordCharging}),dodge,beginSwordCharge,endSwordCharge,attackCharged:()=>swordAttack(true),getMobs:()=>localEnemies().map(e=>({...e})),getWebs:()=>[...webs.values()].map(w=>({...w})),addMob:(kind,x,y)=>{const id=`debug:${layer}:${x}:${y}`;const spec=MOB_SPECS[kind];if(!spec)return null;enemies.set(id,{id,kind,layer,x,y,hp:spec.hp,maxHp:spec.hp,hit:0,attack:0,webClock:2,windup:0,stagger:0,dx:0,dy:1});return id;},attackMob:(id,damage=3)=>{const m=enemies.get(id);if(m)hurtCreature(m,damage);return enemies.has(id);},addWeb:(x,y)=>{if(!canWebAt(x,y))return false;webs.set(webKey(x,y),{x,y,layer,hp:2,owner:'debug'});return true;},slashWeb:(x,y)=>strikeWeb(webAt(x,y),'sword'),spawnMobs:()=>creatureSpawnCheck(),dismantleStatus:()=>[...dismantleDamage],strikeBuilt:(x,y)=>{const p=structureAt(x,y);if(p){mineBuiltStructure(p);return structures.has(p.id);}if(floorAt(x,y)){mineBuiltFloor(x,y);return !!floorAt(x,y);}return null;},illuminated:(x,y)=>{refreshStaticLighting();return staticLights.get(Math.floor(x)+','+Math.floor(y))||0;},visible:(x,y)=>vis.has(Math.floor(x)+','+Math.floor(y)),lightCount:()=>{refreshStaticLighting();return lightSources.length;},getState:()=>({playing,paused,layer,seed,position:{x:player.x,y:player.y},gender:player.gender,pick:player.pick,stats:{...stats},ore:{...ores},chunks:chunkCache.size,modified:[...mined.entries()].length,inventory:inventory.map(it=>it?{...it}:null),structures:structures.size,blueprint:blueprint.size,floors:floorTiles.size,base:mainBase,hp,explored:[...fog.keys()].length,visited:[...visitedLevels]}),tile:(l,x,y)=>tileAt(x,y,l),seen:(l,x,y)=>fogAt(x,y,l),teleport:(l,x,y)=>{layer=l;player.x=x;player.y=y;screen.camX=x;screen.camY=y;selectedTile=null;reveal();updateHud()},setTile:(l,x,y,t)=>setTile(x,y,t,l),action:()=>doAction(false),grant:(id,n)=>{const rem=storeIn(inventory,id,n);refreshHotbar();return rem;},toScreen:(x,y)=>worldToScreen(x,y),getBlueprint:()=>[...blueprint.values()],snap:()=>snapshot(),load:(s)=>restore(s),draft:(id,a,b,mode)=>{let j=inventory.findIndex(it=>it?.id===id);if(j<0){storeIn(inventory,id,99);j=inventory.findIndex(it=>it?.id===id);}if(j<8)chooseSlot(j);else{[inventory[7],inventory[j]]=[inventory[j],inventory[7]];chooseSlot(7);}blueprintMode=mode||'line';addBlueprint(a,b);return draftSummary();},confirm:()=>confirmBlueprint(),cancel:()=>clearBlueprint(),undo:()=>undoBlueprint(),placeAt:(x,y,id)=>{if(id){let i=inventory.findIndex(it=>it?.id===id);if(i<0){storeIn(inventory,id,99);i=inventory.findIndex(it=>it?.id===id);}if(i>7){[inventory[7],inventory[i]]=[inventory[i],inventory[7]];i=7;}chooseSlot(i);}addBlueprint({x,y});return draftSummary();},select:(x,y)=>{selectedTile={x,y};updateContext()},go:(to)=>changeLevel({to,spawn:ENTRY}),save:()=>queueSave(),reload:readStored};
}
init();
})();
