/** CUE PASS — Matchday Vision. Original game by Cornelius Aurelius. */
export const GAME_LENGTH = 24;
export const MODES = ['matchday','blitz','practice'];
export const POSITIONS = {
 LB:{name:'Left Back',x:21,y:78,options:[['LM',22,43],['LCM',47,49],['LCB',52,74]]},
 RB:{name:'Right Back',x:79,y:78,options:[['RM',78,43],['RCM',53,49],['RCB',48,74]]},
 LCB:{name:'Left Centre-Back',x:36,y:78,options:[['LB',16,56],['CDM',52,49],['RCB',68,74]]},
 RCB:{name:'Right Centre-Back',x:64,y:78,options:[['RB',84,56],['CDM',48,49],['LCB',32,74]]},
 CDM:{name:'Defensive Midfielder',x:50,y:70,options:[['LCM',24,48],['CAM',50,37],['RCM',76,48]]},
 LCM:{name:'Left Central Midfielder',x:36,y:65,options:[['LM',16,42],['CAM',50,33],['ST',78,29]]},
 RCM:{name:'Right Central Midfielder',x:64,y:65,options:[['RM',84,42],['CAM',50,33],['ST',22,29]]},
 LM:{name:'Left Midfielder',x:20,y:62,options:[['LB',18,78],['ST',53,27],['LW',17,27]]},
 RM:{name:'Right Midfielder',x:80,y:62,options:[['RB',82,78],['ST',47,27],['RW',83,27]]},
 LW:{name:'Left Winger',x:19,y:36,options:[['ST',50,23],['CAM',52,53],['LM',18,73]]},
 RW:{name:'Right Winger',x:81,y:36,options:[['ST',50,23],['CAM',48,53],['RM',82,73]]},
 ST:{name:'Striker',x:50,y:34,options:[['LW',19,52],['CAM',50,65],['RW',81,52]]}
};
export const KITS = {
 midnight:{name:'Midnight Derby',home:'#18d7ac',away:'#ffac62',pitch:'#062b29'},
 classic:{name:'Classic Matchday',home:'#60a5fa',away:'#f9d76c',pitch:'#17472e'},
 vivid:{name:'High Contrast',home:'#fafafa',away:'#242a40',pitch:'#102d42'}
};
export const SHIRT_PATTERNS=['STRIPES','HOOPS','SASH','CHECK'];
export const BOOT_MARKS=['DOTS','STRIPES','SOLID'];
export const BANDS=['LEFT','RIGHT','NONE'];
export const CUES=['number','position','pattern','number','boots','dual','band','position','pattern','dual','number','boots','position','dual','band','pattern','boots','dual','position','number','dual','band','boots','dual'];
export function rng(seed){let t=(seed>>>0)+0x6D2B79F5;return ()=>{t+=0x6D2B79F5;let x=t;x=Math.imul(x^(x>>>15),x|1);x^=x+Math.imul(x^(x>>>7),x|61);return ((x^(x>>>14))>>>0)/4294967296;};}
function pick(list,random){return list[Math.floor(random()*list.length)];}
function choicesOf(list,target,offset=1){const i=list.indexOf(target);return [list[(i+offset)%list.length],list[(i+offset+1)%list.length]];}
export function createPuzzle(stage,position='CDM',kit='midnight',seed=72){
 if(!Number.isInteger(stage)||stage<1||!POSITIONS[position]||!KITS[kit])throw Error('Invalid puzzle request');
 const i=(stage-1)%GAME_LENGTH,random=rng(((stage*9187)^(seed*6271)^(position.charCodeAt(0)*283))>>>0);
 const cue=CUES[i],slots=POSITIONS[position].options;
 const targetIndex=(stage*7+seed)%3;
 const targetNumber=pick([4,5,7,8,9,10,11,12,14,16,18],random);
 const pattern=pick(SHIRT_PATTERNS,random),boots=pick(BOOT_MARKS,random),band=pick(BANDS,random);
 const othersNum=[targetNumber+1,targetNumber+2].map(n=>n>20?n-15:n);
 const otherPats=choicesOf(SHIRT_PATTERNS,pattern);
 const otherBoots=choicesOf(BOOT_MARKS,boots);
 const otherBands=choicesOf(BANDS,band);
 const remaining=[0,1,2].filter(k=>k!==targetIndex);
 const players=slots.map(([role,x,y],k)=>({id:`player-${k}`,role,x,y,
  number:k===targetIndex?targetNumber:othersNum[remaining.indexOf(k)],
  pattern:k===targetIndex?pattern:otherPats[remaining.indexOf(k)],
  boots:k===targetIndex?boots:otherBoots[remaining.indexOf(k)],
  band:k===targetIndex?band:otherBands[remaining.indexOf(k)]
 }));
 // Later puzzles deliberately have conflicting single cues: one decoy shares the target's number,
 // another shares the target's shirt pattern. Only their combination identifies the receiver.
 if(cue==='dual'){
  players[remaining[0]].number=targetNumber;
  players[remaining[1]].pattern=pattern;
 }
 const target=players[targetIndex];
 const instructions={
  number:`Pass to NUMBER ${target.number}.`,
  position:`Pass to the ${target.role}.`,
  pattern:`Pass to the player with the ${target.pattern.toLowerCase()} shirt.`,
  boots:`Pass to the player with ${target.boots.toLowerCase()} boots.`,
  band:target.band==='NONE'?'Pass to the player with NO armband.':`Pass to the player with the armband on the ${target.band.toLowerCase()} arm.`,
  dual:`Pass to NUMBER ${target.number} wearing a ${target.pattern.toLowerCase()} shirt.`
 };
 const explanation={
  number:`The correct receiver wears shirt number ${target.number}. Numbers are more reliable than colour alone.`,
  position:`The correct passing lane leads to the ${target.role}. Position labels stay useful even when kits look similar.`,
  pattern:`Look for the ${target.pattern.toLowerCase()} shirt design. Shape and pattern help identify a teammate.`,
  boots:`The receiver wears ${target.boots.toLowerCase()} boots. Equipment details offer extra non-colour cues.`,
  band:target.band==='NONE'?'Look for the player without an armband.':'Look for the armband on the '+target.band.toLowerCase()+' arm.',
  dual:`Two clues together matter: NUMBER ${target.number} and the ${target.pattern.toLowerCase()} shirt. Each decoy matches only one clue.`
 };
 const matches=p=>cue==='number'?p.number===target.number:cue==='position'?p.role===target.role:cue==='pattern'?p.pattern===target.pattern:cue==='boots'?p.boots===target.boots:cue==='band'?p.band===target.band:p.number===target.number&&p.pattern===target.pattern;
 if(players.filter(matches).length!==1||!matches(target))throw Error('Ambiguous puzzle');
 return {stage,cue,chapter:Math.min(4,Math.ceil(((i+1)/6))),players,targetIndex,target,position,kit,instruction:instructions[cue],explanation:explanation[cue],seconds:i<6?18:i<12?16:i<18?14:12,answer:`player-${targetIndex}`};
}
export function startGame(mode='matchday',position='CDM',kit='midnight'){
 if(!MODES.includes(mode)||!POSITIONS[position]||!KITS[kit])throw Error('Invalid game setup');
 return {mode,position,kit,stage:1,score:0,streak:0,lives:mode==='practice'?Infinity:3,correct:0,mistakes:0,hints:0,phase:'question',hinted:false,last:null,completed:false,blitzRemaining:mode==='blitz'?75:null};
}
export function useHint(state){if(state.phase!=='question'||state.hinted)return state;return {...state,hints:state.hints+1,hinted:true};}
export function answerQuestion(state,puzzle,choice,{remaining=0}={}){
 if(state.phase!=='question'||puzzle.stage!==state.stage||!puzzle.players.some(p=>p.id===choice)&&choice!=='TIMEOUT')throw Error('Invalid answer');
 const correct=choice===puzzle.answer,streak=correct?state.streak+1:0;
 const earned=correct&&state.mode!=='practice'?Math.max(20,100+Math.min(120,state.streak*20)+Math.floor(Math.max(0,remaining)*4)-(state.hinted?35:0)):0;
 const lives=correct?state.lives:state.mode==='practice'?Infinity:Math.max(0,state.lives-1);
 return {...state,score:state.score+earned,streak,lives,correct:state.correct+(correct?1:0),mistakes:state.mistakes+(correct?0:1),phase:lives===0?'finished':'feedback',last:{correct,choice,earned}};
}
export function advance(state){if(state.phase!=='feedback')throw Error('Cannot advance');if(state.mode==='matchday'&&state.stage===GAME_LENGTH)return {...state,phase:'finished',completed:true};return {...state,stage:state.stage+1,phase:'question',hinted:false,last:null};}
export function expireBlitz(state){if(state.mode!=='blitz'||state.phase==='finished')return state;return {...state,blitzRemaining:0,phase:'finished',completed:true};}
export function rank(state){if(state.mode==='practice')return 'TRAINING COMPLETE';if(state.correct>=GAME_LENGTH&&state.mistakes===0&&state.hints===0)return 'PLATINUM PLAYMAKER';if(state.correct>=18)return 'GOLD PLAYMAKER';if(state.correct>=12)return 'SILVER PLAYMAKER';return 'RISING PLAYMAKER';}