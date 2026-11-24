"use strict";
const Waters = (() => {
 const places=[
  {id:"pineglass",name:["Pineglass Lake","Lago Cristalpino"],weather:["Sunrise","Amanecer"],icon:"sun",unlock:0},
  {id:"ember",name:["Ember Caldera","Caldera Ámbar"],weather:["Sunset","Atardecer"],icon:"flame",unlock:2},
  {id:"moon",name:["Moonlit Grotto","Gruta Lunar"],weather:["Moonlight","Luz de luna"],icon:"moon",unlock:5},
  {id:"reef",salt:true,name:["Coral Key","Cayo Coral"],weather:["Trade winds","Brisa marina"],icon:"sun",unlock:8},
  {id:"ruins",name:["Rainroot Ruins","Ruinas de Raíz"],weather:["River mist","Neblina"],icon:"wave",unlock:11},
  {id:"aurora",salt:true,name:["Aurora Fjord","Fiordo Aurora"],weather:["Polar night","Noche polar"],icon:"moon",unlock:15},
  {id:"faro",salt:true,name:["Bahía del Faro","Bahía del Faro"],weather:["Pacific sunrise","Amanecer del Pacífico"],icon:"sun",unlock:0},
  {id:"bank",salt:true,name:["Marlin Bank","Banco del Marlín"],weather:["Offshore swell","Oleaje de altamar"],icon:"wave",unlock:0},
  {id:"cabo",salt:true,name:["Cabo Arch","Arco de Cabo"],weather:["Last light","Última luz"],icon:"sun",unlock:0,grounds:[
   {name:["Arch shallows","Bajío del Arco"],ring:{x:.33,y:.80},fish:["sergeant","hawk","goat","moorishidol","cortezwrasse"]},
   {name:["Outer ledge","Cornisa exterior"],ring:{x:.71,y:.65},fish:["coronet","mantastar","balloon","greatwhite"]}
  ]},
  {id:"seamount",salt:true,name:["Midnight Seamount","Monte de Medianoche"],weather:["Glowing plankton","Plancton luminoso"],icon:"moon",unlock:0,grounds:[
   {name:["Summit ridge","Cresta submarina"],ring:{x:.36,y:.70},fish:["saury","hatchet","fang","viperfish"]},
   {name:["Blue drop-off","Talud azul"],ring:{x:.73,y:.78},fish:["lanternjaw","lancet","veil","footballfish","ninjashark","eclipseangler"]}
  ]}
 ];
 const catalog=[
  ["sunny","Sunbeam Bluegill","Mojarra del Sol",0.18,0.68,"It turns sideways in the sun. For an instant, its scales look like a gold coin.","Gira de lado al sol y, por un instante, sus escamas parecen una moneda de oro."],
  ["brook","Ribbon Trout","Trucha Listón",0.48,2.8,"A pink ribbon runs from gill to tail. Watch for its quick turn near the shore.","Tiene una franja rosa desde las branquias hasta la cola. Cerca de la orilla da vueltas rapidísimas."],
  ["moss","Mossback Bass","Lobina de Musgo",1.1,4.6,"Its moss-colored back nearly disappears over the lakebed. Only the tail gives it away.","Su lomo verde se confunde con el fondo del lago. Solo la cola lo delata."],
  ["crown","Crown Koi","Koi Corona",2.4,7.8,"The old dock has a secret visitor. Three golden fins break the water like a tiny crown.","El viejo muelle tiene una visita secreta. Sus tres aletas doradas parecen una coronita."],
  ["emberfin","Ember Tetra","Tetra Brasa",0.04,0.16,"At sundown, this tiny swimmer glows the same red as the cliffs.","Al atardecer, este pececito brilla con el mismo rojo que los riscos."],
  ["copper","Copper Catfish","Bagre de Cobre",1.3,5.8,"It combs the warm sand with long copper-colored whiskers.","Peina la arena tibia con sus largos bigotes de color cobre."],
  ["flare","Flarefin Perch","Perca Llamarada",0.6,2.3,"Its striped orange sail flashes just before it darts back into deeper water.","Su aleta naranja a rayas destella justo antes de volver al agua profunda."],
  ["phoenix","Phoenix Carp","Carpa Fénix",2.7,8.9,"Its flame-shaped tail leaves a red reflection long after the sunset fades.","Su cola en forma de llama deja un reflejo rojo aun después del atardecer."],
  ["lantern","Lantern Minnow","Pececillo Farol",0.03,0.19,"Follow the little yellow light. There is a whole fish swimming behind it.","Sigue la lucecita amarilla. Hay un pez entero nadando detrás de ella."],
  ["glass","Glass Eel","Anguila de Cristal",0.4,1.8,"When it passes a glowing mushroom, the blue light shines through its long body.","Cuando pasa junto a un hongo luminoso, la luz azul atraviesa su largo cuerpo."],
  ["lunar","Lunar Ray","Raya Lunar",2.3,7.5,"Its wings trace two crescents along the silvery floor of the grotto.","Sus aletas dibujan dos lunas crecientes en el fondo plateado de la gruta."],
  ["star","Starlight Sturgeon","Esturión Estelar",5.5,18.6,"Count the seven bright marks along its back. They match the stars above the grotto.","Cuenta las siete marcas brillantes de su lomo. Forman una constelación de la gruta."],
  ["clown","Tangerine Clownfish","Pez Payaso Mandarina",.09,.31,"Pairs of tiny orange fins peek out from the anemones. One fish ventures out while the other watches.","Dos aletitas naranjas asoman entre las anémonas. Un pez sale mientras el otro vigila."],
  ["parrot","Jade Parrotfish","Pez Loro de Jade",1.2,6.8,"A turquoise beak taps at the reef. A little cloud of sand drifts away with the tide.","Un pico turquesa da golpecitos al arrecife. Una nubecita de arena se va con la marea."],
  ["sail","Blue Sailfish","Pez Vela Azul",9.0,34.0,"Its tall sail folds flat just before a burst of speed.","Su gran aleta se pliega justo antes de que salga disparado."],
  ["dragon","Tide Dragon","Dragón de Marea",.4,1.6,"Count the leafy fins. At slack tide, this tiny dragon looks just like a floating garden.","Cuenta sus aletas de hoja. Cuando se calma la marea, parece un jardín flotante."],
  ["dart","Orchid Danio","Danio Orquídea",.02,.13,"A violet stripe flashes between the roots, then another. The school moves like one ribbon.","Una raya violeta destella entre las raíces y luego aparece otra. El cardumen parece un listón."],
  ["shield","Shield Catfish","Bagre Escudo",1.3,5.7,"Its plates look like river pebbles. Look for the whiskers along the sandy steps.","Sus placas parecen piedritas. Busca los bigotes entre los escalones de arena."],
  ["blade","Moonblade Knifefish","Pez Cuchillo Lunar",.8,3.4,"A ribbon fin lets it slide backward beneath the fallen arch.","Su aleta ondulada le permite nadar de reversa bajo el arco caído."],
  ["axolotl","Sunstone Frillfin","Pez Gola de Sol",.7,3.1,"An amber frill opens around its face like a sunflower. Old carvings show the same outline.","Su gola ámbar se abre como un girasol. Los grabados antiguos tienen la misma silueta."],
  ["frost","Frost Char","Salvelino de Escarcha",.8,4.1,"Tiny pale spots break up its outline under the drifting ice.","Sus puntitos claros disimulan su silueta bajo el hielo flotante."],
  ["wolffish","Icefang Wolffish","Pez Lobo de Hielo",2.8,12.2,"It peeks out of a blue rock crevice, showing a grin full of shell-crushing teeth.","Se asoma por una grieta azul y muestra los dientes con los que tritura conchas."],
  ["halibut","Snowcap Halibut","Fletán Nevado",4.6,24.0,"What seems to be a patch of snowy sand suddenly lifts two curious eyes.","Lo que parecía arena nevada levanta de pronto dos ojos curiosos."],
  ["narwhal","Aurora Lancefish","Pez Lanza Boreal",8.5,31.7,"Green light travels down its spiral lance in time with the ribbons in the sky.","La luz verde recorre su lanza en espiral al ritmo de las cintas del cielo."]
 ];
 const fish=catalog.map(([id,en,es,min,max,noteEn,noteEs],i)=>({id,name:[en,es],min,max,note:[noteEn,noteEs],place:Math.floor(i/4),tier:i%4}));
 // Additions carry explicit habitat and rarity so older journals and seeded cups keep their identities.
 const shoal=[
  ["reedpike",0,2,"Reedshadow Pike","Lucio de los Juncos",1.4,8.2,"Look between the reeds for a long green snout. This hunter can hold still until a minnow swims past.","Busca su hocico largo y verde entre los juncos. Puede quedarse quieto hasta que pase un pececillo."],
  ["pumpkinseed",0,0,"Paintbox Sunfish","Pez Sol Acuarela",.06,.42,"Turquoise brushstrokes cross its cheeks. It makes a tiny fan of sand with each flick of its tail.","Tiene pinceladas turquesa en las mejillas. Cada coletazo levanta un abanico de arena."],
  ["obsidian",1,2,"Obsidian Scorpionfish","Pez Escorpión de Obsidiana",.42,2.85,"Its crimson spines trace the shape of the caldera. On black gravel, the eyes are the easiest part to spot.","Sus espinas rojas dibujan la silueta de la caldera. Sobre la grava negra, lo más fácil de ver son sus ojos."],
  ["goldbarb",1,0,"Honeygold Barb","Barbo de Miel",.03,.22,"Turn toward the setting sun and a school lights up like a handful of falling sparks.","Cuando todo el cardumen gira hacia el sol, parece un puñado de chispas."],
  ["velvet",2,1,"Velvet Veiltail","Betta de Terciopelo",.02,.09,"Its purple fins fold like a stage curtain when it slips behind the cave pillars.","Sus aletas moradas se pliegan como el telón de un teatro al pasar detrás de las columnas."],
  ["comet",2,2,"Comet Lanternfish","Pez Linterna Cometa",.08,.46,"Two bright tail streamers hang in the dark. Look ahead of them to find the fish.","Dos cintas brillantes flotan en la oscuridad. Busca al pez justo delante de ellas."],
  ["butterfly",3,1,"Sunstripe Butterflyfish","Pez Mariposa Rayado",.09,.38,"It turns edge-on in a coral crack and almost disappears. A moment later a bright yellow sail comes back into view.","De canto, casi desaparece en las grietas del coral. Al girar de nuevo, se ve una vela amarilla."],
  ["spottedbox",3,0,"Polka-dot Boxfish","Pez Cofre de Lunares",.15,.95,"Tiny fins on a box-shaped body steer this little swimmer around coral corners.","Sus aletitas guían su cuerpo cuadrado al dar la vuelta entre los corales."],
  ["emeraldgar",4,2,"Emerald Needle Gar","Pejelagarto Esmeralda",1.2,7.9,"Its long snout rests beneath the roots. Green spots hide the outline until it turns.","Descansa su hocico largo bajo las raíces. Sus manchas verdes ocultan la silueta hasta que da la vuelta."],
  ["peacock",4,1,"Peacock Bass","Pavón Turquesa",.9,6.2,"An eye-shaped spot marks its tail. Its real eye watches from the opposite end.","Lleva una mancha en forma de ojo en la cola. El ojo de verdad te mira desde el otro extremo."],
  ["puffin",5,1,"Puffin Lumpfish","Pez Grumo Frailecillo",.65,3.3,"Black and white patches and orange lips recall the seabirds perched above its icy pool.","Sus manchas blancas y negras y sus labios naranjas recuerdan a las aves que se posan sobre el hielo."],
  ["ribbon",5,2,"Polar Ribbon Oarfish","Pez Remo Polar",3.2,19.5,"A red crest ripples down its silver back as it glides under the ice.","Su cresta roja ondula sobre el lomo plateado mientras se desliza bajo el hielo."],
  ["sierra",6,0,"Pacific Sierra","Sierra del Pacífico",.65,5.8,"Count the yellow spots as it turns. A whole school can vanish in a flash of silver.","Cuenta sus manchas amarillas cuando da la vuelta. El cardumen entero desaparece en un destello plateado."],
  ["snapper",6,1,"Red Snapper","Huachinango",.8,9.5,"A rust-red tail peeks from a ledge beneath the lighthouse. A deep lure brings it out.","Una cola rojiza asoma bajo una roca cerca del faro. Un señuelo profundo la hace salir."],
  ["rooster",6,2,"Roosterfish","Pez Gallo",3.1,27.4,"The tips of its tall comb cut the surface before you see the silver body.","Las puntas de su cresta cortan el agua antes de que veas el cuerpo plateado."],
  ["goldrooster",6,3,"Golden Roosterfish","Pez Gallo Dorado",12.4,34.8,"When the lighthouse beam sweeps the cove, seven golden streamers break the surface.","Cuando la luz del faro recorre la bahía, siete cintas doradas rompen la superficie."],
  ["needle",6,0,"Pacific Needlefish","Pez Aguja del Pacífico",.16,2.1,"Look for a green pencil shape just under the surface. Then watch the long jaws turn.","Busca una silueta verde como un lápiz bajo la superficie. Luego verás girar su largo pico."],
  ["pompano",6,1,"Silver Pompano","Pámpano Plateado",.28,3.7,"It tips its silver sides toward the sand and leaves a little cloud behind.","Inclina sus costados plateados hacia la arena y deja atrás una pequeña nube."],
  ["skipjack",7,0,"Skipjack Tuna","Barrilete",1.6,11.4,"When the school banks together, the dark stripes on their bellies flash into view.","Cuando el cardumen gira al mismo tiempo, asoman las franjas oscuras de sus vientres."],
  ["dorado",7,1,"Dorado","Dorado",2.2,21.8,"An emerald back, yellow sides and a blunt forehead appear beneath the boat’s wake.","Bajo la estela de la lancha asoman un lomo esmeralda, costados amarillos y una frente ancha."],
  ["wahoo",7,2,"Wahoo","Peto",4.8,37.4,"Its blue bars flicker past the trolling line. By the time you count three, it has turned.","Sus franjas azules pasan junto al señuelo. Antes de contar tres, el pez ya dio la vuelta."],
  ["marlin",7,3,"Pacific Blue Marlin","Marlín Azul del Pacífico",42.0,176.0,"Follow the long bill through the wake. When the blue marlin jumps, its whole shadow leaves the water.","Sigue su pico largo por la estela. Cuando salta el marlín azul, hasta su sombra sale del agua."],
  ["flyer",7,0,"Flying Fish","Pez Volador",.09,.66,"Silver-blue fins unfold above a crest. See how far it glides before it touches water again.","Despliega sus aletas plateadas sobre una ola. Mira cuánto planea antes de volver al agua."],
  ["moonopah",7,2,"Moonfish Opah","Pez Luna Real",8.4,54.0,"A round silver flank turns in the blue depths, followed by a flash of orange fins.","Un costado redondo y plateado gira en las profundidades, seguido de un destello de aletas naranjas."],
  ["sergeant",8,0,"Sergeant Major","Sargento Mayor",.10,.45,"Look for five ink-black bars crossing a yellow back. Under the arch, a whole school turns at once.","Busca cinco barras negras sobre un lomo amarillo. Bajo el arco, todo el cardumen gira a la vez."],
  ["hawk",8,1,"Longnose Hawkfish","Pez Halcón Narigón",.04,.18,"A red checkerboard peeks over a ledge. Its long snout gives away the hiding place.","Un tablero de cuadritos rojos asoma por una roca. El hocico largo delata su escondite."],
  ["coronet",8,2,"Golden Trumpetfish","Pez Trompeta Dorado",.35,2.1,"What looks like a floating golden twig turns to follow the lure. Watch the tiny fins near its tail.","Lo que parecía una ramita dorada gira para seguir el señuelo. Fíjate en las aletitas cerca de la cola."],
  ["mantastar",8,3,"Starlit Manta","Mantarraya Estelar",28,118,"When the sun fits inside the arch, two gold-edged wings unfurl beneath the boat. Nico calls it the first star of the evening.","Cuando el sol cabe en el arco, dos alas de borde dorado se abren bajo la lancha. Nico la llama la primera estrella de la tarde."],
  ["goat",8,0,"Yellow Goatfish","Salmonete Amarillo",.17,1.8,"Two whiskers sweep the sand beneath its chin. Follow the little puffs to see where it has been.","Dos barbillas barren la arena bajo su boca. Sigue las nubecitas para ver por dónde pasó."],
  ["balloon",8,1,"Spotted Porcupinefish","Pez Erizo Moteado",.38,3.6,"Round eyes and a freckled face peer out of the rocks. A slow flick of its fins sends it drifting sideways.","De entre las rocas asoman dos ojos redondos y una cara pecosa. Con un aleteo lento se desliza de lado."],
  ["lanternjaw",9,0,"Blue Lanternfish","Pez Linterna Azul",.02,.12,"A row of blue lights slips through the dark. The lights turn together when the lanternfish rolls.","Una hilera de luces azules se desliza en la oscuridad. Todas giran juntas cuando el pez se ladea."],
  ["hatchet",9,1,"Silver Hatchetfish","Pez Hacha Plateado",.03,.15,"Turn on the dive cam and look for a silver blade. It almost vanishes when it faces you head-on.","Enciende la cámara y busca una hojita plateada. Cuando el pez te mira de frente, casi desaparece."],
  ["lancet",9,2,"Midnight Lancetfish","Pez Lanceta Nocturno",2.4,14.2,"A long dorsal sail unfolds against the blue slope. Watch for the silver flash beneath it.","Una larga aleta se despliega frente al talud azul. Busca el destello plateado debajo de ella."],
  ["veil",9,3,"Violet Veil Oarfish","Pez Remo de Velo Violeta",9.8,74.0,"Nico first spotted its scarlet crest. The violet ribbon that followed seemed to go on forever.","Nico vio primero su cresta escarlata. El listón violeta que venía detrás parecía no terminar nunca."],
  ["saury",9,0,"Pacific Saury","Paparda del Pacífico",.08,.29,"Thin silver dashes flicker just below the stars. Each dash is a saury keeping pace with the school.","Justo bajo las estrellas parpadean rayitas plateadas. Cada una es una paparda que sigue a su cardumen."],
  ["fang",9,1,"Dusky Fangtooth","Pez Colmillo Sombrío",.08,.39,"First you see two white points, then a little brown face. The whole visitor is smaller than its shadow.","Primero ves dos puntitos blancos y luego una carita café. El visitante entero es más pequeño que su sombra."],
  ["yellowperch",0,0,"Yellow Perch","Perca amarilla",0.12,1.8,"Count the olive bars between its yellow back and orange fins.","Cuenta las barras verde oliva entre el lomo amarillo y las aletas naranjas."],
  ["grasspickerel",0,1,"Grass Pickerel","Lucio de los juncos",0.2,1.9,"Watch the reeds for a long, still snout before the quick dash.","Busca un hocico largo e inmóvil entre los juncos antes de que salga disparado."],
  ["mahseer",1,2,"Golden Mahseer","Mahseer dorado",2.2,26,"Its large gold scales flash one row at a time as it rolls.","Al girar, sus escamas doradas brillan una hilera a la vez."],
  ["gudgeon",1,1,"Peacock Gudgeon","Gobio pavo real",0.01,0.04,"The dark spot beside its tail looks like a second eye.","La mancha oscura junto a su cola parece un segundo ojo."],
  ["cavetetra",2,0,"Blind Cave Tetra","Sardina ciega de cueva",0.02,0.09,"A pale pink shape slips between the dark rocks.","Una silueta rosa pálido se desliza entre las rocas oscuras."],
  ["glasscat",2,1,"Glass Catfish","Bagre de cristal",0.02,0.08,"Find its whiskers, then follow the thin spine inside its glassy body.","Busca sus bigotes y sigue la espina que se ve a través de su cuerpo."],
  ["gramma",3,1,"Royal Gramma","Grama real",0.02,0.09,"Violet at the nose and lemon yellow at the tail, it darts into coral cracks.","Violeta en la cabeza y amarillo limón en la cola, se esconde en las grietas del coral."],
  ["emperorangel",3,2,"Emperor Angelfish","Pez ángel emperador",0.35,2.8,"Curved yellow lines sweep across its blue sides.","Las líneas amarillas se curvan sobre sus costados azules."],
  ["cardinaltetra",4,0,"Cardinal Tetra","Tetra cardenal",0.01,0.03,"Red and electric blue race side by side along its flank.","Dos franjas, roja y azul eléctrico, recorren su costado."],
  ["zebrapleco",4,2,"Zebra Pleco","Pleco cebra",0.03,0.14,"Its stripes break up its outline against the sunlit stones.","Sus rayas disfrazan su silueta entre las piedras iluminadas."],
  ["arcticchar",5,1,"Arctic Char","Salvelino ártico",0.7,13,"Look for pale spots above a bright copper belly.","Busca los puntos pálidos sobre su vientre cobrizo."],
  ["atlanticcod",5,1,"Atlantic Cod","Bacalao del Atlántico",1.1,38,"A little chin barbel leads the way along the bottom.","Una barbilla bajo el mentón le marca el camino por el fondo."],
  ["lookdown",6,0,"Mexican Lookdown","Jorobado mexicano",0.16,1.4,"Its silver, paper-thin side flashes like a mirror near the jetty.","Su costado plateado, delgado como papel, brilla junto al muelle."],
  ["eagleray",6,2,"Spotted Eagle Ray","Raya águila moteada",4,89,"White spots scatter over wings that glide past the lighthouse.","Alas cubiertas de puntos blancos planean frente al faro."],
  ["yellowfin",7,2,"Yellowfin Tuna","Atún aleta amarilla",8,145,"A row of little yellow fins flickers behind its tall golden sickles.","Una fila de aletitas amarillas brilla detrás de sus grandes aletas curvas."],
  ["oceansunfish",7,2,"Ocean Sunfish","Pez luna",28,850,"Its tall fin draws a slow line across the surface before the round silver body appears.","Su alta aleta dibuja una línea en la superficie antes de que aparezca su cuerpo redondo y plateado."],
  ["moorishidol",8,1,"Moorish Idol","Ídolo moro",0.1,0.65,"Follow its long white streamer through the arch shallows.","Sigue su larga cinta blanca por el bajío del arco."],
  ["cortezwrasse",8,0,"Cortez Rainbow Wrasse","Señorita arcoíris de Cortés",0.07,0.48,"Turquoise and pink stripes flash when it turns around a rock.","Sus rayas turquesas y rosas destellan al rodear una roca."],
  ["viperfish",9,1,"Pacific Viperfish","Pez víbora del Pacífico",0.04,0.18,"A trail of blue dots slides through the dark just behind its long fangs.","Tras sus largos colmillos se mueve un rastro de puntos azules en la oscuridad."],
  ["footballfish",9,2,"Pacific Footballfish","Pez balón del Pacífico",0.42,5.5,"Look past the little lure to see the round fish waiting behind it.","Mira detrás del señuelo diminuto para descubrir el pez redondo."],
  ["blacktipreef",3,2,"Blacktip Reef Shark","Tiburón de arrecife de puntas negras",8,38,"A black-tipped fin cuts a small V in the clear reef water.","Una aleta de punta negra dibuja una V en el agua clara del arrecife."],
  ["greenlandshark",5,2,"Greenland Shark","Tiburón de Groenlandia",160,980,"A broad shadow moves slowly through the deepest part of the fjord.","Una sombra ancha avanza despacio por la parte más profunda del fiordo."],
  ["hammerhead",6,2,"Scalloped Hammerhead","Tiburón martillo común",11,185,"Its wide head sweeps a gentle arc as it passes the lighthouse.","Su cabeza ancha traza un arco suave al pasar frente al faro."],
  ["shortfinmako",7,2,"Shortfin Mako","Marrajo dientuso",18,312,"Its pointed blue nose parts the offshore swell.","Su hocico puntiagudo y azul corta el oleaje de mar abierto."],
  ["greatwhite",8,3,"Great White Shark","Gran tiburón blanco",185,1250,"Beyond Cabo Arch, a gray dorsal fin turns and a white belly breaks the surface.","Más allá del Arco de Cabo, gira una aleta gris y un vientre blanco rompe la superficie."],
  ["ninjashark",9,2,"Ninja Lanternshark","Tiburón linterna ninja",0.36,1.35,"Tiny blue lights give away a little shark as dark as the water around it.","Unas lucecitas azules delatan a este pequeño tiburón tan oscuro como el agua."],
  ["moonpaddle",0,3,"Moonmirror Paddlefish","Pez espátula Espejo de Luna",11,62,"A silver paddle catches the sunrise, followed by a back patterned with little moons.","Una espátula plateada refleja el amanecer; detrás, brillan pequeñas lunas."],
  ["obsidiangiant",1,3,"Obsidian Arapaima","Arapaima de Obsidiana",35,204,"When it surfaces, each red-edged scale looks like a cooling ember.","Cuando sube a respirar, sus escamas de borde rojo parecen brasas."],
  ["prismeel",2,3,"Prism Ghost Eel","Anguila Fantasma de Prisma",1.8,12,"A rainbow ribbon bends around the moon reflected in the cave pool.","Una cinta arcoíris rodea el reflejo de la luna en la poza."],
  ["sunlion",3,3,"Sundial Lionfish","Pez León Reloj de Sol",0.6,3.2,"Its golden spines open one by one like a tiny sunrise.","Sus espinas doradas se abren una a una como un pequeño amanecer."],
  ["jadesaw",4,3,"Jade Sawfish","Pez Sierra de Jade",12,106,"Its long green saw leaves a tooth-shaped shadow on the riverbed.","Su larga sierra verde dibuja una sombra dentada sobre el lecho del río."],
  ["auroraskate",5,3,"Northern Lights Skate","Raya Aurora Boreal",4,32,"Green light rolls from wing to wing beneath the ice.","Una luz verde pasa de ala a ala bajo el hielo."],
  ["beaconsail",6,3,"Lighthouse Sailfish","Pez Vela del Faro",17,85,"A striped sail catches the lighthouse beam and glows over the bay.","Su vela rayada atrapa el haz del faro y brilla sobre la bahía."],
  ["thunderblue",7,3,"Thunderfin Bluefin","Atún Aleta de Trueno",52,410,"A gold zigzag across its side flickers each time it changes course.","El zigzag dorado de su costado relampaguea cada vez que cambia de rumbo."],
  ["eclipseangler",9,3,"Eclipse Anglerfish","Rape del Eclipse",1.4,9,"A ring of gold hangs ahead of it like a tiny sun in eclipse.","Un anillo de oro cuelga frente a su hocico como un diminuto sol eclipsado."]
 ];
 for(const [id,place,tier,en,es,min,max,noteEn,noteEs] of shoal)fish.push({id,place,tier,name:[en,es],min,max,note:[noteEn,noteEs]});
 const pools=places.map((_,index)=>fish.filter(f=>f.place===index));
 const legends=place=>pools[place].filter(f=>f.tier===3);
 const legend=(place,id)=>legends(place).find(f=>f.id===id)||legends(place)[0];
 const sharks=fish.filter(f=>["blacktipreef","greenlandshark","hammerhead","shortfinmako","greatwhite","ninjashark"].includes(f.id));
 function cupFish(place,challenge){
  const pool=challenge.roster===3?pools[place]:pools[place].slice(0,6);
  const options=pool.filter(f=>f.tier===challenge.tier);return options[Math.floor((challenge.variant||0)*options.length)];
 }
 const tankLimit=24;
 const residentRoster={
  fresh:["pumpkinseed","brook","reedpike","sunny","moss"],
  reef:["butterfly","spottedbox","parrot","clown","sail"],
  ice:["puffin","frost","ribbon","wolffish","halibut"],
  bank:["dorado","flyer","sierra","moonopah","marlin"]
 };
 const tankIds=Object.keys(residentRoster);
 const tankNames={fresh:"waterwheel",reef:"shipwreck",ice:"crystal",bank:"bluePass"};
 const aquariumLimit=tankLimit*tankIds.length;
 const residentKeys=Object.entries(residentRoster).flatMap(([habitat,ids])=>ids.map(id=>habitat+":"+id));
 const speciesId=key=>key.split(":").pop().split("~")[0];
 function specimens(id,records,photos){
  const count=Math.min(aquariumLimit,records[id]?.n||(photos[id]?1:0));
  return Array.from({length:count},(_,i)=>i?id+"~"+(i+1):id);
 }
 function fishInTank(save,habitat=save.tank){
  return save.display.filter(key=>save.fishHomes[key]===habitat);
 }
 function hasRoom(save,habitat){
  return tankIds.includes(habitat)&&fishInTank(save,habitat).length<tankLimit;
 }
 function nextTank(save){
  return hasRoom(save,save.tank)?save.tank:tankIds.find(habitat=>hasRoom(save,habitat));
 }
 function moveFish(save,key,destination){
  if(!save.display.includes(key)||save.fishHomes[key]===destination||!hasRoom(save,destination))return false;
  save.fishHomes[key]=destination;
  return true;
 }
 function setExhibited(save,key,resident,present,habitat=save.tank){
  if(resident){
   if(!residentKeys.includes(key))return false;
   const away=save.residentAway.includes(key);
   if(away!==present)return false;
   save.residentAway=present?save.residentAway.filter(k=>k!==key):[...save.residentAway,key];
  }else{
   const here=save.display.includes(key);
   if(here===present)return false;
   if(present){
    if(!hasRoom(save,habitat)||!specimens(speciesId(key),save.records,save.photos).includes(key))return false;
    save.display.push(key);
    save.fishHomes[key]=habitat;
   }else{
    if(save.fishHomes[key]!==habitat)return false;
    save.display=save.display.filter(k=>k!==key);
    delete save.fishHomes[key];
   }
  }
  return true;
 }
 const tackle=[
  {id:"float",name:["Classic float","Flotador clásico"],desc:["A forgiving line for steady catches. Great for learning the reel.","Un hilo que aguanta más tensión. Ideal para aprender a recoger."],pull:.84,speed:1,bite:1,odds:[1,1,1,1]},
  {id:"spinner",name:["Copper spinner","Cucharilla de cobre"],desc:["Its flash draws rare fish. They pull harder on this rig.","Su destello atrae peces raros, pero jalan con más fuerza."],pull:1.12,speed:1.03,bite:.90,odds:[.66,.9,1.52,1.55]},
  {id:"fly",name:["Firefly lure","Mosca luciérnaga"],desc:["Quick bites from smaller fish. Reel them in a little faster.","Los peces pequeños pican antes. También puedes recogerlos más rápido."],pull:.99,speed:1.16,bite:.64,odds:[1.6,1.2,.72,.58]}
 ];
 const rigs=["fly","spinner","float","spinner","fly","float","float","spinner","float","spinner"];
 const habitats=["fresh","reef","ice","reef","fresh","ice","reef","bank","cabo","seamount"];
 // Swimming layers and the tide are rules of the game, shared by the rig, camera, and guide.
 const marineLayers=[
  ["clown","dragon","frost","sierra","needle","flyer","dorado","sergeant","mantastar","saury","lanternjaw","lookdown","oceansunfish","blacktipreef","beaconsail","thunderblue"],
  ["parrot","sail","butterfly","narwhal","rooster","goldrooster","marlin","skipjack","wahoo","coronet","hawk","hatchet","lancet","gramma","emperorangel","arcticchar","eagleray","yellowfin","moorishidol","cortezwrasse","shortfinmako","hammerhead","greatwhite","auroraskate"],
  ["spottedbox","wolffish","halibut","puffin","ribbon","snapper","pompano","moonopah","goat","balloon","veil","fang","atlanticcod","viperfish","footballfish","greenlandshark","ninjashark","sunlion","eclipseangler"]
 ];
 const layerOf=id=>marineLayers.findIndex(group=>group.includes(id));
 function seaTide(records){
  const catches=fish.reduce((n,f)=>n+(places[f.place].salt?(records[f.id]?.n||0):0),0);
  return [0,1,2,1][Math.floor(catches/2)%4];
 }
 const roaming=new Set(["sierra","rooster","goldrooster","sail","dorado","wahoo","marlin","skipjack","narwhal","frost","mantastar","saury","lancet","yellowfin","shortfinmako","hammerhead","greatwhite","beaconsail","thunderblue"]);
 function seaRig(depth,tide,trolling=false,ground=null){
  const matched=depth===tide;
  return {depth,tide,matched,trolling,ground,wait:matched ? .74 : 1.05};
 }
 function seaWeight(id,rig){
  if(!rig)return 1;
  const layer=rig.layers?.[id]??layerOf(id);
  const layerWeight=layer===rig.depth ? (rig.matched?4.3:3.2) : .66;
  const localWeight=rig.ground?.fish.includes(id)?2:1;
  const anchorWeight=layer===rig.anchorLayer?1.7:1;
  const nightWeight=rig.conditions?.time===2&&(id==="lanternjaw"||id==="hatchet")?1.8:1;
  return nightWeight*anchorWeight*localWeight*layerWeight*(rig.trolling&&roaming.has(id)?1.85:1);
 }
 function trail(origin,depth,direction,elapsed){
  const k=Math.min(1,Math.max(0,elapsed)/2.6);
  return {x:Math.max(.12,Math.min(.88,origin.x+direction*(.12*k+.014*Math.sin(k*Math.PI)))),y:Math.max(.57,Math.min(.9,origin.y+(.011+.005*depth)*Math.sin(k*Math.PI)))};
 }
 function clues(save,index){
  const found=pools[index].filter(f=>save.records[f.id]).length;
  const flags=save.surveys[places[index].id]||{};
  return {found,ring:!!flags.ring,gear:!!flags.gear,count:Number(found>=3)+Number(!!flags.ring)+Number(!!flags.gear)};
 }
 function clean(raw){
  const records={};
  for(const f of fish){
   const r=raw?.records?.[f.id];
   if(r&&Number.isSafeInteger(r.n)&&r.n>0&&Number.isFinite(r.best)&&r.best>=f.min-0.006&&r.best<=f.max+0.006)records[f.id]={n:Math.min(r.n,10000000),best:r.best,...(Number.isSafeInteger(r.bestAt)&&r.bestAt>0&&r.bestAt<=8640000000000000?{bestAt:r.bestAt}:{})};
  }
  const total=Object.values(records).reduce((n,r)=>n+r.n,0);
  const surveys={};
  for(const p of places){const v=raw?.surveys?.[p.id];if(v)surveys[p.id]={ring:v.ring===true,gear:v.gear===true};}
  const photos={};for(const f of fish)if(raw?.photos?.[f.id]===true)photos[f.id]=true;
  const album={};
  for(const id of Object.keys(photos)){
   const shot=raw?.album?.[id];if(typeof shot==="string"&&shot.length<=85000&&/^data:image\/jpeg;base64,[A-Za-z0-9+/]+=*$/.test(shot))album[id]=shot;
  }
  const personal=new Set(fish.flatMap(f=>specimens(f.id,records,photos)));
  const tank=tankIds.includes(raw?.tank)?raw.tank:"fresh";
  const display=[],fishHomes={},rooms={tank,display,fishHomes};
  // Earlier saves kept a single exhibit in the player's last selected habitat.
  for(const key of new Set(Array.isArray(raw?.display)?raw.display:[])){
   if(!personal.has(key))continue;
   const home=raw.fishHomes?.[key]||tank;
   const destination=hasRoom(rooms,home)?home:nextTank(rooms);
   if(!destination)break;
   display.push(key);fishHomes[key]=destination;
  }
  const residentAway=Array.isArray(raw?.residentAway)?[...new Set(raw.residentAway.filter(key=>residentKeys.includes(key)))]:[];
  const care={};
  for(const key of [...personal,...residentKeys]){
   const entry=raw?.care?.[key];if(!entry)continue;
   const meals=Number.isSafeInteger(entry.meals)?Math.min(1000000,Math.max(0,entry.meals)):0;
   const name=typeof entry.name==="string"?Array.from(entry.name.trim()).slice(0,24).join(""):"";
   if(meals||name)care[key]={meals,name};
  }
  const lure=tackle.some(t=>t.id===raw?.lure)?raw.lure:"float";
  const seaDepth=Number.isInteger(raw?.seaDepth)&&raw.seaDepth>=0&&raw.seaDepth<=2?raw.seaDepth:0;
  const grounds={};
  for(const place of places){
   const index=raw?.grounds?.[place.id];
   if(Number.isInteger(index)&&place.grounds?.[index])grounds[place.id]=index;
  }
  const charm=fish.some(f=>f.tier===3&&f.id===raw?.charm&&records[f.id])?raw.charm:null;
  return {records,charm,photos,album,surveys,grounds,display,fishHomes,residentAway,care,lure,seaDepth,tank,place:Number.isInteger(raw?.place)&&places[raw.place]?.unlock<=total?raw.place:0,lang:raw?.lang==="es"?1:raw?.lang==="en"?0:null,calm:raw?.calm===true,sound:raw?.sound===true};
 }
 function choose(place,records,accuracy,depth,rng=Math.random,lure="float",sea=null,power={}){
  const pool=pools[place];
  const seen=pool.map(f=>records[f.id]?.n||0);
  const bonus=Math.max(0,1-accuracy/.2);
  // Shallow casts favor small fish. Deep casts and feeding rings favor scarce species.
  const rig=tackle.find(v=>v.id===lure)||tackle[0];
  const tierWeight=[35+19*(1-depth),28,12+depth*18,3+bonus*16+depth*6];
  const counts=pool.reduce((n,f)=>(n[f.tier]++,n),[0,0,0,0]);
  const weights=pool.map((f,i)=>(seen[i]===0?power.discovery||1:1)*(f.tier>=2?power.rare||1:1)*seaWeight(f.id,places[place].salt?sea:null)*tierWeight[f.tier]*rig.odds[f.tier]/counts[f.tier]*(seen[i]===0?2.2:1/(1+Math.min(seen[i],8)*.35)));
  if(seen.every(n=>n===0)&&place===0)return pool[rng()<.72?0:1];
  // After seven catches, prioritize any species still missing from this water.
  const missing=seen.findIndex(n=>n===0);
  if(missing>=0&&seen.reduce((a,b)=>a+b,0)>=7)return pool[missing];
  let n=rng()*weights.reduce((a,b)=>a+b,0);
  return pool[weights.findIndex(w=>(n-=w)<0)]||pool[0];
 }
 // Timing of the two dives, and the rhythm of the runs between them.
 const legendFights={
  moonpaddle:[.32,.69,1.13],obsidiangiant:[.26,.63,1.57],prismeel:[.40,.72,2.22],sunlion:[.36,.74,1.84],
  jadesaw:[.30,.71,1.23],auroraskate:[.42,.78,1.04],beaconsail:[.22,.61,2.12],thunderblue:[.27,.67,2.36],
  greatwhite:[.31,.73,1.94],eclipseangler:[.44,.80,.89],
  crown:[.36,.72,1.16],phoenix:[.24,.73,2.19],star:[.42,.76,.87],dragon:[.31,.64,1.82],
  axolotl:[.38,.66,1.48],narwhal:[.26,.77,1.12],goldrooster:[.30,.71,2.43],marlin:[.21,.67,2.66],
  mantastar:[.46,.74,.79],veil:[.27,.80,1.37]
 };
 function tensionStep(s,held,dt,calm=false){
  s.age+=dt;
  if(s.tier===3){
   s.bursts??=0;s.burstLeft??=0;s.slackTime??=0;
   if(s.bursts<2 && s.burstLeft<=0 && s.progress>=(legendFights[s.legend]||[.34,.68])[s.bursts]){
    s.bursts++;s.burstLeft=1.35;s.slackTime=0;
   }
   if(s.burstLeft>0){
    s.burstLeft=Math.max(0,s.burstLeft-dt);s.pulling=true;
    if(held)s.tension+=dt*.33*(s.pull||1);
    else{s.tension-=dt*.72;s.slackTime+=dt;}
    s.tension=Math.max(.06,Math.min(calm?.87:1,s.tension));
    if(!s.burstLeft&&s.slackTime>=.45)s.progress=Math.min(.96,s.progress+.075);
    return s.tension>=1?"escaped":"surge";
   }
  }
  // Long sweeping runs, fast darts and deep dives have different rest windows.
  const pattern=s.pattern||0;
  const run=Math.sin(s.age*(legendFights[s.legend]?.[2]||([1.45,2.2,.98,1.21][pattern]+.1*s.tier))-1.1)>[.41,.52,.24,.30][pattern];
  s.pulling=run;
  if(held){s.progress=Math.min(1,s.progress+dt*(s.speed||1)*(run?.14:.27));s.tension+=dt*(s.pull||1)*(run?.4+.025*s.tier:.17);}
  else{s.progress=Math.max(.025,s.progress-dt*(run?.043:.016));s.tension-=dt*.66;}
  s.tension=Math.max(.06,Math.min(calm?.87:1,s.tension));
  return s.progress>=1?"landed":s.tension>=1?"escaped":run?"run":"steady";
 }
 return{places,fish,pools,legend,legends,sharks,cupFish,seaTide,seaRig,seaWeight,layerOf,trail,tankLimit,tankIds,tankNames,aquariumLimit,fishInTank,hasRoom,nextTank,moveFish,residentRoster,speciesId,specimens,setExhibited,tackle,rigs,habitats,clues,clean,choose,tensionStep};
})();
