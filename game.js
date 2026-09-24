'use strict';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const fmt=n=>Math.floor(Number(n)||0).toLocaleString();
const now=()=>Date.now();
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-5);
const esc=s=>String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const hash=s=>[...String(s)].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,2166136261);
const timeText=ms=>{ms=Math.max(0,ms);const s=Math.ceil(ms/1000);if(s<60)return `${s}s`;const m=Math.floor(s/60),rs=s%60;if(m<60)return `${m}m ${rs}s`;const h=Math.floor(m/60),rm=m%60;return `${h}h ${rm}m`};
const haptic=ms=>{try{navigator.vibrate?.(ms)}catch{}};

const RARITIES={
  Common:{mult:1,wait:1,coin:1,storage:1,cls:'common'},
  Rare:{mult:1.7,wait:1.22,coin:1.7,storage:1.25,cls:'rare'},
  Epic:{mult:2.8,wait:1.5,coin:2.8,storage:1.55,cls:'epic'},
  Legendary:{mult:4.5,wait:1.8,coin:4.5,storage:2,cls:'legendary'}
};
const rarityOrder=['Common','Rare','Epic','Legendary'];
const TRACKS=['DRUM','PERC','BASS','CHORD','LEAD','VOICE','FX','TITAN'];
const TRACK_NAMES={DRUM:'Drum Bed',PERC:'Percussion',BASS:'Bassline',CHORD:'Harmony Chords',LEAD:'Melody',VOICE:'Vocal Track',FX:'World FX',TITAN:'Titan Layer'};

const islands=[
  {id:'verdant',name:'Verdant Isle',unlock:0,accent:'#65c879',sky:['#6fc8f5','#c3edff'],ground:['#79be55','#3d7f44'],desc:'A living meadow orchestra of wood, leaves, crystal, and frost.',bpm:104,root:196,phrase:'Shake the canopy!',fx:'rustle'},
  {id:'ember',name:'Ember Crag',unlock:4800,accent:'#ec714d',sky:['#4f3959','#d16f57'],ground:['#754038','#332329'],desc:'A volcanic stage where brass, fire, metal, and smoke lock together.',bpm:116,root:146.83,phrase:'Light the fire!',fx:'fire'},
  {id:'tidal',name:'Tidal Key',unlock:16000,accent:'#43c1d4',sky:['#78d9f0','#d5fbff'],ground:['#3facc5','#1d6d87'],desc:'A reef of shell drums, liquid bass, and wave-swept voices.',bpm:98,root:174.61,phrase:'Roll with the tide!',fx:'wave'},
  {id:'astral',name:'Astral Atoll',unlock:52000,accent:'#9a7fe4',sky:['#211b52','#5b4c9f'],ground:['#4f3e80','#211c4a'],desc:'Dream synths, orbital bells, and a choir hanging in starlight.',bpm:110,root:220,phrase:'Turn the stars!',fx:'space'},
  {id:'tempest',name:'Tempest Mesa',unlock:130000,accent:'#7bcce9',sky:['#293b57','#8aa8bc'],ground:['#657b64','#2f4f45'],desc:'Thunder percussion, wind choirs, electric leads, and storm bass.',bpm:122,root:164.81,phrase:'Bring the thunder!',fx:'storm'},
  {id:'fungal',name:'Fungal Hollow',unlock:280000,accent:'#9ddc77',sky:['#253b3a','#56725a'],ground:['#4e563e','#232c2c'],desc:'A glowing cavern band of spores, caps, hollow wood, and deep hums.',bpm:92,root:130.81,phrase:'Glow from below!',fx:'spore'},
  {id:'glacial',name:'Glacial Reach',unlock:600000,accent:'#a9e8ff',sky:['#6aa7ce','#dff8ff'],ground:['#8fd1e5','#376f91'],desc:'Ice bells, snow percussion, aurora voices, and glacier-shaking lows.',bpm:106,root:185,phrase:'Crack the ice!',fx:'ice'}
];
const islandById=Object.fromEntries(islands.map(i=>[i.id,i]));

const monsterRows=[
// id, name, island, elements, track, design, colors, base, breed, income, bio
['mossmara','Mossmara','verdant',['Leaf'],'LEAD','sprout',['#77d86c','#2f7448'],45,18,6,'Plucks elastic vine-strings stretched between its leaf-fins.'],
['twiggle','Twiggle','verdant',['Wood'],'PERC','woodling',['#c88f58','#67412f'],90,40,9,'Snaps branch-knuckles and taps its hollow chest like a wood block.'],
['chimecub','Chimecub','verdant',['Crystal'],'CHORD','crystal',['#9be9ef','#4d79aa'],170,75,14,'Tilts its crystal ears into three-note glass chords.'],
['sleetbeat','Sleetbeat','verdant',['Frost'],'PERC','ice',['#d8f7ff','#6f9ccd'],260,110,18,'Clicks frozen plates together for crisp hi-hats.'],
['hummbud','Hummbud','verdant',['Leaf','Air'],'VOICE','flower',['#ffe67d','#65ad67'],430,160,26,'Opens its petal throat and sings warm vowel swells.'],
['barkitone','Barkitone','verdant',['Wood','Leaf'],'BASS','tree',['#9b714a','#3f724c'],720,240,36,'Flexes root-strings across its trunk for woody bass notes.'],
['glimfinch','Glimfinch','verdant',['Crystal','Air'],'LEAD','bird',['#ffd27d','#dc766e'],1100,360,48,'A bright finch-creature whose beak whistles glassy runs.'],
['drumplet','Drumplet','verdant',['Wood','Frost'],'DRUM','drummer',['#d59665','#835660'],1700,520,65,'Its belly is a taut natural drum struck by padded arms.'],
['choraloe','Choraloe','verdant',['Leaf','Crystal','Frost'],'VOICE','singer',['#86e0af','#5c78b5'],2600,720,88,'Three petal-mouths trade harmonies across the chorus.'],
['grovegrand','Grovegrand','verdant',['Leaf','Wood','Crystal','Frost'],'DRUM','deer',['#b8cf6b','#405f45'],4300,980,120,'A full woodland deer-beast: forelegs stomp, antlers knock rhythms, and its leaf mane rustles in time.'],
['whistlefern','Whistlefern','verdant',['Leaf','Air','Crystal'],'FX','fernbeast',['#77dc98','#376f67'],5900,1180,155,'Fans six fern fronds like organ pipes and exhales airy whistles between chords.'],
['rootcore','Rootcore Prime','verdant',['Leaf','Wood','Crystal','Frost'],'TITAN','primeRoot',['#80df6e','#244b41'],9000,1700,260,'A colossal root-and-crystal titan with a living subwoofer heart.','major'],

['cinderpip','Cinderpip','ember',['Flame'],'PERC','flame',['#ffba4d','#d14a34'],600,65,18,'Snaps ember fingers into syncopated spark pops.'],
['clankit','Clankit','ember',['Metal'],'PERC','machine',['#bec8d2','#57616a'],900,100,24,'A four-legged scrap creature that strikes its own armor plates.'],
['coaloon','Coaloon','ember',['Smoke'],'FX','cloud',['#85858f','#393740'],1300,150,30,'Compresses and vents smoke through side pipes for breathy sweeps.'],
['brassaur','Brassaur','ember',['Brass'],'CHORD','hornbeast',['#efc54e','#955f37'],1900,220,40,'A plated reptile with horn-bells growing from its shoulders.'],
['furnibble','Furnibble','ember',['Flame','Metal'],'DRUM','machine',['#ee6a42','#655e68'],2900,330,54,'Its furnace heart slams a mechanical kick on each downbeat.'],
['smolderoo','Smolderoo','ember',['Flame','Smoke'],'DRUM','hopper',['#e97c54','#593c49'],4300,460,72,'Bounces on a coal-black tail and lands with smoky tom hits.'],
['gongoyle','Gongoyle','ember',['Metal','Brass'],'CHORD','gargoyle',['#ae9877','#5e5960'],6300,620,95,'A stone-metal gargoyle whose ribcage is a suspended gong.'],
['flarehorn','Flarehorn','ember',['Flame','Brass'],'LEAD','hornbeast',['#ffb844','#a33a2f'],9000,800,125,'Throws its ember horns forward to fire blazing lead notes.'],
['kilnchoir','Kilnchoir','ember',['Smoke','Metal','Brass'],'VOICE','singer',['#a96b5d','#4d4a5b'],12500,1100,165,'Three chimney necks sing different pitches through hot metal throats.'],
['magmammoth','Magmammoth','ember',['Flame','Smoke','Metal','Brass'],'BASS','mammoth',['#ed6445','#6c3036'],18000,1450,225,'A lava-veined mammoth that stomps sub-bass through the crater floor.'],
['ashclapper','Ashclapper','ember',['Flame','Smoke','Metal'],'FX','ashbeast',['#dc8a67','#3f3a40'],22000,1580,280,'Claps slab-like forearms, blasting a ring of sparks and ash on the backbeat.'],
['forgepulse','Forgepulse Prime','ember',['Flame','Smoke','Metal','Brass'],'TITAN','primeForge',['#ff9b3e','#4c3240'],26000,1700,340,'A furnace titan with piston drums, forge-bells, and a roaring brass reactor.','major'],

['bubblip','Bubblip','tidal',['Bubble'],'PERC','bubble',['#a8f3f5','#4aa9c7'],1700,90,25,'Puffs tuned bubbles from four cheek vents and pops them with its fins.'],
['shellsnap','Shellsnap','tidal',['Shell'],'PERC','crab',['#f3c8a2','#b27183'],2400,130,32,'Clicks hinged shell claws like castanets.'],
['kelpkey','Kelpkey','tidal',['Kelp'],'CHORD','kelp',['#5bd4a2','#25776e'],3300,190,41,'Presses floating kelp pads with webbed fingers like a keyboard.'],
['coraltoot','Coraltoot','tidal',['Coral'],'LEAD','coral',['#ff8b99','#a75688'],4500,270,52,'A reef creature with coral pipes along its back.'],
['wavewhump','Wavewhump','tidal',['Bubble','Shell'],'BASS','whale',['#77cfe8','#386ca4'],6400,390,68,'Draws in water, arches its back, and releases a round bass pulse.'],
['marimoss','Marimoss','tidal',['Kelp','Shell'],'CHORD','turtle',['#77bc89','#507067'],8800,540,88,'Taps tuned shell plates with flexible kelp mallets.'],
['reefrattle','Reefrattle','tidal',['Coral','Shell'],'DRUM','crab',['#f6816f','#704a72'],12000,730,114,'Scuttles in time while coral beads rattle inside its claws.'],
['tidevox','Tidevox','tidal',['Bubble','Kelp','Coral'],'VOICE','octopus',['#8c72d2','#4f93b5'],16500,940,148,'Eight arms open resonant siphons into a watery choir.'],
['moonray','Moonray','tidal',['Bubble','Coral'],'FX','ray',['#a5e9f6','#6266a8'],22000,1200,190,'Sweeps its fins across the air, leaving shimmering wave-chords behind.'],
['leviathrum','Leviathrum','tidal',['Bubble','Shell','Kelp','Coral'],'BASS','dragon',['#3d9db5','#284d72'],31000,1550,255,'A sea-dragon whose chest cavity acts like an enormous water drum.'],
['pearlspout','Pearlspout','tidal',['Bubble','Shell','Coral'],'LEAD','seahorn',['#d9f1ef','#5e9fc1'],36000,1620,315,'Launches pearl-shaped notes through a curled shell horn.'],
['tideengine','Tideengine Prime','tidal',['Bubble','Shell','Kelp','Coral'],'TITAN','primeTide',['#56e2e6','#263e70'],42000,1700,430,'A reef titan that pumps waves through shell turbines and abyssal bass chambers.','major'],

['starbleep','Starbleep','astral',['Star'],'PERC','starling',['#ffe67e','#a06ad1'],5200,120,38,'Taps tiny orbiting stars into bright electronic blips.'],
['orbitot','Orbitot','astral',['Orbit'],'PERC','orbiter',['#a08cf1','#5864a7'],7200,180,48,'Spins a moon around its body and lets each pass strike a pulse.'],
['dreamlet','Dreamlet','astral',['Dream'],'VOICE','dreamer',['#bda6ff','#6a5da1'],9800,260,61,'Sings sleepy vowels while its floating ears sway behind the beat.'],
['prismite','Prismite','astral',['Light'],'CHORD','prism',['#91efff','#ca8cf7'],13200,360,78,'Bends one note through a crystal crest into a three-tone chord.'],
['nebubass','Nebubass','astral',['Star','Dream'],'BASS','nebula',['#7077cc','#39396b'],18000,500,101,'Inflates a nebula belly that vibrates at deep sub frequencies.'],
['ringding','Ringding','astral',['Orbit','Light'],'CHORD','orbiter',['#5ed5df','#6265c6'],24000,680,130,'Its two orbital rings chime whenever they cross.'],
['lucidrum','Lucidrum','astral',['Dream','Light'],'DRUM','drummer',['#c89aef','#6684d4'],32000,870,168,'Dreamglass pads on its arms produce soft kicks and snaps.'],
['cometcall','Cometcall','astral',['Star','Orbit','Light'],'LEAD','comet',['#ffb474','#896cd8'],43000,1100,215,'Flares its comet tail into a sharp synth lead.'],
['voidvowel','Voidvowel','astral',['Star','Dream','Orbit'],'VOICE','void',['#6a6190','#24233a'],57000,1350,275,'Opens a dark resonant throat and sings a low, impossible vowel.'],
['cosmocrown','Cosmocrown','astral',['Star','Orbit','Dream','Light'],'FX','crownbeast',['#dfa7fc','#4c5aaf'],76000,1600,360,'Raises a floating crown of lenses that scatter sparkling effects across the bar.'],
['pulsarune','Pulsarune','astral',['Star','Light','Dream'],'LEAD','rune',['#a6e9ff','#7b67d9'],85000,1640,430,'Rotates glowing rune plates to fire precise pulses across the melody.'],
['zenitharray','Zenith Array Prime','astral',['Star','Orbit','Dream','Light'],'TITAN','primeAstral',['#d09cff','#30366e'],98000,1700,560,'A celestial titan combining bass, choir, bells, and a rotating synth array.','major'],

['gustbit','Gustbit','tempest',['Wind'],'PERC','windling',['#a7dce8','#4b6f85'],38000,180,75,'Snaps sail-like ears into tiny gust claps.'],
['rumblehoof','Rumblehoof','tempest',['Thunder'],'DRUM','stormhoof',['#7b8e9d','#333c4c'],47000,280,95,'Drives thunder into the mesa by stamping plated hooves.'],
['voltwing','Voltwing','tempest',['Electric'],'LEAD','stormbird',['#d8f26b','#4676a3'],56000,390,118,'A lightning bird whose wing strokes arc into sharp lead notes.'],
['rainchant','Rainchant','tempest',['Rain'],'VOICE','rainbeast',['#80cbe7','#536d8c'],69000,520,145,'Sings through hollow throat sacs while rain ticks on its crest.'],
['stormsnare','Stormsnare','tempest',['Wind','Thunder'],'DRUM','drummer',['#8ec0c8','#4b5767'],82000,690,180,'A rope-muscled beast that snaps cloud-skin snares on the backbeat.'],
['cloudhorn','Cloudhorn','tempest',['Wind','Rain'],'CHORD','hornbeast',['#c7dce0','#5a7585'],99000,880,220,'Blows wide fog chords through spiral storm horns.'],
['cyclobass','Cyclobass','tempest',['Wind','Electric','Thunder'],'BASS','cyclone',['#6b8fb3','#29384f'],120000,1120,280,'Spins a low-pressure chamber in its torso for rolling sub-bass.'],
['skyrattle','Skyrattle','tempest',['Rain','Electric'],'FX','stormcrab',['#89bfce','#4e5c76'],145000,1390,345,'Charges rain-beads between its claws and releases crackling fills.'],
['skybreaker','Skybreaker Prime','tempest',['Wind','Thunder','Electric','Rain'],'TITAN','primeStorm',['#9cdcf1','#344b68'],180000,1700,680,'A thunderhead titan with lightning strings and a storm-drum core.','major'],

['sporepop','Sporepop','fungal',['Spore'],'PERC','mushroom',['#b9d876','#5d6b42'],80000,200,95,'Puffs tiny spore capsules that pop on sixteenth notes.'],
['capclack','Capclack','fungal',['Cap'],'PERC','mushroom',['#db8c80','#624c4c'],97000,310,118,'Clacks hard cap plates over its head like temple blocks.'],
['glowgill','Glowgill','fungal',['Glow'],'CHORD','mushroom',['#7be5bd','#3f7365'],116000,450,145,'Opens luminous gills under its cap into soft glassy chords.'],
['mycoboom','Mycoboom','fungal',['Root'],'DRUM','fungalroot',['#b7aa75','#564d39'],138000,610,180,'Tenses thick mycelium roots and releases a hollow boom.'],
['pufflute','Pufflute','fungal',['Spore','Glow'],'LEAD','fungalflute',['#adcf8f','#4f7d62'],165000,800,222,'Pushes air through long fungal tubes to play a breathy melody.'],
['moldrum','Moldrum','fungal',['Cap','Root'],'BASS','fungalbeast',['#8faa69','#414936'],195000,1010,275,'A squat cave beast whose giant cap resonates like a bass drum.'],
['lanterncap','Lanterncap','fungal',['Glow','Cap'],'FX','mushroom',['#f2d46e','#6b5b4a'],230000,1280,335,'Flashes bioluminescent spots that trigger glittering cave echoes.'],
['hyphahum','Hyphahum','fungal',['Spore','Root','Glow'],'VOICE','fungalsinger',['#98d98c','#466a55'],270000,1510,410,'Braids three hyphae throats into a deep humming chord.'],
['mycelium','Mycelium Prime','fungal',['Spore','Cap','Glow','Root'],'TITAN','primeFungal',['#c5e67e','#334837'],330000,1700,800,'A cave-wide fungal titan whose mycelium network turns the entire island into an instrument.','major'],

['icetick','Icetick','glacial',['Ice'],'PERC','ice',['#e8fbff','#79a8c5'],150000,220,120,'Taps needle-thin ice limbs against its crystal shell.'],
['snowhorn','Snowhorn','glacial',['Snow'],'CHORD','hornbeast',['#f7ffff','#83a9bd'],180000,340,150,'Exhales frozen chords through curled snow horns.'],
['crystap','Crystap','glacial',['Crystal'],'PERC','crystal',['#c7f4ff','#6d8ed1'],215000,490,188,'Bends crystal fingers together for glassy taps.'],
['frostvox','Frostvox','glacial',['Frost'],'VOICE','iceSinger',['#d9efff','#708fc0'],255000,660,232,'A mask-faced ice singer whose breath forms visible harmonic rings.'],
['haildrum','Haildrum','glacial',['Ice','Snow'],'DRUM','drummer',['#bde5f4','#5f86a4'],305000,850,286,'Catches hailstones in shoulder drums and fires them back in rhythm.'],
['glacierbass','Glacierbass','glacial',['Ice','Crystal'],'BASS','icebeast',['#9ed6ee','#416b8a'],360000,1070,350,'Slides a massive frozen chest plate to create glacier-deep bass.'],
['aurorae','Aurorae','glacial',['Snow','Frost','Crystal'],'FX','aurora',['#b5ffe8','#768be5'],425000,1320,425,'Trails ribbons of aurora light that shimmer into airy effects.'],
['rimecall','Rimecall','glacial',['Ice','Snow','Frost'],'LEAD','icebird',['#e9f8ff','#7696b5'],500000,1550,510,'A long-winged ice bird whose call rings like a frozen flute.'],
['boreal','Boreal Prime','glacial',['Ice','Snow','Frost','Crystal'],'TITAN','primeIce',['#d9fbff','#4c78a1'],620000,1700,980,'A glacier titan with cathedral-like ice pipes and a core that pulses beneath the snow.','major']
];

const halloweenRows=[
['pumpkinge','Pumpkinge','verdant','VOICE','pumpkin',['#ef9d45','#4f7143'],220,'A vine-legged lantern singer with a carved wooden jaw.'],
['webwhistle','Webwhistle','verdant','LEAD','spider',['#b9c1bf','#574b63'],360,'A long-legged web spinner that plucks silk strings into eerie whistles.'],
['gravegrove','Gravegrove','verdant','DRUM','graveTree',['#8aa36b','#3f4b44'],520,'A crooked stump creature that pounds root-bones into the soil.'],
['cindercandle','Cindercandle','ember','LEAD','candle',['#ffc95f','#6d3e49'],220,'A waxy fire-creature that bends its flame into singing notes.'],
['bonebellows','Bonebellows','ember','CHORD','boneHorn',['#e5dccb','#684b46'],360,'A skeletal furnace beast whose ribs act like brass bellows.'],
['witchkiln','Witchkiln','ember','VOICE','witchMachine',['#aa7bc4','#3f3c49'],520,'A crooked kiln creature that cackles tuned smoke through its chimney hat.'],
['lanternfin','Lanternfin','tidal','LEAD','ghostFish',['#f4ae5c','#47798d'],220,'A lantern-jawed fish that glides above the reef and sings through glowing gills.'],
['ghostgill','Ghostgill','tidal','VOICE','ghostOcto',['#bfe7e6','#6c67a5'],360,'A translucent cephalopod choir that fades between phrases.'],
['krakenkin','Krakenkin','tidal','DRUM','kraken',['#8b70a9','#354f67'],520,'A baby kraken that slaps eight tentacles into a giant rolling fill.'],
['moonmask','Moonmask','astral','VOICE','mask',['#e2dcff','#625487'],220,'A floating moon-mask whose mouth becomes a glowing vowel gate.'],
['cometgeist','Cometgeist','astral','LEAD','ghostComet',['#bce8ff','#705d9b'],360,'A ghostly comet creature that shrieks bright synth streaks.'],
['starcrypt','Starcrypt','astral','CHORD','crypt',['#9e8dc0','#302e52'],520,'A walking stone observatory that rings haunted star chords.'],
['thunderbat','Thunderbat','tempest','LEAD','bat',['#b8d4e7','#4b4c66'],220,'A storm bat that snaps charged wings into squealing electric leads.'],
['gloombolt','Gloombolt','tempest','FX','stormGhost',['#8eb5c9','#443d5e'],360,'A cloud ghost that releases purple lightning only on the fills.'],
['stormreaper','Stormreaper','tempest','DRUM','reaper',['#9aaeb5','#30353f'],520,'A hooded wind creature that scythes the air into thunderous drum hits.'],
['jackocap','Jackocap','fungal','VOICE','pumpkinMush',['#ec9b4a','#536344'],220,'A pumpkin-capped fungus whose glowing mouth hums from inside the stem.'],
['sporegeist','Sporegeist','fungal','FX','ghostMush',['#bde0b6','#5c6d67'],360,'A floating mushroom ghost that bursts into clouds of sparkling spores.'],
['casketcap','Casketcap','fungal','BASS','coffinMush',['#8b6e5b','#333534'],520,'A coffin-backed cave beast that thumps deep notes with its lid.'],
['frostfang','Frostfang','glacial','LEAD','iceWolf',['#d6f5ff','#6d87a0'],220,'An ice-wolf monster whose fangs whistle when cold air rushes through them.'],
['snowgeist','Snowgeist','glacial','VOICE','snowGhost',['#f5ffff','#8297b3'],360,'A drifting snow spirit that sings through a hollow face.'],
['icicleimp','Icicle Imp','glacial','PERC','iceImp',['#bcecff','#5f7496'],520,'A tiny frozen troublemaker that clicks hanging icicles like chimes.']
];

function monsterFromRow(r){const [id,name,island,elements,track,design,colors,base,breed,income,bio,flag]=r;return{id,name,island,elements,track,design,colors,base,breed,income,bio,major:flag==='major',seasonal:false,eventCost:0}}
const bonusRows=[
 ['canopulse','Canopulse','verdant',['Leaf','Wood','Air'],'CHORD','canopy',['#8edb6e','#355c43'],7600,1320,190,'A broad-canopied four-legger that flexes ribbed leaves into warm suspended chords.'],
 ['sootsax','Sootsax','ember',['Smoke','Brass','Flame'],'LEAD','sootsax',['#d2875f','#493b46'],30000,1640,350,'A soot-coated salamander whose curling brass throat fires smoky lead phrases.'],
 ['anemonote','Anemonote','tidal',['Kelp','Coral','Bubble'],'VOICE','anemone',['#ff91b7','#3d8f9e'],47000,1650,390,'A reef crawler whose anemone crown opens into six synchronized singing mouths.'],
 ['meteorythm','Meteorythm','astral',['Star','Orbit','Light'],'DRUM','meteor',['#ffbd70','#5657a1'],112000,1660,520,'A crater-backed orbital beast that drops tiny meteors onto tuned stone plates.'],
 ['pressurehorn','Pressurehorn','tempest',['Wind','Rain','Thunder'],'CHORD','pressurehorn',['#a7d7e3','#43546b'],165000,1600,430,'A low-pressure grazer whose spiral horns compress wind into huge storm chords.'],
 ['bellshroom','Bellshroom','fungal',['Cap','Glow','Root'],'CHORD','bellshroom',['#e7d17a','#51634c'],305000,1620,520,'A tower-cap fungus with hanging luminous gills that ring like a cave carillon.'],
 ['avalaunch','Avalaunch','glacial',['Ice','Snow','Crystal'],'DRUM','avalanche',['#d8f4ff','#587c9f'],570000,1660,650,'A plated snow-beast that slams its forelegs and releases controlled miniature avalanches as fills.']
];
const monsters=[...monsterRows,...bonusRows].map(monsterFromRow);
for(const r of halloweenRows){const [id,name,island,track,design,colors,cost,bio]=r;monsters.push({id,name,island,elements:['Halloween'],track,design,colors,base:Math.round((islandById[island].unlock+3000)*.45),breed:1250,income:Math.max(80,Math.round((islandById[island].unlock+2000)/850)),bio,major:false,seasonal:true,eventCost:cost})}
const monsterById=Object.fromEntries(monsters.map(m=>[m.id,m]));

const SONG_PATTERNS={
 DRUM:[1,0,0,0,1,0,0,1,1,0,1,0,1,0,1,0, 1,0,0,1,1,0,0,1,1,0,1,0,1,1,1,0],
 PERC:[0,0,1,0,0,1,0,1,0,0,1,0,0,1,0,1, 0,1,0,1,0,1,1,0,0,1,0,1,1,0,1,1],
 BASS:[1,0,0,0,0,0,1,0,1,0,0,0,0,1,0,0, 1,0,0,0,1,0,1,0,1,0,0,1,0,1,0,0],
 CHORD:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0, 1,0,0,0,0,0,1,0,1,0,0,0,0,1,0,0],
 LEAD:[0,1,0,1,0,0,1,0,0,1,0,0,1,0,1,0, 0,1,1,0,0,1,0,1,0,0,1,1,0,1,0,1],
 VOICE:[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0, 0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0],
 FX:[0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1, 0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,1],
 TITAN:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0, 1,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0]
};
const SCALE=[1,9/8,5/4,4/3,3/2,5/3,15/8,2];

const ARRANGEMENTS={
 verdant:{groove:{DRUM:'1000100010101000',PERC:'0010010100100101',BASS:'1000001010000100',CHORD:'1000100010001000',LEAD:'0101001001001010',VOICE:'1000000000100000',FX:'0000000100000001',TITAN:'1000000010000000'},chords:[0,3,4,2,0,4,3,5],bass:[0,0,3,3,4,4,2,2],lead:[0,2,4,5,4,2,1,0,2,4,6,5,4,2,1,0]},
 ember:{groove:{DRUM:'1010101010101010',PERC:'0101010101010111',BASS:'1000101010001010',CHORD:'1000100010001000',LEAD:'0010101000101010',VOICE:'1000000010000000',FX:'0001000000010000',TITAN:'1000000010000000'},chords:[0,4,3,5,0,4,6,5],bass:[0,0,4,4,3,3,5,5],lead:[0,1,3,4,6,4,3,1,0,3,5,6,5,3,1,0]},
 tidal:{groove:{DRUM:'1000001010000010',PERC:'0010100100101001',BASS:'1000010010000100',CHORD:'1000100010001000',LEAD:'0100101001000101',VOICE:'1000000000001000',FX:'0000000100000010',TITAN:'1000000010000000'},chords:[0,2,5,3,0,4,2,5],bass:[0,2,2,5,0,4,4,2],lead:[0,2,3,5,6,5,3,2,0,1,3,5,3,2,1,0]},
 astral:{groove:{DRUM:'1000000010000010',PERC:'0001000100010001',BASS:'1000000010000000',CHORD:'1000000010000000',LEAD:'0010001000100010',VOICE:'1000000000000000',FX:'0000100000001000',TITAN:'1000000000000000'},chords:[0,5,3,4,0,2,6,4],bass:[0,0,5,5,3,3,4,4],lead:[0,4,6,5,3,1,2,5,7,5,4,2,1,3,5,4]},
 tempest:{groove:{DRUM:'1010101010111010',PERC:'0111010101110101',BASS:'1000101010001010',CHORD:'1000100010001000',LEAD:'0101010001010101',VOICE:'1000000010000000',FX:'0001000100010001',TITAN:'1000000010000000'},chords:[0,4,5,3,0,6,4,5],bass:[0,4,4,5,0,6,6,4],lead:[0,3,5,6,5,3,1,4,6,7,6,4,3,1,0,3]},
 fungal:{groove:{DRUM:'1000001000001010',PERC:'0010000100100001',BASS:'1000000010000100',CHORD:'1000000010001000',LEAD:'0001001000010010',VOICE:'1000000000001000',FX:'0000010000000100',TITAN:'1000000010000000'},chords:[0,3,2,5,0,4,2,3],bass:[0,0,3,3,2,2,5,5],lead:[0,2,3,1,4,3,2,0,1,3,5,4,3,1,2,0]},
 glacial:{groove:{DRUM:'1000100010001010',PERC:'0010010100101010',BASS:'1000001010000100',CHORD:'1000100010001000',LEAD:'0101001001010010',VOICE:'1000000000100000',FX:'0000100000010000',TITAN:'1000000010000000'},chords:[0,4,2,5,0,3,6,4],bass:[0,0,4,4,2,2,5,5],lead:[0,2,5,6,5,4,2,1,0,3,5,7,6,4,2,1]}
};
function grooveHit(profile,role,step){const p=ARRANGEMENTS[profile.id]?.groove?.[role];if(!p)return !!SONG_PATTERNS[role]?.[step%16];return p[step%16]==='1'}


function halloweenWindow(date=new Date()){
  const y=date.getFullYear();
  const start=new Date(y,8,24,0,0,0,0); // Sep 24
  const end=new Date(y,10,2,0,0,0,0);   // Nov 2 = unobtainable
  return{active:date>=start&&date<end,start,end,remaining:end-date};
}
function halloweenActive(){return halloweenWindow().active}

const questDefs=[
 ['q1','First Ensemble','Own 4 performers.',s=>totalOwned(s)>=4,800,1],
 ['q2','Eight Voices','Own 8 performers.',s=>totalOwned(s)>=8,1800,1],
 ['q3','Island Builder','Own 10 performers on one island.',s=>islands.some(i=>ownedOn(s,i.id)>=10),4500,2],
 ['q4','Rare Resonance','Discover a Rare form.',s=>Object.keys(s.discovered||{}).some(k=>k.endsWith('|Rare')),3500,2],
 ['q5','Epic Resonance','Discover an Epic form.',s=>Object.keys(s.discovered||{}).some(k=>k.endsWith('|Epic')),8000,3],
 ['q6','Legendary Resonance','Discover a Legendary form.',s=>Object.keys(s.discovered||{}).some(k=>k.endsWith('|Legendary')),18000,5],
 ['q7','Level Ten','Raise a performer to level 10.',s=>allOwned(s).some(o=>(o.level||1)>=10),12000,3],
 ['q8','Two Stages','Unlock 2 islands.',s=>(s.unlocked||[]).length>=2,5000,2],
 ['q9','Four Stages','Unlock 4 islands.',s=>(s.unlocked||[]).length>=4,20000,4],
 ['q10','Seven Stages','Unlock all 7 islands.',s=>(s.unlocked||[]).length>=7,90000,10],
 ['q11','Prime Contact','Own any Titan.',s=>allOwned(s).some(o=>monsterById[o.id]?.major),25000,4],
 ['q12','Titan Trio','Own 3 Titans.',s=>allOwned(s).filter(o=>monsterById[o.id]?.major).length>=3,65000,7],
 ['q13','Songbook I','Discover 30 forms.',s=>Object.keys(s.discovered||{}).length>=30,12000,3],
 ['q14','Songbook II','Discover 75 forms.',s=>Object.keys(s.discovered||{}).length>=75,38000,5],
 ['q15','Huge Orchestra','Own 50 performers.',s=>totalOwned(s)>=50,65000,6],
 ['q16','Storage Master','Raise a performer to level 15.',s=>allOwned(s).some(o=>(o.level||1)>=15),30000,4],
 ['q17','Star Collector','Earn 50 Stars all-time.',s=>(s.lifetimeStars||0)>=50,35000,4],
 ['q18','Shard Hunter','Earn 6 Titan Shards all-time.',s=>(s.lifetimeShards||0)>=6,50000,5],
 ['q19','Millionaire','Hold 1,000,000 coins.',s=>(s.coins||0)>=1000000,90000,7],
 ['q20','Master Conductor','Discover 150 rarity forms.',s=>Object.keys(s.discovered||{}).length>=150,160000,12]
].map(([id,title,desc,check,coins,gems])=>({id,title,desc,check,coins,gems}));

const GRIND_QUEST_MS=2*60*60*1000;
const grindQuestTemplates=[
 {key:'breeds',title:'Harmony Session',verb:'Complete breeding attempts',targets:[2,3,4],coins:2600,gems:0,stars:1,icon:'dna'},
 {key:'hatches',title:'Nursery Shift',verb:'Hatch or upgrade performers',targets:[2,3,4],coins:3200,gems:0,stars:1,icon:'egg'},
 {key:'coinsCollected',title:'Full Vaults',verb:'Collect coins from performers',targets:[3000,8000,16000],coins:4200,gems:0,stars:1,icon:'coin'},
 {key:'feeds',title:'Rehearsal Food',verb:'Raise monster levels',targets:[2,4,6],coins:3000,gems:1,stars:0,icon:'level'},
 {key:'miniGames',title:'Arcade Break',verb:'Play mini-games',targets:[2,3,4],coins:2800,gems:1,stars:0,icon:'game'},
 {key:'monsterCollects',title:'Bank Sweep',verb:'Collect individual performer banks',targets:[4,7,10],coins:2500,gems:0,stars:1,icon:'bank'},
 {key:'solos',title:'Solo Rehearsal',verb:'Trigger performer solos',targets:[4,7,10],coins:2300,gems:0,stars:1,icon:'music'},
 {key:'starsEarned',title:'Star Run',verb:'Earn Stars',targets:[2,3,4],coins:4000,gems:1,stars:0,icon:'star'},
 {key:'eggsBought',title:'Market Order',verb:'Buy eggs with coins',targets:[1,2,3],coins:3500,gems:0,stars:1,icon:'shop'},
 {key:'coinsSpent',title:'Invest in the Band',verb:'Spend coins',targets:[4000,10000,25000],coins:5000,gems:1,stars:0,icon:'coin'}
];

function blankOwned(){return Object.fromEntries(islands.map(i=>[i.id,[]]))}
function defaultState(){
 const starter={uid:uid(),id:'mossmara',rarity:'Common',level:1,lastCollect:now(),x:18,y:54};
 const owned=blankOwned();owned.verdant=[starter];
 return{
  version:8,coins:1800,gems:12,stars:0,lifetimeStars:0,titanShards:0,lifetimeShards:0,hexCandy:0,
  currentIsland:'verdant',unlocked:['verdant'],owned,discovered:{'mossmara|Common':true},breeding:null,nursery:null,
  questClaims:{},grindQuests:null,grindBoardsCleared:0,cosmetics:{starlight:{}},boosts:{income:{}},trackMute:{},
  settings:{music:true,sfx:true,voices:true,reduceMotion:false,volumePercent:100},
  stats:{breeds:0,hatches:0,coinsCollected:0,memoryWins:0,rushPlays:[],feeds:0,miniGames:0,monsterCollects:0,solos:0,eggsBought:0,coinsSpent:0,starsSpent:0,seasonals:0,shardsEarned:0},
  lastGift:0,giftStreak:0,lastSeen:now(),lastSave:now()
 };
}
function normalizeState(raw){
 const d=defaultState(),s={...d,...(raw||{})};
 s.owned={...blankOwned(),...(raw?.owned||{})};
 for(const i of islands){
  if(!Array.isArray(s.owned[i.id]))s.owned[i.id]=[];
  const groups={};
  for(const o of s.owned[i.id]){
   if(!o||!monsterById[o.id])continue;
   if(!rarityOrder.includes(o.rarity))o.rarity='Common';
   o.uid=o.uid||uid();o.level=clamp(Number(o.level)||1,1,20);o.lastCollect=Number(o.lastCollect)||now();
   (groups[o.id]??=[]).push(o);
  }
  s.owned[i.id]=Object.values(groups).flatMap(g=>g.sort((a,b)=>(rarityOrder.indexOf(b.rarity)-rarityOrder.indexOf(a.rarity))||((b.level||1)-(a.level||1))).slice(0,3));
 }
 s.unlocked=[...new Set((s.unlocked||['verdant']).filter(id=>islandById[id]))];if(!s.unlocked.includes('verdant'))s.unlocked.unshift('verdant');
 if(!islandById[s.currentIsland]||!s.unlocked.includes(s.currentIsland))s.currentIsland='verdant';
 s.discovered=s.discovered||{};s.questClaims=s.questClaims||{};
 s.settings={...d.settings,...(s.settings||{})};const savedVolume=Number(s.settings.volumePercent);s.settings.volumePercent=Number.isFinite(savedVolume)?clamp(Math.round(savedVolume),0,1000):100;s.stats={...d.stats,...(s.stats||{})};
 s.cosmetics={...d.cosmetics,...(s.cosmetics||{}),starlight:{...d.cosmetics.starlight,...(s.cosmetics?.starlight||{})}};
 s.boosts={...d.boosts,...(s.boosts||{}),income:{...d.boosts.income,...(s.boosts?.income||{})}};
 s.trackMute=s.trackMute||{};
 s.stars=Math.max(0,Number(s.stars)||0);s.lifetimeStars=Math.max(Number(s.lifetimeStars)||0,s.stars);
 s.titanShards=Math.max(0,Number(s.titanShards)||0);s.lifetimeShards=Math.max(Number(s.lifetimeShards)||0,s.titanShards);
 s.hexCandy=Math.max(0,Number(s.hexCandy)||0);
 if(!Array.isArray(s.stats.rushPlays))s.stats.rushPlays=[];
 if(!s.grindQuests||!Array.isArray(s.grindQuests.items))s.grindQuests=null;
 s.version=8;return s;
}
let state;
try{state=normalizeState(JSON.parse(localStorage.getItem('chordlingsSaveV2'))||defaultState())}catch{state=defaultState()}
function save(){state.lastSeen=now();state.lastSave=now();localStorage.setItem('chordlingsSaveV2',JSON.stringify(state))}
function allOwned(s=state){return Object.values(s.owned||{}).flat()}
function totalOwned(s=state){return allOwned(s).length}
function ownedOn(s,id){return (s.owned?.[id]||[]).length}
function getOwned(id){return allOwned().find(o=>o.uid===id)}
function rarityRank(r){return Math.max(0,rarityOrder.indexOf(r))}
function speciesCopies(id){const m=monsterById[id];return m?(state.owned[m.island]||[]).filter(o=>o.id===id):[]}
function addStars(n=1){n=Math.max(0,Math.floor(n));state.stars+=n;state.lifetimeStars=(state.lifetimeStars||0)+n}
function addShards(n=1){n=Math.max(0,Math.floor(n));state.titanShards+=n;state.lifetimeShards=(state.lifetimeShards||0)+n;state.stats.shardsEarned=(state.stats.shardsEarned||0)+n}
function addCandy(n=1){if(!halloweenActive())return;state.hexCandy+=Math.max(0,Math.floor(n))}
function canAcceptEgg(id,rarity='Common'){
 const copies=speciesCopies(id),target=rarityRank(rarity);
 if(rarity!=='Common'&&copies.some(o=>rarityRank(o.rarity)<target))return true;
 return copies.length<3;
}
function availableSpecies(islandId,{includeMajor=false,includeSeasonal=true,rarity='Common'}={}){
 return monsters.filter(m=>m.island===islandId&&(includeMajor||!m.major)&&(includeSeasonal||!m.seasonal)&&(!m.seasonal||halloweenActive())&&canAcceptEgg(m.id,rarity));
}
function calcRate(o){const m=monsterById[o.id];if(!m)return 0;const amp=state.boosts?.income?.[m.island]||0;return m.income*RARITIES[o.rarity].coin*(1+(o.level-1)*.22)*(1+amp*.1)}
function capacity(o){const m=monsterById[o.id];if(!m)return 0;const l=Math.max(1,o.level||1),hours=(6+l*1.4+l*l*.08)*RARITIES[o.rarity].storage*(m.major?2.5:1.2);return Math.floor(calcRate(o)*hours*60)}
function pendingCoins(o,t=now()){const elapsed=Math.max(0,t-(o.lastCollect||t));return Math.floor(Math.min(capacity(o),elapsed/60000*calcRate(o)))}
function collectMonster(o){const n=pendingCoins(o);if(n>0){state.coins+=n;state.stats.coinsCollected+=n;state.stats.monsterCollects++;o.lastCollect=now();save()}return n}
function collectAll(){let n=0;for(const o of state.owned[state.currentIsland]||[])n+=collectMonster(o);toast(n?`Collected ${fmt(n)} coins.`:'The banks are still filling.');renderTop();renderScene()}
function totalRate(){return allOwned().reduce((a,o)=>a+calcRate(o),0)}

function maxWaitSeconds(m,rarity){const tier=clamp((m.breed||100)/1700,0,1);const total=Math.round((22+tier*1650)*RARITIES[rarity].wait);return clamp(total,18,3480)}
function splitWait(total){const breed=Math.max(9,Math.round(total*.6));return{breed,hatch:Math.max(5,total-breed)}}
function skipCost(ms){const min=Math.ceil(ms/60000);return min<5?1:min<15?2:min<30?3:4}
function rarityRoll(a,b){const bonus=((a?.level||1)+(b?.level||1)-2)*.25,r=Math.random()*100;if(r<1.5+bonus*.08)return'Legendary';if(r<8+bonus*.22)return'Epic';if(r<27+bonus*.45)return'Rare';return'Common'}
function breedPool(a,b,islandId,rarity){
 const ma=monsterById[a.id],mb=monsterById[b.id];if(!ma||!mb)return[];
 const elems=new Set([...(ma.elements||[]),...(mb.elements||[])]);
 let pool=monsters.filter(m=>m.island===islandId&&!m.major&&!m.seasonal&&m.elements.every(e=>elems.has(e))&&canAcceptEgg(m.id,rarity));
 if(!pool.length)pool=monsters.filter(m=>m.island===islandId&&!m.major&&!m.seasonal&&canAcceptEgg(m.id,rarity));
 return pool;
}
function chooseWeighted(arr){if(!arr.length)return null;const weighted=arr.flatMap(m=>Array(Math.max(1,11-(m.elements?.length||1)*2)).fill(m));return weighted[Math.floor(Math.random()*weighted.length)]}

function grindMetric(key){return key==='starsEarned'?(state.lifetimeStars||0):(Number(state.stats?.[key])||0)}
function createGrindBoard(){
 const startedAt=now();const items=grindQuestTemplates.map((t,i)=>{const tier=Math.floor(Math.random()*t.targets.length),target=t.targets[tier],mult=1+tier*.55,scaled=Math.round(totalRate()*(5+tier*3));return{id:`g${startedAt}_${i}`,key:t.key,title:t.title,verb:t.verb,icon:t.icon,base:grindMetric(t.key),target,coins:Math.max(Math.round(t.coins*mult),scaled),gems:t.gems,stars:t.stars,candy:halloweenActive()?Math.round(22+18*tier):0,claimed:false}});
 state.grindQuests={startedAt,endsAt:startedAt+GRIND_QUEST_MS,items,bonusClaimed:false};
}
function ensureGrindBoard(force=false){if(force||!state.grindQuests||state.grindQuests.items.length!==10||now()>=state.grindQuests.endsAt){createGrindBoard();save();return true}return false}
function grindProgress(q){return Math.max(0,grindMetric(q.key)-q.base)}
function boardComplete(){return !!state.grindQuests&&state.grindQuests.items.every(q=>q.claimed)}

function processTimers(){
 const t=now();
 if(state.grindQuests&&t>=state.grindQuests.endsAt){const wasOpen=!!$('#questRefreshText');ensureGrindBoard(true);if(wasOpen)openQuests()}
 if(state.breeding&&t>=state.breeding.end&&!state.nursery){state.nursery={id:state.breeding.resultId,rarity:state.breeding.rarity,end:t+state.breeding.hatchSec*1000,totalSec:state.breeding.hatchSec,prime:state.breeding.prime,seasonal:state.breeding.seasonal};state.breeding=null;save();toast('Breeding finished. The egg moved to the Nursery.')}
 renderTimersOnly();
}

function icon(name,cls=''){
 const common=`viewBox="0 0 32 32" class="${cls}" aria-hidden="true"`;
 const paths={
  gift:'<rect x="5" y="12" width="22" height="15" rx="3" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M16 12v15M4 12h24V8H4zM16 8c-1-5-8-5-8-1 0 3 5 2 8 1zm0 0c1-5 8-5 8-1 0 3-5 2-8 1z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>',
  gear:'<path d="M13 3h6l1 4 4 2 4-1 3 5-3 3v4l3 3-3 5-4-1-4 2-1 4h-6l-1-4-4-2-4 1-3-5 3-3v-4l-3-3 3-5 4 1 4-2z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="18" r="4" fill="none" stroke="currentColor" stroke-width="2"/>',
  egg:'<path d="M16 3c-6 0-10 11-10 18 0 6 4 9 10 9s10-3 10-9C26 14 22 3 16 3z" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M10 19c3 2 9 2 12-1" fill="none" stroke="currentColor" stroke-width="2"/>',
  dna:'<path d="M8 4c0 9 16 15 16 24M24 4c0 9-16 15-16 24M10 8h12M9 14h14M9 21h14M10 27h12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  shop:'<path d="M5 12l3-7h16l3 7M7 13v14h18V13M11 27v-8h10v8" fill="none" stroke="currentColor" stroke-width="2.3"/><path d="M5 12c0 3 5 4 6 0 1 4 9 4 10 0 1 4 6 3 6 0" fill="none" stroke="currentColor" stroke-width="2"/>',
  mixer:'<path d="M6 5v22M16 5v22M26 5v22" stroke="currentColor" stroke-width="2.2"/><rect x="3" y="9" width="6" height="6" rx="2" fill="currentColor"/><rect x="13" y="17" width="6" height="6" rx="2" fill="currentColor"/><rect x="23" y="8" width="6" height="6" rx="2" fill="currentColor"/>',
  resonator:'<circle cx="16" cy="16" r="12" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 3"/><path d="M16 3l5 8-3 17h-4l-3-17z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="16" r="3" fill="currentColor"/>',
  island:'<path d="M4 24c5-8 19-8 24 0M9 19c2-5 4-8 7-10 3 2 5 5 7 10" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M16 9V4m0 0l-4 3m4-3l4 3" stroke="currentColor" stroke-width="2"/>',
  book:'<path d="M4 6c7-2 10 0 12 3 2-3 5-5 12-3v20c-7-2-10 0-12 3-2-3-5-5-12-3zM16 9v20" fill="none" stroke="currentColor" stroke-width="2.1"/>',
  quest:'<path d="M9 4h14l4 4v20H9z" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M13 12h10M13 17h10M13 22h7" stroke="currentColor" stroke-width="2"/><path d="M4 13l2 2 4-5" fill="none" stroke="currentColor" stroke-width="2.2"/>',
  game:'<path d="M9 12h14c5 0 8 12 5 15-2 2-5-3-7-4H11c-2 1-5 6-7 4-3-3 0-15 5-15z" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M9 17v6m-3-3h6M22 18h.1M25 21h.1" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
  coin:'<circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" stroke-width="2.3"/><path d="M19 10h-5c-4 0-4 5 0 5h4c4 0 4 6 0 6h-6M16 7v18" fill="none" stroke="currentColor" stroke-width="2"/>',
  star:'<path d="M16 3l3.7 8.2 9 .8-6.8 6 2 8.8-7.9-4.5-7.9 4.5 2-8.8-6.8-6 9-.8z" fill="none" stroke="currentColor" stroke-width="2"/>',
  level:'<path d="M7 26V14M16 26V9M25 26V4M4 26h24" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
  bank:'<path d="M4 12l12-7 12 7M6 14h20M8 14v10M14 14v10M20 14v10M26 14v10M4 27h24" fill="none" stroke="currentColor" stroke-width="2"/>',
  music:'<path d="M12 8v16c0 4-8 5-8 1 0-3 4-5 8-4M12 8l14-3v15c0 4-8 5-8 1 0-3 4-5 8-4V5" fill="none" stroke="currentColor" stroke-width="2.2"/>',
  candy:'<path d="M8 8l5 2 6-5 5 5-5 6 2 8-8 3-7-6 2-6z" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M12 12l8 8M17 8l-8 13" stroke="currentColor" stroke-width="1.5"/>',
  shard:'<path d="M16 3l7 7-4 19h-6L9 10z" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M9 10h14M16 3v26" stroke="currentColor" stroke-width="1.4" opacity=".7"/>'
 };
 return `<svg ${common}>${paths[name]||paths.music}</svg>`;
}
function hydrateIcons(root=document){root.querySelectorAll('[data-ui-icon]').forEach(el=>{el.innerHTML=icon(el.dataset.uiIcon)})}

function islandArtSVG(id,thumb=false){
 const i=islandById[id]||islands[0];
 const h=thumb?150:600,w=1200;
 const defs=`<defs><linearGradient id="sky_${id}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${i.sky[0]}"/><stop offset="1" stop-color="${i.sky[1]}"/></linearGradient><linearGradient id="land_${id}" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${i.ground[0]}"/><stop offset="1" stop-color="${i.ground[1]}"/></linearGradient></defs>`;
 let extra='';
 if(id==='verdant')extra=`<path d="M0 365Q150 270 300 360T600 335T900 350T1200 315V600H0z" fill="url(#land_${id})"/><path d="M0 455Q200 390 400 450T800 425T1200 445V600H0z" fill="#4c9848" opacity=".72"/><g fill="#2f683d"><path d="M80 410l45-120 45 120z"/><path d="M190 430l35-95 35 95z"/><path d="M1030 410l50-130 50 130z"/></g><g fill="#dff7ff" opacity=".8"><ellipse cx="190" cy="95" rx="80" ry="26"/><ellipse cx="835" cy="145" rx="95" ry="30"/></g><path d="M0 520Q250 480 520 520T1200 505V600H0z" fill="#65aa4c"/>`;
 if(id==='ember')extra=`<path d="M0 410L150 255l130 145 170-250 180 250 165-180 170 180 125-105 130 115v190H0z" fill="url(#land_${id})"/><path d="M370 600l80-450 65 250 55 200z" fill="#3c2730"/><path d="M455 155l32 96 28-96-27-32z" fill="#ff8c4a"/><path d="M475 160q-35-70 25-100q-10 45 35 64q-25 18-60 36z" fill="#b65d56" opacity=".55"/><g fill="#2b2330" opacity=".6"><ellipse cx="140" cy="110" rx="90" ry="34"/><ellipse cx="920" cy="90" rx="130" ry="38"/></g><path d="M0 515q170-45 340 0t340 0t520 0v85H0z" fill="#4b2e32"/>`;
 if(id==='tidal')extra=`<path d="M0 330q170-35 340 0t340 0t340 0t180 0v270H0z" fill="url(#land_${id})"/><path d="M0 420q150-28 300 0t300 0t300 0t300 0" fill="none" stroke="#b7f3ff" stroke-width="8" opacity=".4"/><path d="M150 520q25-95 50 0m35 0q20-120 48 0m660 0q28-105 54 0m38 0q18-80 40 0" fill="none" stroke="#f19599" stroke-width="13" stroke-linecap="round"/><path d="M480 600q25-165 90-155t80 155" fill="#2f8798"/><circle cx="565" cy="450" r="34" fill="#67c6d4"/>`;
 if(id==='astral')extra=`<rect width="1200" height="600" fill="url(#sky_${id})"/><g fill="#fff" opacity=".78">${Array.from({length:42},(_,n)=>`<circle cx="${(n*97)%1180+10}" cy="${(n*53)%330+20}" r="${n%3+1}"/>`).join('')}</g><path d="M0 445q180-75 340-10t300-35t320 15t240-30v215H0z" fill="url(#land_${id})"/><g fill="#7663a5"><path d="M150 350q55-70 110 0l-28 35h-54z"/><path d="M875 290q70-95 145 0l-35 50h-75z"/></g><ellipse cx="760" cy="95" rx="90" ry="22" fill="none" stroke="#b99cff" stroke-width="10" opacity=".5" transform="rotate(-12 760 95)"/>`;
 if(id==='tempest')extra=`<path d="M0 355q170-65 330 0t330 0t330 0t210 0v245H0z" fill="url(#land_${id})"/><g fill="#d8e3e8" opacity=".73"><ellipse cx="190" cy="120" rx="130" ry="43"/><ellipse cx="330" cy="95" rx="115" ry="38"/><ellipse cx="900" cy="125" rx="180" ry="48"/></g><path d="M710 80l-45 115h55l-45 115 100-145h-60l55-85z" fill="#f6ec87" opacity=".85"/><path d="M0 520q190-70 370 5t360-5t470 0v80H0z" fill="#3a5b4e"/>`;
 if(id==='fungal')extra=`<rect width="1200" height="600" fill="#182627"/><path d="M0 0q180 150 340 65t300 35t300-25t260 65V0z" fill="#304541"/><path d="M0 410q190-90 390-15t350-15t460 5v215H0z" fill="url(#land_${id})"/><g><g transform="translate(155 330)"><path d="M30 40v120" stroke="#d9d0a0" stroke-width="22"/><path d="M-35 45q65-95 130 0z" fill="#bd7b70"/></g><g transform="translate(905 355) scale(.8)"><path d="M30 40v120" stroke="#cbd6a1" stroke-width="22"/><path d="M-35 45q65-95 130 0z" fill="#89c577"/></g></g><g fill="#a8ffd0" opacity=".35"><circle cx="240" cy="190" r="7"/><circle cx="750" cy="135" r="5"/><circle cx="1040" cy="220" r="8"/></g>`;
 if(id==='glacial')extra=`<path d="M0 390L150 220l120 145 165-245 150 250 130-190 145 180 130-125 160 160v205H0z" fill="url(#land_${id})"/><path d="M90 290l60-70 55 66-52-20zM370 215l65-95 58 98-58-27zM670 248l45-68 48 70-47-20z" fill="#f1fdff" opacity=".9"/><path d="M0 510q180-65 360 0t360 0t480 0v90H0z" fill="#bfe8ef"/><path d="M70 85q180-80 320 0t300 0t390 0" fill="none" stroke="#a8ffdb" stroke-width="18" opacity=".32"/>`;
 return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice">${defs}<rect width="1200" height="600" fill="url(#sky_${id})"/>${extra}</svg>`;
}

function monsterSVG(m,o={rarity:'Common'},mini=false){
 const c1=m.colors?.[0]||'#79d59b',c2=m.colors?.[1]||'#37546c',gid=`g_${m.id.replace(/[^a-z0-9]/gi,'')}_${mini?'m':'f'}`;
 const defs=`<defs><linearGradient id="${gid}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient><filter id="gl_${gid}"><feGaussianBlur stdDeviation="2.5"/></filter></defs>`;
 const eye=`<g class="eyes"><ellipse cx="43" cy="38" rx="5" ry="6" fill="#f7fbff"/><ellipse cx="61" cy="38" rx="5" ry="6" fill="#f7fbff"/><circle cx="44" cy="40" r="2.3" fill="#122033"/><circle cx="60" cy="40" r="2.3" fill="#122033"/></g>`;
 const mouth=`<path class="mouth" d="M46 49q7 6 14 0q-7 11-14 0" fill="#263144"/>`;
 const legPair=`<g class="limb"><path d="M38 68v18q-1 6-9 3" fill="none" stroke="${c2}" stroke-width="8" stroke-linecap="round"/><path d="M65 68v18q1 6 9 3" fill="none" stroke="${c2}" stroke-width="8" stroke-linecap="round"/></g>`;
 const baseBiped=(extras='',body='M29 35q2-21 23-23q23 2 24 24l-3 35q-21 18-43 0z')=>`<path d="${body}" fill="url(#${gid})" stroke="#ffffff55" stroke-width="2"/>${legPair}${eye}${mouth}${extras}`;
 const inst=()=>{
  if(m.track==='DRUM')return `<ellipse class="instrument" cx="52" cy="62" rx="17" ry="12" fill="#f7e6c1" stroke="${c2}" stroke-width="4"/><path class="instrument" d="M34 57l-10-6M70 57l10-6" stroke="${c2}" stroke-width="5" stroke-linecap="round"/>`;
  if(m.track==='CHORD')return `<g class="instrument" stroke="#edf9ff" stroke-width="2"><path d="M35 56v16M45 53v20M55 53v20M65 56v16"/><circle cx="35" cy="72" r="3" fill="${c1}"/><circle cx="45" cy="73" r="3" fill="${c1}"/><circle cx="55" cy="73" r="3" fill="${c1}"/><circle cx="65" cy="72" r="3" fill="${c1}"/></g>`;
  if(m.track==='LEAD')return `<path class="horn" d="M62 52q22-8 29 0q-11 6-27 8z" fill="${c1}" stroke="#ffffff55" stroke-width="2"/>`;
  if(m.track==='BASS')return `<g class="instrument" stroke="#18283c" stroke-width="3" opacity=".6"><path d="M39 57h27M38 63h29M41 69h23"/></g>`;
  if(m.track==='PERC')return `<g class="instrument"><circle cx="27" cy="58" r="7" fill="${c1}" stroke="#ffffff55"/><circle cx="77" cy="58" r="7" fill="${c1}" stroke="#ffffff55"/></g>`;
  if(m.track==='FX')return `<g class="ringPart" fill="none" stroke="${c1}" stroke-width="3"><ellipse cx="52" cy="58" rx="27" ry="10" opacity=".7"/><ellipse cx="52" cy="58" rx="17" ry="6" opacity=".45"/></g>`;
  return `<path class="mouth" d="M40 53q12 14 24 0q-12 20-24 0" fill="#263144" stroke="#ffffff44"/>`;
 };
 let body='';
 const d=m.design;
 if(d==='deer')body=`<g class="deerBody"><ellipse cx="50" cy="61" rx="28" ry="17" fill="url(#${gid})" stroke="#ffffff55" stroke-width="2"/><path d="M69 50q16-16 20-2l-2 17" fill="url(#${gid})" stroke="#ffffff55" stroke-width="2"/><ellipse cx="87" cy="45" rx="12" ry="11" fill="url(#${gid})"/><circle cx="90" cy="43" r="2.5" fill="#132238"/><g class="antler" fill="none" stroke="${c2}" stroke-width="4" stroke-linecap="round"><path d="M82 35l-8-17m9 13l7-14m-13 5l-7-6m17 5l7-6"/></g><g class="hoof" stroke="${c2}" stroke-width="6" stroke-linecap="round"><path d="M35 72v19M48 73v18M63 72v19M75 70v18"/></g><g class="bush" fill="${c1}"><circle cx="35" cy="51" r="8"/><circle cx="46" cy="46" r="10"/><circle cx="56" cy="51" r="8"/></g></g>`;
 else if(d.startsWith('prime'))body=`<g><path d="M20 58q2-31 32-38q31 5 34 38l-8 24q-27 18-53 0z" fill="url(#${gid})" stroke="#ffe89a99" stroke-width="3"/><g class="primeCore"><circle cx="53" cy="59" r="16" fill="#eaf9ff" opacity=".16"/><circle cx="53" cy="59" r="10" fill="${c1}"/><circle cx="53" cy="59" r="4" fill="#fff3b0"/></g><path class="limb" d="M27 62L8 79M78 62l20 16M33 82l-10 14M72 82l10 14" stroke="${c2}" stroke-width="8" stroke-linecap="round"/><path class="horn" d="M30 31L18 9l18 15M74 31L88 8 69 24" fill="none" stroke="${c1}" stroke-width="7" stroke-linecap="round"/><g class="ringPart" fill="none" stroke="#dff7ff88" stroke-width="2"><ellipse cx="53" cy="58" rx="44" ry="19"/><ellipse cx="53" cy="58" rx="22" ry="43" transform="rotate(30 53 58)"/></g></g>`;
 else if(['bird','stormbird','icebird','bat'].includes(d))body=`<g><ellipse cx="53" cy="54" rx="22" ry="27" fill="url(#${gid})" stroke="#ffffff55" stroke-width="2"/><path class="wing" d="M34 48Q6 44 14 71q17-5 28-12" fill="${c1}" stroke="#ffffff55"/><path class="wing" d="M72 48q28-4 20 23q-17-5-28-12" fill="${c1}" stroke="#ffffff55"/><path d="M47 31q6-13 12 0" fill="${c1}"/>${eye}<path class="mouth" d="M48 48l13 4-13 5z" fill="#e7b85e"/><path class="limb" d="M46 79v11m14-11v11" stroke="${c2}" stroke-width="4"/></g>`;
 else if(['mammoth','stormhoof','iceWolf','hornbeast','boneHorn','seahorn'].includes(d))body=`<g><ellipse cx="48" cy="59" rx="30" ry="20" fill="url(#${gid})" stroke="#ffffff55" stroke-width="2"/><ellipse cx="77" cy="49" rx="18" ry="16" fill="url(#${gid})"/><circle cx="82" cy="45" r="3" fill="#132238"/><path class="horn" d="M73 36q-4-20-15-23q4 15 14 28M85 36q7-17 16-19q-2 16-15 26" fill="none" stroke="${c1}" stroke-width="6" stroke-linecap="round"/><g class="limb" stroke="${c2}" stroke-width="7" stroke-linecap="round"><path d="M31 72v18M45 75v17M60 74v17M72 69v20"/></g>${m.track==='LEAD'?`<path class="instrument" d="M89 50q12 3 7 16q-5-9-12-10" fill="${c1}"/>`:''}</g>`;
 else if(['crab','stormcrab'].includes(d))body=`<g><ellipse cx="52" cy="58" rx="25" ry="19" fill="url(#${gid})" stroke="#ffffff55" stroke-width="2"/>${eye}<g class="limb" stroke="${c2}" stroke-width="5" stroke-linecap="round"><path d="M29 59L10 50M29 65L8 70M75 59l19-9M75 65l21 6"/></g><g class="instrument"><path d="M24 51q-13-18-20-3q7 12 18 10M80 51q13-18 20-3q-7 12-18 10" fill="${c1}" stroke="#ffffff55"/></g></g>`;
 else if(['octopus','ghostOcto','kraken'].includes(d))body=`<g><path d="M31 52q1-28 21-31q22 3 23 31l-3 19H34z" fill="url(#${gid})" stroke="#ffffff55" stroke-width="2"/>${eye}${mouth}<g class="limb" fill="none" stroke="${c2}" stroke-width="6" stroke-linecap="round"><path d="M37 70q-14 20-20 3M45 70q-9 25-14 15M54 70q0 27 8 16M63 70q12 22 18 7M70 69q18 15 20 1"/></g></g>`;
 else if(['whale','ray','ghostFish'].includes(d))body=`<g><path d="M18 58q22-31 62-16q17 7 18 21q-29 15-72 3z" fill="url(#${gid})" stroke="#ffffff55" stroke-width="2"/><path class="wing" d="M42 60Q21 85 10 69q15-6 30-17M70 60q17 24 30 8q-13-8-28-16" fill="${c1}"/><circle cx="77" cy="51" r="3" fill="#122033"/><path class="tail" d="M20 57L3 45v23z" fill="${c2}"/>${m.track==='BASS'?`<g class="instrument" stroke="#173047" stroke-width="3"><path d="M50 48v20M58 47v22M66 48v19"/></g>`:''}</g>`;
 else if(['turtle'].includes(d))body=`<g><ellipse cx="53" cy="58" rx="28" ry="20" fill="${c2}"/><path class="instrument" d="M28 57q24-35 49 0q-5 24-24 24q-19 0-25-24z" fill="url(#${gid})" stroke="#ffffff55" stroke-width="2"/><ellipse cx="83" cy="55" rx="12" ry="10" fill="${c1}"/><circle cx="86" cy="52" r="2" fill="#132238"/><g class="limb" fill="${c1}"><ellipse cx="31" cy="73" rx="9" ry="5"/><ellipse cx="69" cy="75" rx="9" ry="5"/></g></g>`;
 else if(['dragon'].includes(d))body=`<g><path d="M26 65q3-37 31-40q28 9 24 43q-12 17-31 17q-16 0-24-20z" fill="url(#${gid})" stroke="#ffffff55" stroke-width="2"/>${eye}<path class="wing" d="M32 48L8 29l8 32zM74 45l22-19-7 34z" fill="${c1}"/><path class="tail" d="M29 72Q7 89 3 72q13 5 25-9" fill="${c2}"/><path class="horn" d="M42 27l-9-16m29 16l10-16" stroke="${c1}" stroke-width="5"/></g>`;
 else if(['mushroom','pumpkinMush','ghostMush'].includes(d))body=`<g><path d="M42 48v35q10 10 21 0V48" fill="${c2}" stroke="#ffffff44" stroke-width="2"/><path class="instrument" d="M18 48q7-31 35-33q31 2 37 33q-34 17-72 0z" fill="url(#${gid})" stroke="#ffffff55" stroke-width="2"/><circle cx="39" cy="36" r="4" fill="#fff7c4" opacity=".65"/><circle cx="63" cy="28" r="5" fill="#fff7c4" opacity=".65"/>${eye}${mouth}<g class="limb" stroke="${c2}" stroke-width="5"><path d="M44 82l-8 11M61 82l8 11"/></g></g>`;
 else if(['cloud','cyclone','rainbeast','stormGhost'].includes(d))body=`<g><g class="bush"><circle cx="37" cy="55" r="20" fill="url(#${gid})"/><circle cx="55" cy="44" r="24" fill="url(#${gid})"/><circle cx="74" cy="57" r="18" fill="url(#${gid})"/></g>${eye}${mouth}<g class="frond" stroke="#bfeeff" stroke-width="4" stroke-linecap="round"><path d="M35 76l-5 15M52 76l3 17M70 75l8 14"/></g></g>`;
 else if(['flower','singer','fungalsinger','iceSinger','dreamer','mask','snowGhost'].includes(d))body=baseBiped(`<g class="leaf" fill="${c1}"><ellipse cx="52" cy="18" rx="8" ry="15"/><ellipse cx="35" cy="24" rx="8" ry="15" transform="rotate(-45 35 24)"/><ellipse cx="69" cy="24" rx="8" ry="15" transform="rotate(45 69 24)"/></g>${inst()}`);
 else if(['sprout','fernbeast','tree','woodling','kelp','coral','fungalroot','fungalbeast','fungalflute','ashbeast','graveTree'].includes(d))body=baseBiped(`<g class="leaf" fill="${c1}"><path d="M38 20q-17-18-22 1q16 3 24 11M64 20q18-18 23 1q-16 3-25 11"/></g><g class="frond" fill="none" stroke="${c1}" stroke-width="4" stroke-linecap="round"><path d="M31 59q-18 5-18 20M73 59q18 5 18 20"/></g>${inst()}`,`M27 39q6-25 25-26q22 2 27 27l-6 37q-22 14-42 0z`);
 else if(['crystal','ice','prism','aurora','rune'].includes(d))body=baseBiped(`<path class="horn" d="M35 24l8-20 8 18L62 1l8 24" fill="${c1}" stroke="#ffffff66" stroke-width="2"/>${inst()}`,`M28 38l13-23h23l13 23-5 38-20 12-20-12z`);
 else if(['machine','witchMachine','gargoyle'].includes(d))body=baseBiped(`<path class="instrument" d="M34 55h36v19H34z" fill="#202c39" stroke="${c1}" stroke-width="3"/><circle class="instrument" cx="44" cy="64" r="5" fill="${c1}"/><circle class="instrument" cx="60" cy="64" r="5" fill="${c1}"/><path class="horn" d="M36 23V8m32 15V8" stroke="${c1}" stroke-width="5"/>`,'M24 35l12-18h32l12 18-4 42-24 12-24-12z');
 else if(['drummer','hopper','reaper'].includes(d))body=baseBiped(inst(),`M28 33q8-20 24-20q18 0 25 20l-3 46q-21 12-44 0z`);
 else if(['orbiter','starling','comet','nebula','crownbeast','ghostComet','crypt'].includes(d))body=baseBiped(`<g class="ringPart" fill="none" stroke="${c1}" stroke-width="3"><ellipse cx="52" cy="49" rx="36" ry="11" transform="rotate(-18 52 49)"/></g><circle class="instrument" cx="81" cy="38" r="6" fill="${c1}"/>${inst()}`);
 else if(['void'].includes(d))body=`<g><path d="M24 50q7-34 29-34q25 0 30 36l-7 32q-25 10-47 0z" fill="${c2}" stroke="#b39bdd66" stroke-width="2"/><ellipse class="mouth" cx="54" cy="55" rx="18" ry="25" fill="#080812"/><ellipse cx="54" cy="55" rx="8" ry="13" fill="${c1}" opacity=".25"/><circle cx="42" cy="38" r="3" fill="#d7cbff"/><circle cx="66" cy="38" r="3" fill="#d7cbff"/></g>`;
 else if(['candle'].includes(d))body=baseBiped(`<path class="leaf" d="M52 12q-14-15 2-29q-2 13 11 19q-3 10-13 10z" fill="#ffdd63"/><path d="M32 31h40v10H32z" fill="#f4d8af"/>${inst()}`);
 else if(['spider'].includes(d))body=`<g><ellipse cx="53" cy="55" rx="18" ry="22" fill="url(#${gid})"/>${eye}<g class="limb" stroke="${c2}" stroke-width="4" fill="none"><path d="M38 45L20 31 8 35M36 52L16 48 5 56M38 62L17 69 8 80M68 45l18-14 12 4M70 52l20-4 11 8M68 62l21 7 9 11"/></g><path class="instrument" d="M28 25q25-20 51 0M22 34q31-18 62 0" fill="none" stroke="#eef7ff88"/></g>`;
 else if(d==='bubble')body=`<g><circle cx="52" cy="54" r="28" fill="${c1}55" stroke="${c1}" stroke-width="3"/><circle cx="42" cy="43" r="8" fill="#ffffff44"/><circle class="instrument" cx="22" cy="25" r="7" fill="none" stroke="${c1}"/><circle class="instrument" cx="84" cy="36" r="9" fill="none" stroke="${c1}"/>${eye}${mouth}<g class="limb" stroke="${c2}" stroke-width="5"><path d="M38 76l-8 15M65 76l8 15"/></g></g>`;
 else if(d==='flame')body=`<g><path class="flamePart" d="M52 9q-20 18-13 31q-15 6-14 27q2 23 27 23q27 0 29-24q1-16-13-25q7-16-16-32z" fill="url(#${gid})" stroke="#ffe09a88" stroke-width="2"/><path class="flamePart" d="M55 23q-9 11-3 20q8-4 10-11q7 13 1 24" fill="none" stroke="#fff0a6" stroke-width="5" stroke-linecap="round"/>${eye}${mouth}<g class="limb" stroke="${c2}" stroke-width="5"><path d="M35 72l-12 14M69 72l12 14"/></g></g>`;
 else if(d==='windling')body=`<g><path d="M34 35q18-25 37 0l4 34q-22 20-46 0z" fill="url(#${gid})" stroke="#ffffff55" stroke-width="2"/>${eye}${mouth}<path class="wing" d="M33 47Q3 30 8 61q18 5 30-3M71 47q30-17 25 14q-18 5-30-3" fill="${c1}99"/><path class="ringPart" d="M22 23q30-18 61 0M17 75q35 18 70 0" fill="none" stroke="#e7fbff99" stroke-width="3"/></g>`;
 else if(d==='icebeast')body=`<g><path d="M19 58l14-25 24-8 29 15 8 27-19 18H35z" fill="url(#${gid})" stroke="#ffffff77" stroke-width="2"/><path class="horn" d="M34 35l3-22 13 16M68 31l12-18 3 25" fill="${c1}" stroke="#fff8"/><circle cx="73" cy="48" r="3" fill="#132238"/><g class="hoof" stroke="${c2}" stroke-width="7"><path d="M34 76v16M49 79v14M67 78v15M79 73v17"/></g><path class="instrument" d="M31 58h43" stroke="#e9fcff" stroke-width="4"/></g>`;
 else if(d==='iceImp')body=`<g><path d="M31 40q7-22 21-23q16 1 23 23l-5 36q-17 16-37 0z" fill="url(#${gid})" stroke="#ffffff66" stroke-width="2"/><path class="horn" d="M38 25L30 7l15 13M66 25L75 7 60 20" fill="none" stroke="${c1}" stroke-width="6"/>${eye}<path class="mouth" d="M45 51q8 8 15 0" fill="none" stroke="#20304a" stroke-width="3"/><g class="instrument" stroke="#eefcff" stroke-width="3"><path d="M22 63l15 8M82 63l-15 8"/><path d="M17 60l8 18M87 60l-8 18"/></g></g>`;
 else if(d==='pumpkin')body=`<g><ellipse cx="52" cy="58" rx="31" ry="27" fill="url(#${gid})" stroke="#ffe0a155" stroke-width="2"/><path d="M50 31q-4-17 9-20q-2 10 7 13" fill="none" stroke="${c2}" stroke-width="7"/><path class="mouth" d="M34 60l8-7 8 6 9-7 10 8q-16 15-35 0z" fill="#2b2330"/><path d="M35 45l9-5 5 7m22-2l-9-5-5 7" fill="none" stroke="#2b2330" stroke-width="4"/><g class="limb" stroke="${c2}" stroke-width="6"><path d="M37 80l-10 12M67 80l10 12"/></g></g>`;
 else if(d==='coffinMush')body=`<g><path class="instrument" d="M26 28h52l7 51-32 17-32-17z" fill="${c2}" stroke="#c6b89d88" stroke-width="3"/><path d="M34 34v40q18 9 36 0V34" fill="url(#${gid})"/><path d="M20 39q7-25 33-27q27 2 34 27q-33 15-67 0z" fill="${c1}"/>${eye}${mouth}</g>`;
 else if(d==='canopy')body=`<g><ellipse cx="50" cy="63" rx="29" ry="17" fill="${c2}"/><path class="leaf" d="M15 48q15-31 37-17q19-17 39 17q-18 14-38 9q-21 7-38-9z" fill="${c1}" stroke="#ffffff55" stroke-width="2"/><circle cx="76" cy="60" r="11" fill="${c1}"/><circle cx="79" cy="57" r="2.5" fill="#15263a"/><g class="hoof" stroke="${c2}" stroke-width="6"><path d="M31 73v18M45 76v16M61 76v16M72 72v18"/></g><g class="instrument" stroke="#eef9ff88" stroke-width="2"><path d="M28 47h48M31 52h42"/></g></g>`;
 else if(d==='sootsax')body=`<g><path d="M22 62q14-30 44-26q23 3 29 22q-13 25-48 23q-16-1-25-19z" fill="url(#${gid})" stroke="#ffffff44" stroke-width="2"/><circle cx="72" cy="49" r="3" fill="#132238"/><path class="instrument" d="M77 51q18 0 16 16q-2 12-18 8q11-2 10-11q0-6-10-6z" fill="#d9a84d" stroke="#ffe0a0" stroke-width="2"/><path class="tail" d="M26 60Q5 46 8 72q10-8 23-6" fill="${c2}"/><g class="limb" stroke="${c2}" stroke-width="5"><path d="M43 74l-8 16M61 75l8 15"/></g></g>`;
 else if(d==='anemone')body=`<g><ellipse cx="52" cy="67" rx="27" ry="17" fill="${c2}"/><g class="frond" fill="none" stroke="${c1}" stroke-width="7" stroke-linecap="round"><path d="M32 58Q10 35 27 19M42 54Q31 27 43 13M53 53Q53 24 58 10M64 54Q77 25 77 13M74 57Q95 36 91 20M26 66Q8 63 9 48"/></g><g class="mouth" fill="#263144"><circle cx="27" cy="19" r="4"/><circle cx="43" cy="13" r="4"/><circle cx="58" cy="10" r="4"/><circle cx="77" cy="13" r="4"/><circle cx="91" cy="20" r="4"/><circle cx="9" cy="48" r="4"/></g></g>`;
 else if(d==='meteor')body=`<g><path d="M23 64q4-31 31-37q30 5 32 37l-13 23-38 0z" fill="url(#${gid})" stroke="#ffffff55" stroke-width="2"/><g fill="${c2}" opacity=".55"><circle cx="42" cy="48" r="7"/><circle cx="68" cy="61" r="5"/><circle cx="49" cy="72" r="4"/></g>${eye}<g class="instrument"><circle cx="17" cy="24" r="6" fill="${c1}"/><circle cx="93" cy="35" r="5" fill="${c1}"/><path d="M17 24Q52 3 93 35" fill="none" stroke="#eefaff88" stroke-width="2"/></g><g class="limb" stroke="${c2}" stroke-width="7"><path d="M37 82l-7 12M68 82l8 12"/></g></g>`;
 else if(d==='pressurehorn')body=`<g><ellipse cx="47" cy="61" rx="31" ry="18" fill="url(#${gid})" stroke="#ffffff55" stroke-width="2"/><ellipse cx="77" cy="52" rx="14" ry="12" fill="${c1}"/><circle cx="80" cy="49" r="2.5" fill="#132238"/><g class="horn" fill="none" stroke="${c1}" stroke-width="6"><path d="M72 43q-5-23-19-19q-13 4-4 15q8 9 18 0"/><path d="M84 43q8-22 20-14q9 7-1 14q-8 6-16-2"/></g><g class="hoof" stroke="${c2}" stroke-width="6"><path d="M30 73v18M46 77v15M61 77v15M73 70v20"/></g></g>`;
 else if(d==='bellshroom')body=`<g><path d="M42 49v36q10 9 21 0V49" fill="${c2}"/><path class="leaf" d="M14 48q8-34 39-36q33 2 39 36q-38 18-78 0z" fill="url(#${gid})" stroke="#ffffff55" stroke-width="2"/><g class="instrument" stroke="#f8e7a8" stroke-width="2" fill="${c1}"><path d="M31 49v18M44 52v20M59 52v20M73 49v18"/><circle cx="31" cy="69" r="5"/><circle cx="44" cy="74" r="5"/><circle cx="59" cy="74" r="5"/><circle cx="73" cy="69" r="5"/></g>${eye}</g>`;
 else if(d==='avalanche')body=`<g><path d="M15 62l18-28 25-8 31 16 8 28-21 17H31z" fill="url(#${gid})" stroke="#ffffff77" stroke-width="2"/><path d="M28 42l15-20 10 14 10-20 16 27" fill="#f5fdffbb"/><circle cx="76" cy="51" r="3" fill="#132238"/><g class="hoof" stroke="${c2}" stroke-width="8"><path d="M31 77v17M48 80v14M66 80v14M79 75v18"/></g><path class="instrument" d="M25 68q30 14 61 0" fill="none" stroke="#dff7ff" stroke-width="5"/></g>`;
 else body=baseBiped(inst());
 const seasonal=m.seasonal?`<g opacity=".9"><path d="M15 13q7-12 14 0q-7-4-14 0z" fill="#ffbd61"/><circle cx="89" cy="18" r="5" fill="#bda3ff" filter="url(#gl_${gid})"/></g>`:'';
 return `<svg viewBox="0 0 105 105" class="creatureSVG role-${m.track.toLowerCase()} design-${esc(m.design)}${m.major?' titanArt':''}${m.seasonal?' seasonalArt':''}" aria-label="${esc(m.name)}">${defs}${seasonal}${body}</svg>`;
}

class AudioEngine{
 constructor(){this.ctx=null;this.master=null;this.comp=null;this.output=null;this.timer=null;this.nextTime=0;this.step=0;this.noiseBuffer=null;this.lastPhrase=-999}
 volumePercent(){const n=Number(state?.settings?.volumePercent);return Number.isFinite(n)?clamp(n,0,1000):100}
 applyVolume(){
  const pct=this.volumePercent(),gain=.19*(pct/100);
  if(this.output&&this.ctx){try{this.output.gain.cancelScheduledValues(this.ctx.currentTime);this.output.gain.setTargetAtTime(gain,this.ctx.currentTime,.012)}catch{this.output.gain.value=gain}}
  return pct;
 }
 ensure(){
  if(!this.ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;this.ctx=new AC();this.master=this.ctx.createGain();this.master.gain.value=1;this.output=this.ctx.createGain();if(this.ctx.createDynamicsCompressor){this.comp=this.ctx.createDynamicsCompressor();this.comp.threshold.value=-20;this.comp.knee.value=18;this.comp.ratio.value=4;this.comp.attack.value=.008;this.comp.release.value=.18;this.master.connect(this.comp);this.comp.connect(this.output)}else this.master.connect(this.output);this.output.connect(this.ctx.destination);this.applyVolume();this.makeNoise()}
  if(this.ctx?.state==='suspended')this.ctx.resume();this.applyVolume();
 }
 makeNoise(){if(!this.ctx)return;const len=this.ctx.sampleRate*2,b=this.ctx.createBuffer(1,len,this.ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;this.noiseBuffer=b}
 toneAt(freq,dur=.15,type='sine',vol=.08,at=null,detune=0){
  this.ensure();if(!this.ctx)return;const t=at??this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(Math.max(25,freq),t);o.detune.setValueAtTime(detune,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(.001,vol),t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+dur+.03)
 }
 noiseAt(dur=.12,vol=.05,at=null,filterType='bandpass',freq=1000){
  this.ensure();if(!this.ctx||!this.noiseBuffer)return;const t=at??this.ctx.currentTime,s=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();s.buffer=this.noiseBuffer;f.type=filterType;f.frequency.setValueAtTime(freq,t);f.Q.value=1.2;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+dur);s.connect(f);f.connect(g);g.connect(this.master);s.start(t);s.stop(t+dur+.02)
 }
 chordAt(root,degree,at,vol=.035,wave='triangle'){const r=root*SCALE[(degree+7)%7],third=r*(degree%2?6/5:5/4),fifth=r*3/2;this.toneAt(r,.5,wave,vol,at);this.toneAt(third,.48,wave,vol*.82,at+.006);this.toneAt(fifth,.45,wave,vol*.68,at+.012)}
 formantAt(root,degree,at,vol=.045){const base=root*SCALE[degree%7];this.toneAt(base,.42,'sawtooth',vol*.55,at);this.toneAt(base*2.01,.4,'sine',vol*.42,at);this.toneAt(base*3.02,.33,'sine',vol*.22,at);this.noiseAt(.3,vol*.12,at,'bandpass',900+degree*80)}
 worldFx(kind,at,vol=.045){
  if(kind==='fire'){this.noiseAt(.22,vol,at,'highpass',1200);this.toneAt(95,.12,'square',vol*.6,at)}
  else if(kind==='wave'){this.noiseAt(.52,vol,at,'lowpass',620);this.toneAt(110,.45,'sine',vol*.5,at)}
  else if(kind==='rustle'){this.noiseAt(.28,vol,at,'highpass',1800)}
  else if(kind==='space'){this.toneAt(680,.55,'sine',vol*.55,at);this.toneAt(1020,.5,'sine',vol*.3,at+.04)}
  else if(kind==='storm'){this.noiseAt(.45,vol*.85,at,'lowpass',380);this.toneAt(58,.5,'sine',vol,at)}
  else if(kind==='spore'){this.noiseAt(.3,vol*.55,at,'bandpass',720);this.toneAt(310,.22,'triangle',vol*.45,at+.03)}
  else if(kind==='ice'){this.toneAt(1100,.42,'sine',vol*.58,at);this.noiseAt(.2,vol*.3,at,'highpass',2400)}
 }
 speciesTone(m,role,step,at,profile,vol=.055){
  const h=hash(m.id),arr=ARRANGEMENTS[profile.id]||ARRANGEMENTS.verdant,barBeat=Math.floor(step/4),baseDeg=[0,2,4,5,3,1,6,4][(step+Math.floor(h/17))%8],deg=(m.track==='LEAD'?arr.lead[(step+(h%5))%arr.lead.length]:m.track==='BASS'?arr.bass[barBeat%arr.bass.length]:m.track==='CHORD'?arr.chords[barBeat%arr.chords.length]:m.track==='VOICE'?arr.chords[barBeat%arr.chords.length]:baseDeg),wave=['sine','triangle','square','sawtooth'][h%4],root=profile.root;
  if(role==='DRUM'){
   if(h%3===0){this.toneAt(55+deg*4,.16,'sine',vol*1.5,at);this.noiseAt(.055,vol*.34,at,'lowpass',220)}
   else if(h%3===1){this.noiseAt(.09,vol*.85,at,'bandpass',700);this.toneAt(150,.08,'triangle',vol*.5,at)}
   else{this.toneAt(95+deg*8,.13,'sine',vol,at);this.noiseAt(.045,vol*.25,at,'highpass',1600)}
  }else if(role==='PERC'){
   const metallic=m.elements.some(e=>['Metal','Crystal','Ice','Shell'].includes(e));this.noiseAt(.045,vol*(metallic?1:.65),at,'highpass',metallic?2500:1300);if(metallic)this.toneAt(600+(h%8)*80,.09,'sine',vol*.38,at)
  }else if(role==='BASS'){
   this.toneAt(root/2*SCALE[deg%5],.34,h%2?'sawtooth':'triangle',vol*1.05,at);this.toneAt(root/4,.3,'sine',vol*.55,at)
  }else if(role==='CHORD')this.chordAt(root,deg,at,vol*.72,wave==='square'?'triangle':wave);
  else if(role==='LEAD'){this.toneAt(root*1.5*SCALE[deg],.2,wave,vol*.82,at);if(h%4===0)this.toneAt(root*3*SCALE[deg],.13,'sine',vol*.2,at+.015)}
  else if(role==='VOICE')this.formantAt(root,deg,at,vol*.9);
  else if(role==='FX')this.worldFx(profile.fx,at,vol);
  else if(role==='TITAN'){
   this.toneAt(root/4,.65,'sawtooth',vol*1.25,at);this.toneAt(root/2,.58,'triangle',vol*.8,at);this.chordAt(root,[0,4][Math.floor(step/8)%2],at,vol*.48,'triangle');this.worldFx(profile.fx,at,vol*.55)
  }
  if(role!=='TITAN'){
   const e=m.elements||[];
   if(m.design==='deer'){
    this.toneAt(58,.12,'sine',vol*.7,at);this.toneAt(235,.055,'triangle',vol*.3,at+.018);this.toneAt(318,.05,'triangle',vol*.22,at+.055);this.noiseAt(.16,vol*.18,at+.025,'highpass',1900);
   }else if(e.includes('Flame')||e.includes('Smoke')){
    this.noiseAt(.09,vol*.1,at+.02,'highpass',1500);
   }else if(e.includes('Crystal')||e.includes('Ice')||e.includes('Frost')){
    this.toneAt(root*4*SCALE[deg%7],.08,'sine',vol*.09,at+.012);
   }else if(e.includes('Bubble')||e.includes('Shell')||e.includes('Coral')){
    this.toneAt(330+(deg*32),.07,'sine',vol*.08,at+.03,120);
   }else if(e.includes('Wood')||e.includes('Leaf')||e.includes('Root')){
    this.noiseAt(.08,vol*.075,at+.02,'highpass',1750);
   }else if(e.includes('Thunder')||e.includes('Electric')){
    this.noiseAt(.055,vol*.1,at+.01,'highpass',2300);
   }else if(e.includes('Spore')||e.includes('Glow')){
    this.toneAt(root*2.5,.12,'sine',vol*.065,at+.025);
   }
  }
 }
 activeByTrack(){
  const by=Object.fromEntries(TRACKS.map(t=>[t,[]]));
  const seen=new Set();for(const o of state.owned[state.currentIsland]||[]){if(seen.has(o.id))continue;seen.add(o.id);const m=monsterById[o.id];if(m)by[m.track].push({m,count:speciesCopies(m.id).length})}
  return by;
 }
 scheduleStep(step,at){
  if(!state.settings.music)return;const profile=islandById[state.currentIsland],by=this.activeByTrack(),s=step%32,bar=Math.floor(step/16);
  TRACKS.forEach((role,ti)=>{
   if(state.trackMute?.[state.currentIsland]?.[role])return;const group=by[role];if(!group?.length||!grooveHit(profile,role,s))return;
   const pick=group[(Math.floor(step/Math.max(1,4-ti%3))+bar)%group.length];const copyGain=Math.min(1.28,.9+(pick.count-1)*.12);const normalized=.055*copyGain/Math.max(1,Math.sqrt(group.length));this.speciesTone(pick.m,role,step,at,profile,normalized);
   const delay=Math.max(0,(at-this.ctx.currentTime)*1000);setTimeout(()=>{triggerSpecies(pick.m.id,role);pulseTrack(role)},delay);
   if(role==='VOICE'&&s===0&&bar-this.lastPhrase>=4&&state.settings.voices){this.lastPhrase=bar;setTimeout(()=>this.speakPhrase(profile.phrase),delay+40);this.worldFx(profile.fx,at+.62,.07);this.chordAt(profile.root,0,at+.78,.055,'triangle')}
  });
 }
 speakPhrase(text){
  const pct=this.volumePercent();if(!state.settings.voices||pct<=0||!('speechSynthesis'in window))return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.rate=.9;u.pitch=.72;u.volume=Math.min(1,.32*(pct/100));const voices=speechSynthesis.getVoices();const v=voices.find(v=>/en/i.test(v.lang)&&/male|daniel|alex|fred/i.test(v.name))||voices.find(v=>/en/i.test(v.lang));if(v)u.voice=v;speechSynthesis.speak(u)}catch{}
 }
 start(){
  this.ensure();this.stop();if(!this.ctx)return;this.nextTime=this.ctx.currentTime+.06;this.step=0;this.lastPhrase=-999;
  this.timer=setInterval(()=>{if(!state.settings.music||!this.ctx)return;const profile=islandById[state.currentIsland],stepDur=60/profile.bpm/4;while(this.nextTime<this.ctx.currentTime+.14){this.scheduleStep(this.step,this.nextTime);this.step++;this.nextTime+=stepDur}},25)
 }
 stop(){if(this.timer)clearInterval(this.timer);this.timer=null;try{speechSynthesis?.cancel()}catch{}}
 sfx(freq=660){if(!state.settings.sfx)return;this.toneAt(freq,.08,'sine',.07,this.ctx?.currentTime??null)}
 solo(m){this.ensure();if(!m)return;const p=islandById[m.island];const t=this.ctx?.currentTime+.03;for(let n=0;n<4;n++)this.speciesTone(m,m.track,n*2,t+n*.22,p,.085);for(let n=0;n<4;n++)setTimeout(()=>triggerSpecies(m.id,m.track),n*220)}
}
const audio=new AudioEngine();

function triggerSpecies(id,role){
 const els=[...document.querySelectorAll(`.monster[data-species="${CSS.escape(id)}"]`)];els.forEach(el=>{el.classList.remove('performing');void el.offsetWidth;el.classList.add('performing');setTimeout(()=>el.classList.remove('performing'),role==='TITAN'?650:460)})
}

function renderTop(){
 $('#coins').textContent=fmt(state.coins);$('#gems').textContent=fmt(state.gems);$('#stars').textContent=fmt(state.stars);$('#shards').textContent=fmt(state.titanShards);$('#candy').textContent=fmt(state.hexCandy);
 $('#islandLabel').textContent=islandById[state.currentIsland]?.name||'';
 const ev=halloweenWindow();$('#eventTopBtn').classList.toggle('hidden',!ev.active);
}
function scenePositions(list){
 const slots=[];const cols=9,rows=Math.max(1,Math.ceil(list.length/cols));for(let idx=0;idx<list.length;idx++){const row=Math.floor(idx/cols),col=idx%cols;const stagger=row%2?5:0;slots.push({x:7+col*10.8+stagger,y:35+row*(rows>3?13:16)+(col%3)*1.5})}return slots;
}
function renderScene(){
 const isl=islandById[state.currentIsland];document.documentElement.style.setProperty('--accent',isl.accent);$('#islandArt').innerHTML=islandArtSVG(isl.id);
 const ev=halloweenWindow(),r=$('#eventRibbon');$('#islandScene')?.classList.toggle('halloweenScene',ev.active);if(ev.active){r.classList.remove('hidden');r.innerHTML=`<b>Night of Echoes is active</b><small>Seasonal monsters and Hex Candy expire from acquisition in ${timeText(ev.remaining)}. Owned seasonals stay forever.</small>`}else r.classList.add('hidden');
 const layer=$('#monsterLayer');layer.innerHTML='';const list=state.owned[state.currentIsland]||[],pos=scenePositions(list);
 list.forEach((o,idx)=>{const m=monsterById[o.id];if(!m)return;const p=pos[idx]||{x:50,y:50};const el=document.createElement('button');el.className=`monster track-${m.track.toLowerCase()} design-${m.design} ${RARITIES[o.rarity].cls}${m.major?' major':''}${m.seasonal?' seasonal':''}`;el.dataset.species=m.id;el.dataset.uid=o.uid;el.dataset.track=m.track;el.style.left=`${clamp(p.x,5,95)}%`;el.style.top=`${clamp(p.y,22,82)}%`;el.innerHTML=`<span class="rarityRing"></span>${monsterSVG(m,o)}<span class="monsterName">${m.major?'TITAN · ':''}${esc(m.name)} · L${o.level}</span>`;el.onclick=()=>openMonster(o.uid);layer.appendChild(el)});
 if(!list.length)layer.innerHTML='<div class="emptyIsland">This stage is silent.<b>Buy or breed a performer to build the song.</b></div>';
 renderTimersOnly();
}
function renderTimersOnly(){const t=now();$('#breederText').textContent=state.breeding?(t>=state.breeding.end?'Finished':timeText(state.breeding.end-t)):'Ready';$('#nurseryText').textContent=state.nursery?(t>=state.nursery.end?'Ready to hatch':timeText(state.nursery.end-t)):'Empty';const qr=$('#questRefreshText');if(qr&&state.grindQuests)qr.textContent=timeText(state.grindQuests.endsAt-t)}
function render(){renderTop();renderScene();renderSongHud();hydrateIcons()}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast._t);toast._t=setTimeout(()=>t.classList.remove('show'),2300)}
function rewardLine({coins=0,gems=0,stars=0,shards=0,candy=0}){const a=[];if(coins)a.push(`${fmt(coins)} coins`);if(gems)a.push(`${gems} gems`);if(stars)a.push(`${stars} Stars`);if(shards)a.push(`${shards} Titan Shard${shards===1?'':'s'}`);if(candy)a.push(`${fmt(candy)} Hex Candy`);return a.join(' · ')}

function openIslands(){
 modal(`<h2>Islands</h2><p class="sub">Seven complete stages. Each island has its own tempo, eight-track arrangement, vocal phrase, world effects, and Titan.</p><div class="grid">${islands.map(i=>{const unlocked=state.unlocked.includes(i.id),active=state.currentIsland===i.id;return`<div class="card"><div class="islandThumb">${islandArtSVG(i.id,true)}</div><strong>${esc(i.name)}</strong><small>${esc(i.desc)}</small><small>${ownedOn(state,i.id)} performers · ${i.bpm} BPM</small>${unlocked?`<button data-visit="${i.id}" ${active?'disabled':''}>${active?'Current stage':'Visit island'}</button>`:`<button data-unlock="${i.id}">Unlock · ${fmt(i.unlock)} coins</button>`}</div>`}).join('')}</div>`);
 $$('[data-visit]').forEach(b=>b.onclick=()=>{state.currentIsland=b.dataset.visit;save();closeModal();render();audio.start()});
 $$('[data-unlock]').forEach(b=>b.onclick=()=>{const i=islandById[b.dataset.unlock];if(state.coins<i.unlock)return toast('Not enough coins.');state.coins-=i.unlock;state.stats.coinsSpent+=i.unlock;state.unlocked.push(i.id);state.currentIsland=i.id;addStars(2);save();closeModal();render();audio.start();toast(`${i.name} unlocked.`)})
}
function standardMarketSpecies(){return monsters.filter(m=>m.island===state.currentIsland&&!m.major&&!m.seasonal)}
function openMarket(){
 const available=standardMarketSpecies();modal(`<h2>Market</h2><p class="sub">Common eggs are sold for coins. Premium rarities upgrade one individual copy only; no result can ever downgrade another performer. Species cap: 3.</p><div class="grid"><div class="card"><strong>Resonance Spark</strong><small>Spend 3 gems for a random Rare egg, with a 10% chance to become Epic.</small><button id="dailySpark">Use Spark · 3 gems</button></div><div class="card"><strong>Collect Stage</strong><small>Empty every performer bank on the current island.</small><button id="collectAll">Collect all stored coins</button></div><div class="card"><strong>Star Workshop</strong><small>Spend Stars on rarity eggs, boosts, cosmetics, and timer finishes.</small><button id="starMarket" class="starBtn">Open Star Shop</button></div>${halloweenActive()?`<div class="card"><strong>Night of Echoes</strong><small>Spend Hex Candy on three seasonal monsters for this island.</small><button id="eventMarket" class="eventBtn">Open event market</button></div>`:''}</div><h3>Egg Catalogue</h3><div class="grid">${available.map(m=>{const copies=speciesCopies(m.id).length,full=copies>=3;return`<div class="card"><div class="miniMonster">${monsterSVG(m,{rarity:'Common'},true)}</div><strong>${esc(m.name)}</strong><small>${m.elements.join(' · ')} · ${TRACK_NAMES[m.track]}</small><small>${fmt(m.income)} coins/min at level 1 · ${copies}/3 owned</small><button data-buy="${m.id}" ${full?'disabled':''}>${full?'Species full':`Buy egg · ${fmt(m.base)} coins`}</button></div>`}).join('')}</div>`);
 $$('[data-buy]').forEach(b=>b.onclick=()=>buyEgg(b.dataset.buy));$('#collectAll').onclick=()=>{collectAll();openMarket()};$('#dailySpark').onclick=dailySpark;$('#starMarket').onclick=openStarShop;if($('#eventMarket'))$('#eventMarket').onclick=openHalloween;
}
function buyEgg(id){
 const m=monsterById[id];if(!m||m.major||m.seasonal)return;if(state.nursery)return toast('The Nursery is occupied.');if(!canAcceptEgg(id,'Common'))return toast('You already have 3 of that species.');if(state.coins<m.base)return toast('Not enough coins.');state.coins-=m.base;state.stats.coinsSpent+=m.base;state.stats.eggsBought++;const total=maxWaitSeconds(m,'Common'),hatch=splitWait(total).hatch;state.nursery={id,rarity:'Common',end:now()+hatch*1000,totalSec:hatch};save();render();openNursery();toast(`${m.name} egg sent to the Nursery.`)
}
function dailySpark(){
 if(state.nursery)return toast('The Nursery is occupied.');if(state.gems<3)return toast('You need 3 gems.');const rarity=Math.random()<.1?'Epic':'Rare',pool=availableSpecies(state.currentIsland,{includeMajor:false,includeSeasonal:false,rarity});if(!pool.length)return toast(`No ${rarity} upgrades are available here.`);state.gems-=3;const m=pool[Math.floor(Math.random()*pool.length)],hatch=splitWait(maxWaitSeconds(m,rarity)).hatch;state.nursery={id:m.id,rarity,end:now()+hatch*1000,totalSec:hatch};save();render();openNursery();toast(`${rarity} ${m.name} egg created.`)
}
function openStarShop(){
 const amp=state.boosts.income[state.currentIsland]||0,ampCost=8+amp*6,glow=!!state.cosmetics.starlight[state.currentIsland];const jobs=[['Breeding',state.breeding],['Nursery',state.nursery]].filter(([,j])=>j&&j.end>now()).sort((a,b)=>a[1].end-b[1].end);const finishCost=jobs.length?Math.max(2,skipCost(jobs[0][1].end-now())):0;
 modal(`<h2>Star Workshop</h2><p class="sub">Stars are permanent progression currency. They are earned from quests, hatches, daily rewards, islands, and strong mini-game runs.</p><div class="gameBox"><b>${fmt(state.stars)} Stars available</b><small class="tiny">${fmt(state.lifetimeStars)} earned all-time</small></div><div class="grid"><div class="card"><strong>Rare Resonance Egg</strong><small>Random Rare upgrade for this island.</small><button data-star-egg="Rare" data-cost="5">Create · 5 Stars</button></div><div class="card"><strong>Epic Resonance Egg</strong><small>Random Epic upgrade for this island.</small><button data-star-egg="Epic" data-cost="12">Create · 12 Stars</button></div><div class="card"><strong>Legendary Resonance Egg</strong><small>Random Legendary upgrade for this island.</small><button data-star-egg="Legendary" data-cost="26">Create · 26 Stars</button></div><div class="card"><strong>Stage Amplifier +10%</strong><small>Permanent coin production boost on ${islandById[state.currentIsland].name}. Current: +${amp*10}%.</small><button id="buyAmp">Upgrade · ${ampCost} Stars</button></div><div class="card"><strong>Starlight Stage</strong><small>Permanent night-glow cosmetic for the current island.</small><button id="buyGlow" ${glow?'disabled':''}>${glow?'Owned':'Unlock · 15 Stars'}</button></div><div class="card"><strong>Finish Earliest Timer</strong><small>${jobs.length?`${jobs[0][0]} has ${timeText(jobs[0][1].end-now())} remaining.`:'No active timer.'}</small><button id="starFinish" ${jobs.length?'':'disabled'}>${jobs.length?`Finish · ${finishCost} Stars`:'Nothing to finish'}</button></div></div>`);
 $$('[data-star-egg]').forEach(b=>b.onclick=()=>buyStarEgg(b.dataset.starEgg,+b.dataset.cost));$('#buyAmp').onclick=()=>{if(state.stars<ampCost)return toast('Not enough Stars.');state.stars-=ampCost;state.stats.starsSpent+=ampCost;state.boosts.income[state.currentIsland]=amp+1;save();renderTop();openStarShop();toast('Stage income permanently increased by 10%.')};$('#buyGlow').onclick=()=>{if(glow)return;if(state.stars<15)return toast('Not enough Stars.');state.stars-=15;state.stats.starsSpent+=15;state.cosmetics.starlight[state.currentIsland]=true;save();render();openStarShop()};$('#starFinish').onclick=()=>{if(!jobs.length)return;if(state.stars<finishCost)return toast('Not enough Stars.');state.stars-=finishCost;state.stats.starsSpent+=finishCost;jobs[0][1].end=now();save();processTimers();render();openStarShop()}
}
function buyStarEgg(rarity,cost){if(state.nursery)return toast('The Nursery is occupied.');if(state.stars<cost)return toast('Not enough Stars.');const pool=availableSpecies(state.currentIsland,{includeMajor:false,includeSeasonal:false,rarity});if(!pool.length)return toast(`No ${rarity} upgrades are available here.`);state.stars-=cost;state.stats.starsSpent+=cost;const m=pool[Math.floor(Math.random()*pool.length)],hatch=splitWait(maxWaitSeconds(m,rarity)).hatch;state.nursery={id:m.id,rarity,end:now()+hatch*1000,totalSec:hatch};save();render();openNursery()}

function ownedOptions(){return(state.owned[state.currentIsland]||[]).map(o=>{const m=monsterById[o.id];return`<option value="${o.uid}">${esc(m.name)} · ${o.rarity} · L${o.level}</option>`}).join('')}
function openBreed(){openBreeder()}
function openBreeder(){
 const list=state.owned[state.currentIsland]||[];if(list.length<2)return modal('<h2>Harmony Hut</h2><p class="sub">You need at least two individual performers on this island before breeding.</p>');
 const prime=monsters.find(m=>m.island===state.currentIsland&&m.major);modal(`<h2>Harmony Hut</h2><p class="sub">Every breeding attempt rolls a true 2% Titan chance first. During Night of Echoes, it also has an 8% seasonal roll after the Titan roll. All Breed → Hatch journeys stay under 60 minutes total.</p><div class="pair"><label class="selectMonster">Parent A<select id="parentA">${ownedOptions()}</select></label><label class="selectMonster">Parent B<select id="parentB">${ownedOptions()}</select></label></div><div id="breedPreview" class="gameBox"></div><button id="breedGo" class="bigBtn">Start breeding</button>`);
 const a=$('#parentA'),b=$('#parentB');if(list[1])b.value=list[1].uid;const preview=()=>{const oa=getOwned(a.value),ob=getOwned(b.value);if(!oa||!ob)return;const elems=[...new Set([...monsterById[oa.id].elements,...monsterById[ob.id].elements])];$('#breedPreview').innerHTML=`<b>Element pool</b><p>${elems.join(' · ')}</p><small class="tiny">Titan roll: 2% · ${esc(prime.name)}. Seasonal roll: ${halloweenActive()?'8% while the event is active':'inactive'}. Duplicate species are capped at three.</small>`};a.onchange=preview;b.onchange=preview;preview();$('#breedGo').onclick=()=>startBreed(a.value,b.value)
}
function startBreed(aid,bid){
 if(aid===bid)return toast('Pick two different individual performers.');if(state.breeding)return toast('Harmony Hut is already busy.');if(state.nursery&&now()>=state.nursery.end)return toast('Hatch the waiting Nursery egg first.');const a=getOwned(aid),b=getOwned(bid);if(!a||!b)return;
 const rarity=rarityRoll(a,b),prime=monsters.find(m=>m.island===state.currentIsland&&m.major);let result=null,primeHit=!!prime&&Math.random()<.02,seasonalHit=false;
 if(primeHit)result=prime;
 else if(halloweenActive()&&Math.random()<.08){const pool=monsters.filter(m=>m.island===state.currentIsland&&m.seasonal&&canAcceptEgg(m.id,rarity));if(pool.length){result=pool[Math.floor(Math.random()*pool.length)];seasonalHit=true}}
 if(!result){const pool=breedPool(a,b,state.currentIsland,rarity);result=chooseWeighted(pool)||monsterById[a.id]}
 const total=maxWaitSeconds(result,rarity),times=splitWait(total);state.breeding={resultId:result.id,rarity,end:now()+times.breed*1000,totalSec:times.breed,hatchSec:times.hatch,prime:primeHit,seasonal:seasonalHit};state.stats.breeds++;if(halloweenActive())addCandy(8+Math.floor(Math.random()*8));save();render();openBreedingTimer();toast(primeHit?'The Resonator surged. A Titan egg is forming.':seasonalHit?'A Night of Echoes signature entered the egg.':'Breeding started.')
}
function openBreedingTimer(){
 if(!state.breeding)return openBreeder();const j=state.breeding,m=monsterById[j.resultId],left=j.end-now(),done=left<=0;modal(`<h2>Harmony Hut</h2><div class="monsterPortrait ${m.major?'major':''}">${monsterSVG(m,{rarity:j.rarity})}</div><p class="sub">The result stays hidden by the shell, but its resonance signature is already locked.</p><div class="timer">${done?'Finished':timeText(left)}</div>${done?'<button id="moveEgg" class="bigBtn">Move egg to Nursery</button>':`<button id="skipBreed" class="bigBtn secondary">Finish now · ${skipCost(left)} gems</button>`}`);if(done)$('#moveEgg').onclick=()=>{processTimers();openNursery()};else $('#skipBreed').onclick=()=>{const c=skipCost(left);if(state.gems<c)return toast('Not enough gems.');state.gems-=c;state.breeding.end=now();save();processTimers();render();openNursery()}
}
function openNursery(){
 if(!state.nursery)return modal('<h2>Nursery</h2><p class="sub">No egg is waiting. Buy one in the Market or breed two performers.</p>');const j=state.nursery,m=monsterById[j.id],left=j.end-now(),done=left<=0;modal(`<h2>Nursery</h2><div class="monsterPortrait"><svg viewBox="0 0 120 120"><defs><linearGradient id="eggG"><stop stop-color="${m.colors[0]}"/><stop offset="1" stop-color="${m.colors[1]}"/></linearGradient></defs><path d="M60 10c-27 0-43 50-43 73 0 19 17 28 43 28s43-9 43-28c0-23-16-73-43-73z" fill="url(#eggG)" stroke="#fff8" stroke-width="4"/><path d="M32 73q28 15 56 0" fill="none" stroke="#fff5" stroke-width="5"/></svg></div><strong>${esc(j.rarity)} resonance egg</strong><div class="timer">${done?'Ready to hatch':timeText(left)}</div>${done?'<button id="hatchEgg" class="bigBtn">Hatch egg</button>':`<button id="skipHatch" class="bigBtn secondary">Finish now · ${skipCost(left)} gems</button>`}`);if(done)$('#hatchEgg').onclick=hatchEgg;else $('#skipHatch').onclick=()=>{const c=skipCost(left);if(state.gems<c)return toast('Not enough gems.');state.gems-=c;state.nursery.end=now();save();render();openNursery()}
}
function hatchEgg(){
 const j=state.nursery;if(!j||now()<j.end)return;const m=monsterById[j.id],copies=speciesCopies(j.id),target=rarityRank(j.rarity);let message='';
 const candidates=copies.filter(o=>rarityRank(o.rarity)<target).sort((a,b)=>rarityRank(b.rarity)-rarityRank(a.rarity));
 if(candidates.length){const chosen=candidates[0],old=chosen.rarity;chosen.rarity=j.rarity;chosen.lastCollect=now();message=`One ${m.name} upgraded from ${old} to ${j.rarity}. The other copies were untouched.`}
 else if(copies.length<3){const idx=(state.owned[m.island]||[]).length,statePos=scenePositions(Array.from({length:idx+1}))[idx]||{x:50,y:55};state.owned[m.island].push({uid:uid(),id:m.id,rarity:j.rarity,level:1,lastCollect:now(),x:statePos.x,y:statePos.y});message=`A new ${j.rarity} ${m.name} joined the island.`}
 else{const refund=Math.round(m.base*RARITIES[j.rarity].mult*.45);state.coins+=refund;message=`All three ${m.name} performers are already ${j.rarity} or stronger, so the overflow resonance became ${fmt(refund)} coins.`}
 state.discovered[`${m.id}|${j.rarity}`]=true;state.stats.hatches++;if(m.seasonal)state.stats.seasonals++;let stars=j.rarity==='Rare'?1:j.rarity==='Epic'?2:j.rarity==='Legendary'?4:0;if(m.major)stars+=3;if(stars)addStars(stars);if(halloweenActive())addCandy(12+target*8+(m.seasonal?25:0));state.nursery=null;save();render();audio.solo(m);modal(`<h2>${esc(m.name)}</h2><div class="monsterPortrait ${m.major?'major':''}">${monsterSVG(m,{rarity:j.rarity})}</div><p><b>${esc(j.rarity)} ${m.major?'Titan':'performer'}</b></p><p class="sub">${esc(message)}</p>${stars?`<p class="tiny">Hatch bonus: ${stars} Stars.</p>`:''}<button id="hatchDone" class="bigBtn">Return to island</button>`);$('#hatchDone').onclick=closeModal;haptic(30)
}


function discoveredCount(){return Object.keys(state.discovered||{}).length}
function storageHours(o){const r=Math.max(.001,calcRate(o));return capacity(o)/r/60}
function levelCost(o){const m=monsterById[o.id];return Math.max(120,Math.round((m.base*.16+75)*Math.pow(o.level,1.28)*RARITIES[o.rarity].mult))}
function pulseTrack(role){const el=document.querySelector(`.meter[data-track="${role}"]`);if(!el)return;el.classList.add('hot');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('hot'),170)}
function ensureTrackState(){state.trackMute=state.trackMute||{};state.trackMute[state.currentIsland]=state.trackMute[state.currentIsland]||{};return state.trackMute[state.currentIsland]}
function renderSongHud(){
 const h=$('#songHud');if(!h)return;const isl=islandById[state.currentIsland],mute=ensureTrackState(),counts=Object.fromEntries(TRACKS.map(t=>[t,0]));const seen=new Set();for(const o of state.owned[state.currentIsland]||[]){if(seen.has(o.id))continue;seen.add(o.id);const m=monsterById[o.id];if(m)counts[m.track]++}
 h.innerHTML=`<div class="songTitle"><b>${esc(isl.name)} arrangement</b><span>${isl.bpm} BPM · 8 tracks</span></div><div class="trackMeters">${TRACKS.map(t=>`<button class="meter ${mute[t]?'muted':''}" data-track="${t}" title="${esc(TRACK_NAMES[t])}"><i></i><small>${t==='TITAN'?'T':t[0]}</small></button>`).join('')}</div><button id="hudMixer" class="musicButton">Open mixer</button>`;
 h.querySelectorAll('.meter').forEach(b=>b.onclick=e=>{e.stopPropagation();mute[b.dataset.track]=!mute[b.dataset.track];save();renderSongHud()});$('#hudMixer').onclick=openMixer
}

function openMonster(uidv){
 const o=getOwned(uidv);if(!o)return;const m=monsterById[o.id],stored=pendingCoins(o),cap=capacity(o),rate=calcRate(o),cost=levelCost(o),hours=storageHours(o),maxed=o.level>=20;
 modal(`<h2>${esc(m.name)}</h2><div class="monsterDetail"><div class="monsterPortrait ${m.major?'major':''}">${monsterSVG(m,o)}</div><div><div class="rarityLabel ${o.rarity.toLowerCase()}">${esc(o.rarity)}${m.major?' · Titan':''}${m.seasonal?' · Seasonal':''}</div><p class="sub">${esc(m.bio)}</p><div class="statGrid"><div><b>${fmt(Math.round(rate))}/min</b><span>coin production</span></div><div><b>${fmt(cap)}</b><span>max stored</span></div><div><b>${hours.toFixed(hours<10?1:0)} h</b><span>storage time</span></div><div><b>${TRACK_NAMES[m.track]}</b><span>song role</span></div></div></div></div><div class="bankPanel"><div><b>Stored coins</b><span>${fmt(stored)} / ${fmt(cap)}</span></div><div class="progress"><i style="width:${clamp(stored/cap*100,0,100)}%"></i></div><button id="collectOne" class="bigBtn">Collect ${fmt(stored)} coins</button></div><div class="gameBox"><b>Level ${o.level} / 20</b><p class="sub">Levels boost production by 22% per level and storage time rises quadratically. Upgrading also auto-collects the current bank so progress is never erased.</p><button id="levelUp" class="bigBtn" ${maxed?'disabled':''}>${maxed?'Maximum level':`Level up · ${fmt(cost)} coins`}</button></div><div class="gameBox"><b>Elements</b><p>${m.elements.map(esc).join(' · ')}</p><button id="soloBtn" class="bigBtn secondary">Hear this performer solo</button></div>`);
 $('#collectOne').onclick=()=>{const n=collectMonster(o);renderTop();openMonster(uidv);toast(n?`Collected ${fmt(n)} coins.`:'Bank is still filling.')};
 $('#levelUp').onclick=()=>{if(maxed)return;const banked=pendingCoins(o);if(banked>0){state.coins+=banked;state.stats.coinsCollected+=banked;state.stats.monsterCollects++;o.lastCollect=now()}if(state.coins<cost){save();renderTop();return toast('Not enough coins. Stored coins were collected first.')}state.coins-=cost;state.stats.coinsSpent+=cost;o.level++;state.stats.feeds++;o.lastCollect=now();save();render();openMonster(uidv);toast(`Level ${o.level}. Storage and income increased.`)};
 $('#soloBtn').onclick=()=>{state.stats.solos++;audio.solo(m);save();haptic(12)}
}

function openBook(){
 const current=state.currentIsland,all=monsters.filter(m=>m.island===current),forms=all.length*4;
 modal(`<h2>Chordex</h2><p class="sub">${esc(islandById[current].name)} · ${all.length} species · ${forms} rarity forms. Seasonal entries remain visible after the event, even when they cannot be obtained.</p><div class="islandTabs">${islands.map(i=>`<button data-book-island="${i.id}" class="${i.id===current?'active':''}">${esc(i.name.replace(' Isle','').replace(' Crag','').replace(' Key','').replace(' Atoll','').replace(' Mesa','').replace(' Hollow','').replace(' Reach',''))}</button>`).join('')}</div><div class="grid bookGrid">${all.map(m=>{const copies=speciesCopies(m.id),discs=rarityOrder.filter(r=>state.discovered[`${m.id}|${r}`]),known=discs.length>0||copies.length>0;return`<div class="card bookCard ${known?'':'locked'}"><div class="miniMonster">${known?monsterSVG(m,{rarity:discs.at(-1)||copies[0]?.rarity||'Common'},true):'<div class="silhouette"></div>'}</div><strong>${known?esc(m.name):'Undiscovered'}</strong><small>${m.major?'Titan · ':m.seasonal?'Seasonal · ':''}${TRACK_NAMES[m.track]}</small><div class="rarityDots">${rarityOrder.map(r=>`<i class="${state.discovered[`${m.id}|${r}`]?'on':''} ${r.toLowerCase()}" title="${r}"></i>`).join('')}</div>${known?`<small>${esc(m.bio)}</small>`:''}</div>`}).join('')}</div>`);
 $$('[data-book-island]').forEach(b=>b.onclick=()=>{if(!state.unlocked.includes(b.dataset.bookIsland))return toast('Unlock that island first.');state.currentIsland=b.dataset.bookIsland;save();openBook();render()})
}

function openMixer(){
 const mute=ensureTrackState(),seen=new Set(),by=Object.fromEntries(TRACKS.map(t=>[t,[]]));for(const o of state.owned[state.currentIsland]||[]){if(seen.has(o.id))continue;seen.add(o.id);const m=monsterById[o.id];if(m)by[m.track].push(m)}
 modal(`<h2>8-Track Mixer</h2><p class="sub">Duplicates of the same species are intentionally phase-locked: all copies animate and sound at the exact same musical instant. They only add a small fullness boost, never a 0.1-second echo chain.</p><div class="trackList">${TRACKS.map(t=>`<div class="trackRow ${mute[t]?'muted':''}"><div class="trackBadge">${icon(t==='VOICE'?'music':t==='TITAN'?'resonator':'mixer')}</div><div><b>${esc(TRACK_NAMES[t])}</b><small>${by[t].length?by[t].map(m=>m.name).join(' · '):'No performer on this track yet'}</small></div><button data-mute-track="${t}">${mute[t]?'Unmute':'Mute'}</button></div>`).join('')}</div><div class="gameBox"><b>Arrangement drop</b><p class="sub">When a vocal phrase lands, the island follows it with its world effect and a full chord hit. Each island has a different phrase, tempo, root note, and FX palette.</p><button id="phraseTest" class="bigBtn">Test island phrase + drop</button></div>`);
 $$('[data-mute-track]').forEach(b=>b.onclick=()=>{mute[b.dataset.muteTrack]=!mute[b.dataset.muteTrack];save();openMixer();renderSongHud()});$('#phraseTest').onclick=()=>{audio.ensure();audio.speakPhrase(islandById[state.currentIsland].phrase);const p=islandById[state.currentIsland],t=(audio.ctx?.currentTime||0)+.65;audio.worldFx(p.fx,t,.08);audio.chordAt(p.root,0,t+.18,.06,'triangle')}
}

function titanForIsland(id=state.currentIsland){return monsters.find(m=>m.island===id&&m.major)}
function openResonator(){
 const m=titanForIsland(),copies=speciesCopies(m.id),cost=10,full=copies.length>=3&&copies.every(o=>o.rarity==='Legendary');
 modal(`<h2>Titan Resonator</h2><div class="monsterPortrait major">${monsterSVG(m,{rarity:copies[0]?.rarity||'Common'})}</div><p class="sub">${esc(m.bio)}</p><div class="statGrid"><div><b>2%</b><span>every breeding attempt</span></div><div><b>${state.titanShards} / ${cost}</b><span>shards for guaranteed summon</span></div><div><b>${copies.length}/3</b><span>${esc(m.name)} owned</span></div><div><b>${fmt(m.income)}/min</b><span>level 1 production</span></div></div><div class="gameBox"><b>Guaranteed Resonance</b><p class="sub">Grind all 10 two-hour quests, daily rewards, and mini-games for Titan Shards. Spend ${cost} to create a guaranteed Titan egg for this island.</p><button id="summonTitan" class="bigBtn" ${(state.titanShards<cost||state.nursery||full)?'disabled':''}>${state.nursery?'Nursery occupied':full?'Titan species full':state.titanShards<cost?`Need ${cost-state.titanShards} more shards`:`Summon Titan · ${cost} shards`}</button></div>`);
 const b=$('#summonTitan');if(b)b.onclick=()=>{if(state.nursery||state.titanShards<cost||full)return;state.titanShards-=cost;let rarity;if(copies.length>=3){const weakest=Math.min(...copies.map(o=>rarityRank(o.rarity)));const target=Math.min(3,weakest+1+(Math.random()<.12?1:0));rarity=rarityOrder[target]}else rarity=Math.random()<.04?'Epic':Math.random()<.24?'Rare':'Common';const hatch=Math.min(1200,splitWait(maxWaitSeconds(m,rarity)).hatch);state.nursery={id:m.id,rarity,end:now()+hatch*1000,totalSec:hatch,prime:true,resonator:true};save();render();openNursery();toast(`${m.name} resonance locked. Guaranteed Titan egg created.`)}
}

function openHalloween(){
 const ev=halloweenWindow(),pool=monsters.filter(m=>m.island===state.currentIsland&&m.seasonal);if(!ev.active)return modal(`<h2>Night of Echoes</h2><p class="sub">The event is closed. Halloween monsters you already own stay permanently, but Hex Candy and seasonal monsters cannot be obtained again until the event returns.</p>`);
 modal(`<h2>Night of Echoes</h2><p class="sub">Ends November 2 at 12:00 AM on your device. At that moment, Hex Candy stops dropping and all event shop/breeding acquisition closes automatically. Owned seasonal monsters remain playable forever.</p><div class="eventBalance">${icon('candy')}<b>${fmt(state.hexCandy)} Hex Candy</b><span>${timeText(ev.remaining)} remaining</span></div><div class="grid">${pool.map(m=>{const copies=speciesCopies(m.id).length,full=copies>=3;return`<div class="card seasonalCard"><div class="miniMonster">${monsterSVG(m,{rarity:'Common'},true)}</div><strong>${esc(m.name)}</strong><small>${TRACK_NAMES[m.track]} · ${fmt(m.income)} coins/min</small><small>${esc(m.bio)}</small><button data-event-buy="${m.id}" ${full?'disabled':''}>${full?'Species full':`Create egg · ${fmt(m.eventCost)} Hex Candy`}</button></div>`}).join('')}</div><div class="gameBox"><b>How to earn Hex Candy</b><p class="sub">Breeding attempts, hatches, repeatable quests, daily gifts, and mini-games all pay event currency while Night of Echoes is active.</p></div>`);
 $$('[data-event-buy]').forEach(b=>b.onclick=()=>{const m=monsterById[b.dataset.eventBuy];if(!halloweenActive())return openHalloween();if(state.nursery)return toast('The Nursery is occupied.');if(state.hexCandy<m.eventCost)return toast('Not enough Hex Candy.');if(!canAcceptEgg(m.id,'Common'))return toast('That species is already full.');state.hexCandy-=m.eventCost;const hatch=Math.min(900,splitWait(maxWaitSeconds(m,'Common')).hatch);state.nursery={id:m.id,rarity:'Common',end:now()+hatch*1000,totalSec:hatch,seasonal:true};save();render();openNursery()})
}

function openQuests(){
 ensureGrindBoard();const board=state.grindQuests;
 const permanent=questDefs.map(q=>{const done=q.check(state),claimed=!!state.questClaims[q.id];return`<div class="questRow"><header><b>${esc(q.title)}</b><span>${claimed?'Claimed':done?'Ready':'In progress'}</span></header><small>${esc(q.desc)}</small><p class="tiny">Reward: ${fmt(q.coins)} coins · ${q.gems} gems</p><button data-pquest="${q.id}" ${(!done||claimed)?'disabled':''}>${claimed?'Claimed':'Claim reward'}</button></div>`}).join('');
 const repeats=board.items.map(q=>{const p=Math.min(q.target,grindProgress(q)),ready=p>=q.target;return`<div class="questRow repeatQuest"><header><b>${esc(q.title)}</b><span>${q.claimed?'Claimed':`${p}/${q.target}`}</span></header><small>${esc(q.verb)}</small><div class="progress"><i style="width:${p/q.target*100}%"></i></div><p class="tiny">${rewardLine(q)}</p><button data-gquest="${q.id}" ${(!ready||q.claimed)?'disabled':''}>${q.claimed?'Claimed':'Claim reward'}</button></div>`}).join('');
 const complete=boardComplete();modal(`<h2>Quests</h2><div class="questRefresh"><div><b>10 repeatable quests</b><small>Entire board refreshes every 2 hours.</small></div><div><span id="questRefreshText">${timeText(board.endsAt-now())}</span></div></div><div class="grid repeatGrid">${repeats}</div><div class="boardBonus"><b>Board clear bonus</b><span>Claim all 10: 2 Titan Shards + 5 Stars + ${halloweenActive()?'150 Hex Candy + ':''}${fmt(Math.max(10000,Math.round(totalRate()*30)))} coins</span><button id="boardBonus" ${(complete&&!board.bonusClaimed)?'':'disabled'}>${board.bonusClaimed?'Claimed':complete?'Claim bonus':'Finish all 10'}</button></div><h3>Permanent quests</h3>${permanent}`);
 $$('[data-pquest]').forEach(b=>b.onclick=()=>{const q=questDefs.find(x=>x.id===b.dataset.pquest);if(!q||state.questClaims[q.id]||!q.check(state))return;state.questClaims[q.id]=true;state.coins+=q.coins;state.gems+=q.gems;addStars(1);save();renderTop();openQuests();toast('Permanent quest claimed.')});
 $$('[data-gquest]').forEach(b=>b.onclick=()=>{const q=board.items.find(x=>x.id===b.dataset.gquest);if(!q||q.claimed||grindProgress(q)<q.target)return;q.claimed=true;state.coins+=q.coins;state.gems+=q.gems;if(q.stars)addStars(q.stars);if(q.candy)addCandy(q.candy);save();renderTop();openQuests();toast('Repeatable quest claimed.')});
 $('#boardBonus').onclick=()=>{if(!boardComplete()||board.bonusClaimed)return;board.bonusClaimed=true;state.grindBoardsCleared=(state.grindBoardsCleared||0)+1;const coins=Math.max(10000,Math.round(totalRate()*30));state.coins+=coins;addStars(5);addShards(2);if(halloweenActive())addCandy(150);save();renderTop();openQuests();toast('Board clear bonus claimed: Titan Shards earned.')}
}

// ---------- Arcade, daily rewards, settings, startup ----------
let activeMiniGame=null;
function stopMiniGame(){
 if(!activeMiniGame)return;
 for(const id of activeMiniGame.timers||[])clearTimeout(id),clearInterval(id);
 activeMiniGame=null;
}
function modal(html){stopMiniGame();$('#modalContent').innerHTML=html;$('#modal').classList.remove('hidden');hydrateIcons($('#modalContent'))}
function closeModal(){stopMiniGame();$('#modal').classList.add('hidden')}

function arcadeReward(score,tier=1){
 const base=Math.max(900,Math.round(totalRate()*Math.max(2,1.2+tier)));
 const coins=Math.round(base*(1+Math.min(3,score/20))),stars=score>=12?1+(score>=22?1:0):0,gems=score>=28?1:0;
 state.coins+=coins;if(stars)addStars(stars);state.gems+=gems;if(halloweenActive())addCandy(Math.max(8,Math.round(score*1.8)));
 state.stats.miniGames=(state.stats.miniGames||0)+1;save();renderTop();return{coins,stars,gems,candy:halloweenActive()?Math.max(8,Math.round(score*1.8)):0};
}
function openGames(){
 modal(`<h2>Orchestra Arcade</h2><p class="sub">Short skill games give useful coins, Stars, gems, Titan Shards, and event currency. No emoji buttons — the games use the same visual language as the islands.</p><div class="grid arcadeGrid">
 <div class="card gameTile"><div class="gameSigil rushSigil"><i></i><i></i><i></i></div><strong>Resonance Rush</strong><small>Hit moving resonance nodes for 18 seconds. Fast streaks multiply the score.</small><button id="rushGame">Play Rush</button></div>
 <div class="card gameTile"><div class="gameSigil memorySigil"><i></i><i></i><i></i><i></i></div><strong>Chord Memory</strong><small>Match six pairs of real monster portraits from your unlocked islands.</small><button id="memoryGame">Play Memory</button></div>
 <div class="card gameTile"><div class="gameSigil beatSigil"><i></i><i></i><i></i><i></i></div><strong>Beat Echo</strong><small>Listen to an expanding four-pad rhythm and repeat it exactly.</small><button id="echoGame">Play Beat Echo</button></div>
 </div><div class="gameBox"><b>Shard milestone</b><p class="sub">Every 8 completed mini-games awards 1 Titan Shard. That gives you a second dependable path toward guaranteed Titans besides the 2% breeding roll.</p><span class="tiny">Progress: ${(state.stats.miniGames||0)%8} / 8 toward the next shard</span></div>`);
 $('#rushGame').onclick=startRush;$('#memoryGame').onclick=startMemory;$('#echoGame').onclick=startBeatEcho;
}
function miniGameFinished(name,score,reward){
 const before=Math.floor(((state.stats.miniGames||0)-1)/8),after=Math.floor((state.stats.miniGames||0)/8);let shard=0;if(after>before){addShards(1);shard=1;save()}
 modal(`<h2>${esc(name)} complete</h2><div class="scoreBurst"><b>${score}</b><span>score</span></div><p class="sub">${rewardLine({...reward,shards:shard})}</p><button id="againArcade" class="bigBtn">Back to Arcade</button>`);$('#againArcade').onclick=openGames;
}
function startRush(){
 modal(`<h2>Resonance Rush</h2><div class="rushHeader"><b id="rushScore">0</b><span>score</span><b id="rushTime">18.0</b><span>seconds</span></div><div id="rushField" class="rushField"><div class="rushGrid"></div></div><p class="sub">Tap the glowing nodes. A clean streak grows the next node and raises its value.</p>`);
 const field=$('#rushField'),scoreEl=$('#rushScore'),timeEl=$('#rushTime');let score=0,streak=0,end=performance.now()+18000,lastHit=0;activeMiniGame={timers:[]};
 const spawn=()=>{if(!activeMiniGame||performance.now()>=end)return;field.querySelectorAll('.rushNode').forEach(n=>n.remove());const n=document.createElement('button');n.className='rushNode';const x=8+Math.random()*80,y=10+Math.random()*74,size=42+Math.min(24,streak*2);n.style.cssText=`left:${x}%;top:${y}%;width:${size}px;height:${size}px`;n.innerHTML='<i></i>';n.onclick=()=>{const t=performance.now();streak=(t-lastHit<1050)?streak+1:1;lastHit=t;score+=1+Math.floor(streak/4);scoreEl.textContent=score;audio.sfx(430+streak*22);haptic(8);spawn()};field.appendChild(n)};spawn();
 const timer=setInterval(()=>{if(!activeMiniGame)return;const left=Math.max(0,end-performance.now());timeEl.textContent=(left/1000).toFixed(1);if(left<=0){clearInterval(timer);field.querySelectorAll('.rushNode').forEach(n=>n.remove());const reward=arcadeReward(score,1);miniGameFinished('Resonance Rush',score,reward)}},80);activeMiniGame.timers.push(timer);
}
function startMemory(){
 const unlockedPool=monsters.filter(m=>state.unlocked.includes(m.island)&&!m.major&&!m.seasonal);const pool=[...unlockedPool].sort(()=>Math.random()-.5).slice(0,6);const deck=[...pool,...pool].sort(()=>Math.random()-.5).map((m,i)=>({m,k:i}));
 modal(`<h2>Chord Memory</h2><div class="memoryStats"><b id="memoryMoves">0 moves</b><span id="memoryPairs">0 / 6 pairs</span></div><div id="memoryBoard" class="memoryBoard">${deck.map((x,i)=>`<button class="memoryCard" data-memory="${i}"><span class="cardBack">C</span><span class="cardFace">${monsterSVG(x.m,{rarity:'Common'},true)}<small>${esc(x.m.name)}</small></span></button>`).join('')}</div>`);
 let first=null,lock=false,moves=0,pairs=0;activeMiniGame={timers:[]};$$('[data-memory]').forEach(btn=>btn.onclick=()=>{if(lock||btn.classList.contains('matched')||btn===first)return;btn.classList.add('revealed');if(!first){first=btn;audio.sfx(520);return}moves++;$('#memoryMoves').textContent=`${moves} moves`;const a=deck[+first.dataset.memory].m.id,b=deck[+btn.dataset.memory].m.id;if(a===b){first.classList.add('matched');btn.classList.add('matched');first=null;pairs++;$('#memoryPairs').textContent=`${pairs} / 6 pairs`;audio.sfx(760);if(pairs===6){const score=Math.max(8,32-moves);state.stats.memoryWins=(state.stats.memoryWins||0)+1;const reward=arcadeReward(score,2);const tid=setTimeout(()=>miniGameFinished('Chord Memory',score,reward),450);activeMiniGame.timers.push(tid)}}else{lock=true;audio.sfx(250);const old=first;const tid=setTimeout(()=>{old.classList.remove('revealed');btn.classList.remove('revealed');first=null;lock=false},650);activeMiniGame.timers.push(tid)}})
}
function beatPadTone(idx){audio.ensure();const root=islandById[state.currentIsland].root,[role,deg]=[['DRUM',0],['BASS',2],['CHORD',4],['LEAD',6]][idx];audio.speciesTone({id:`pad${idx}`,elements:['Crystal']},role,idx*2,(audio.ctx?.currentTime||0)+.01,islandById[state.currentIsland],.095);const b=document.querySelector(`[data-beat-pad="${idx}"]`);if(b){b.classList.add('lit');setTimeout(()=>b.classList.remove('lit'),220)}}
function startBeatEcho(){
 modal(`<h2>Beat Echo</h2><div class="echoHeader"><b id="echoRound">Round 1</b><span id="echoStatus">Listen…</span></div><div class="beatPads">${['Kick','Low','Chord','Lead'].map((n,i)=>`<button data-beat-pad="${i}" class="beatPad p${i}"><i></i><b>${n}</b></button>`).join('')}</div><p class="sub">Each round adds one hit. Repeat the sequence exactly. Reach round 8 for the top reward.</p>`);
 let seq=[Math.floor(Math.random()*4)],input=[],round=1,accept=false,ended=false;activeMiniGame={timers:[]};
 const play=()=>{accept=false;input=[];$('#echoStatus').textContent='Listen…';seq.forEach((v,i)=>{const tid=setTimeout(()=>beatPadTone(v),350+i*470);activeMiniGame.timers.push(tid)});const tid=setTimeout(()=>{accept=true;$('#echoStatus').textContent='Your turn'},420+seq.length*470);activeMiniGame.timers.push(tid)};
 const fail=()=>{if(ended)return;ended=true;const score=Math.max(4,(round-1)*4);const reward=arcadeReward(score,2);miniGameFinished('Beat Echo',score,reward)};
 $$('[data-beat-pad]').forEach(b=>b.onclick=()=>{if(!accept||ended)return;const v=+b.dataset.beatPad;beatPadTone(v);input.push(v);const i=input.length-1;if(v!==seq[i])return fail();if(input.length===seq.length){accept=false;if(round>=8){ended=true;const reward=arcadeReward(36,3);reward.shards=(reward.shards||0)+1;addShards(1);save();return miniGameFinished('Beat Echo',36,reward)}round++;$('#echoRound').textContent=`Round ${round}`;seq.push(Math.floor(Math.random()*4));const tid=setTimeout(play,700);activeMiniGame.timers.push(tid)}});const t=setTimeout(play,450);activeMiniGame.timers.push(t)
}

function dailyScale(mult=1){return Math.max(12000,Math.round(totalRate()*90*mult),Math.round((state.unlocked.length||1)*5500*mult))}
function dailyRewardFor(day){
 const candy=halloweenActive()?day*35:0;
 return [
  {coins:dailyScale(1),gems:2,stars:2,candy},
  {coins:dailyScale(1.4),gems:3,stars:4,candy},
  {coins:dailyScale(1.8),gems:5,stars:3,shards:1,candy},
  {coins:dailyScale(2.5),gems:4,stars:7,candy},
  {coins:dailyScale(3.2),gems:7,stars:8,shards:1,candy},
  {coins:dailyScale(4.2),gems:8,stars:12,shards:1,candy},
  {coins:dailyScale(6),gems:12,stars:18,shards:3,candy:halloweenActive()?350:0}
 ][day-1];
}
function giftReady(){return !state.lastGift||now()-state.lastGift>=20*60*60*1000}
function openDailyGift(){
 const ready=giftReady(),since=state.lastGift?now()-state.lastGift:0,streak=state.giftStreak||0,nextDay=(ready?(since>48*60*60*1000?1:streak%7+1):streak%7||7),remaining=Math.max(0,20*60*60*1000-since);
 modal(`<h2>Daily Resonance</h2><p class="sub">Daily rewards now scale with your orchestra instead of handing late-game players pocket change. Keep a streak for the huge Day 7 bundle.</p><div class="dailyStrip">${[1,2,3,4,5,6,7].map(d=>{const r=dailyRewardFor(d),done=!ready&&d<=streak%7,active=d===nextDay;return`<div class="dailyDay ${active?'active':''} ${done?'done':''}"><b>Day ${d}</b><span>${fmt(r.coins)} coins</span><small>${r.gems} gems · ${r.stars} Stars${r.shards?` · ${r.shards} shard${r.shards>1?'s':''}`:''}</small></div>`}).join('')}</div><div class="gameBox"><b>${ready?'Reward ready':'Next resonance charging'}</b><p class="sub">${ready?`Day ${nextDay}: ${rewardLine(dailyRewardFor(nextDay))}`:`Available in ${timeText(remaining)}.`}</p><button id="claimDaily" class="bigBtn" ${ready?'':'disabled'}>${ready?'Claim daily bundle':'Charging'}</button></div>`);
 $('#claimDaily').onclick=()=>{if(!giftReady())return;const gap=state.lastGift?now()-state.lastGift:0;if(!state.lastGift||gap>48*60*60*1000)state.giftStreak=1;else state.giftStreak=(state.giftStreak||0)%7+1;const day=state.giftStreak,r=dailyRewardFor(day);state.coins+=r.coins;state.gems+=r.gems;addStars(r.stars);if(r.shards)addShards(r.shards);if(r.candy)addCandy(r.candy);state.lastGift=now();save();renderTop();openDailyGift();toast(`Day ${day} claimed: ${rewardLine(r)}`)};
}

function openSettings(){
 const vol=clamp(Number(state.settings.volumePercent)||0,0,1000);
 modal(`<h2>Settings</h2><div class="volumeControl">
 <div class="volumeHead"><span><b>Master volume</b><small>Controls the entire orchestra, performer sounds, arcade audio, and vocal phrases.</small></span><strong id="setVolumeValue">${vol}%</strong></div>
 <input id="setVolume" class="volumeSlider" type="range" min="0" max="1000" step="10" value="${vol}" aria-label="Master volume">
 <div class="volumeScale"><span>0%</span><span>100%</span><span>500%</span><span>1000%</span></div>
 <div class="volumePresets"><button data-volume="0">Mute · 0%</button><button data-volume="100">Normal · 100%</button><button data-volume="500">LOUD · 500%</button><button data-volume="1000">ABSURD · 1000%</button></div>
 <small class="volumeNote">100% is the original mix level. 500% is 5× output gain and 1000% is 10×; the extreme settings can intentionally clip or distort on some speakers.</small>
 </div><div class="settingsList">
 <label><span><b>Island music</b><small>Procedural 8-track song engine</small></span><input type="checkbox" id="setMusic" ${state.settings.music?'checked':''}></label>
 <label><span><b>Sound effects</b><small>Buttons, games, and performer effects</small></span><input type="checkbox" id="setSfx" ${state.settings.sfx?'checked':''}></label>
 <label><span><b>Spoken vocal phrases</b><small>Original island phrases before FX + chord drops</small></span><input type="checkbox" id="setVoices" ${state.settings.voices?'checked':''}></label>
 <label><span><b>Reduce motion</b><small>Calmer monster and interface animation</small></span><input type="checkbox" id="setMotion" ${state.settings.reduceMotion?'checked':''}></label>
 </div><div class="grid"><div class="card"><strong>Export save code</strong><small>Copy your progress before clearing Safari data or moving devices.</small><button id="exportSave">Create save code</button></div><div class="card"><strong>Import save code</strong><small>Replace this browser save with a code you exported earlier.</small><button id="importSave">Import code</button></div><div class="card"><strong>Version 2 Orchestra</strong><small>7 islands · 8 synchronized tracks · max 3 copies per species · 60-minute hard timer cap.</small></div></div>`);
 const setVolume=pct=>{pct=clamp(Math.round(Number(pct)||0),0,1000);state.settings.volumePercent=pct;$('#setVolume').value=String(pct);$('#setVolumeValue').textContent=`${pct}%`;save();audio.ensure();audio.applyVolume();if(pct===0)try{speechSynthesis?.cancel()}catch{}};
 $('#setVolume').oninput=e=>setVolume(e.target.value);$$('[data-volume]').forEach(btn=>btn.onclick=()=>setVolume(btn.dataset.volume));
 const wire=(id,key)=>{$(id).onchange=e=>{state.settings[key]=e.target.checked;save();document.body.classList.toggle('reduceMotion',state.settings.reduceMotion);if(key==='music'){if(e.target.checked)audio.start();else audio.stop()}}};wire('#setMusic','music');wire('#setSfx','sfx');wire('#setVoices','voices');wire('#setMotion','reduceMotion');
 $('#exportSave').onclick=async()=>{const code=btoa(unescape(encodeURIComponent(JSON.stringify(state))));try{await navigator.clipboard.writeText(code);toast('Save code copied.')}catch{prompt('Copy this save code:',code)}};
 $('#importSave').onclick=()=>{const code=prompt('Paste your Chordlings save code:');if(!code)return;try{const incoming=JSON.parse(decodeURIComponent(escape(atob(code.trim()))));state=normalizeState(incoming);save();closeModal();render();audio.start();toast('Save imported successfully.')}catch{toast('That save code could not be read.')}};
}
function offlineProgress(){
 const previous=Number(state.lastSeen)||now(),away=now()-previous;if(away<8*60*1000)return;let banked=0;for(const o of allOwned())banked+=pendingCoins(o);if(banked>0)setTimeout(()=>toast(`Welcome back — performer banks hold ${fmt(banked)} coins.`),900)
}
function bind(){
 $('#startBtn').onclick=()=>{$('#boot').classList.add('hidden');$('#app').classList.remove('hidden');render();audio.start();openDailyGiftIfReady()};
 $('#closeModal').onclick=closeModal;$('#modal').addEventListener('click',e=>{if(e.target===$('#modal'))closeModal()});
 $('#giftBtn').onclick=openDailyGift;$('#settingsBtn').onclick=openSettings;$('#starShopBtn').onclick=openStarShop;$('#resonatorTopBtn').onclick=openResonator;$('#eventTopBtn').onclick=openHalloween;
 $('#nurseryBtn').onclick=openNursery;$('#breederBtn').onclick=openBreeder;$('#marketBtn').onclick=openMarket;$('#mixerBtn').onclick=openMixer;$('#resonatorBtn').onclick=openResonator;
 $$('[data-panel]').forEach(b=>b.onclick=()=>({islands:openIslands,book:openBook,breed:openBreeder,quests:openQuests,games:openGames}[b.dataset.panel]||openIslands)());
 window.addEventListener('pointerdown',()=>audio.ensure(),{once:true});window.addEventListener('visibilitychange',()=>{if(document.hidden){save();audio.stop()}else{processTimers();if(state.settings.music)audio.start();render()}});window.addEventListener('beforeunload',save);
}
function openDailyGiftIfReady(){if(giftReady())setTimeout(()=>toast('Daily Resonance is ready.'),500)}

ensureGrindBoard();offlineProgress();bind();render();document.body.classList.toggle('reduceMotion',state.settings.reduceMotion);setInterval(processTimers,1000);if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
if(new URLSearchParams(location.search).has('preview'))setTimeout(()=>document.querySelector('#startBtn')?.click(),120);
