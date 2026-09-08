import type { Language } from '../types';
export const FACT_TOPICS = ['space','ocean','tiny-world','dinosaurs','earth','numbers'] as const;
export type FactTopic = typeof FACT_TOPICS[number];
export const TOPIC_NAMES: Record<FactTopic,[string,string]> = { space:['Space explorers','Exploradores espaciales'],ocean:['Ocean wonders','Maravillas del océano'],'tiny-world':['Tiny creatures','Criaturas pequeñas'],dinosaurs:['Dinosaur detectives','Detectives de dinosaurios'],earth:['Planet Earth','Planeta Tierra'],numbers:['Number magic','Magia de números'] };
export const FACT_SOURCES: Record<string,{name:string;url:string}> = {
 solar:{name:'NASA: Solar system facts',url:'https://science.nasa.gov/solar-system/solar-system-facts/'},
 sun:{name:'NASA: Sun facts',url:'https://science.nasa.gov/sun/facts/'},
 moon:{name:'NASA Space Place: The Moon',url:'https://spaceplace.nasa.gov/all-about-the-moon/en/'},
 mars:{name:'NASA Space Place: Mars',url:'https://spaceplace.nasa.gov/all-about-mars/en/'},
 coral:{name:'NOAA: Corals are animals',url:'https://oceanexplorer.noaa.gov/ocean-fact/coral-animal/'},
 sponge:{name:'NOAA: Sponges',url:'https://oceanservice.noaa.gov/facts/sponge.html'},
 octopus:{name:'Smithsonian: Cephalopods',url:'https://ocean.si.edu/ocean-life/invertebrates/octopuses-squids-and-relatives'},
 insects:{name:'Smithsonian: What is an insect?',url:'https://naturalhistory.si.edu/education/teaching-resources/life-science/what-insect'},
 dino:{name:'American Museum of Natural History: Dinosaur facts',url:'https://www.amnh.org/dinosaurs/dinosaur-facts'},
 fossils:{name:'American Museum of Natural History: Paleontology',url:'https://www.amnh.org/explore/ology/paleontology/what-is-paleontology'},
 water:{name:'USGS: Water cycle',url:'https://water.usgs.gov/edu/watercycle-kids-int.html'},
 deep:{name:'NOAA: Ocean depth',url:'https://oceanexplorer.noaa.gov/ocean-fact/ocean-depth/'},
};
export type FunFact = {id:string;topic:FactTopic;source:string;tags:string[];en:string;es:string};
// Brief original bilingual explanations. Sources checked 2026-09-05; avoid changing moon/species tallies.
const rows: [FactTopic,string,string,string,string][] = [
 ['space','solar','venus hottest caliente','Venus is hotter than Mercury, even though Mercury is closer to the Sun.','Venus es más caliente que Mercurio, aunque Mercurio está más cerca del Sol.'],
 ['space','solar','jupiter biggest grande','Jupiter is our solar system’s largest planet.','Júpiter es el planeta más grande de nuestro sistema solar.'],
 ['space','solar','rings anillos saturn','All four giant planets have rings, not just Saturn.','Los cuatro planetas gigantes tienen anillos, no solo Saturno.'],
 ['space','solar','mercury venus moons lunas','Mercury and Venus have no moons of their own.','Mercurio y Venus no tienen lunas propias.'],
 ['space','solar','milky way galaxy galaxia','Our solar system travels around the center of the Milky Way galaxy.','Nuestro sistema solar viaja alrededor del centro de la Vía Láctea.'],
 ['space','sun','sun star sol estrella','The Sun is a star, not a planet.','El Sol es una estrella, no un planeta.'],
 ['space','sun','sun hydrogen helium hidrogeno helio','The Sun is mostly hydrogen and helium.','El Sol está formado principalmente por hidrógeno y helio.'],
 ['space','sun','sun surface superficie','The Sun has no solid ground to stand on.','El Sol no tiene un suelo sólido donde pararse.'],
 ['space','sun','sunspots manchas solares','Sunspots look dark because they are cooler than the surrounding surface.','Las manchas solares se ven oscuras porque son más frías que la superficie cercana.'],
 ['space','sun','fusion energy energia','Inside the Sun, hydrogen joins to form helium and releases energy.','Dentro del Sol, el hidrógeno se une para formar helio y libera energía.'],
 ['space','moon','moon light luna luz','Moonlight is sunlight reflected from the Moon.','La luz de la Luna es luz del Sol reflejada.'],
 ['space','moon','moon footprints huellas','Without wind and rain, footprints on the Moon can remain for a very long time.','Sin viento ni lluvia, las huellas en la Luna pueden durar muchísimo tiempo.'],
 ['space','moon','moon craters crateres','Many lunar craters were made by space rocks hitting the Moon.','Muchos cráteres lunares se formaron cuando rocas espaciales golpearon la Luna.'],
 ['space','moon','moon face cara','The Moon rotates, but we mostly see the same side from Earth.','La Luna gira, pero desde la Tierra vemos casi siempre el mismo lado.'],
 ['space','moon','moon gravity gravedad','The Moon’s gravity is weaker than Earth’s. You would weigh less there.','La gravedad lunar es más débil que la terrestre. Allí pesarías menos.'],
 ['space','mars','mars red marte rojo','Rusty iron minerals help give Mars its reddish color.','Los minerales de hierro oxidados ayudan a dar a Marte su color rojizo.'],
 ['space','mars','mars moons lunas','Mars has two small moons, Phobos and Deimos.','Marte tiene dos lunas pequeñas: Fobos y Deimos.'],
 ['space','mars','mars day dia','A day on Mars lasts a little longer than a day on Earth.','Un día en Marte dura un poco más que un día en la Tierra.'],
 ['space','mars','mars seasons estaciones','Mars has seasons, just as Earth does.','Marte tiene estaciones, igual que la Tierra.'],
 ['space','mars','mars rocky rocoso','Mars is a rocky world with a thin atmosphere.','Marte es un mundo rocoso con una atmósfera delgada.'],
 ['ocean','coral','coral animal planta','Corals are animals, even though they can look like plants or rocks.','Los corales son animales, aunque parezcan plantas o piedras.'],
 ['ocean','coral','coral polyp polipo','A coral colony can contain many tiny animals called polyps.','Una colonia de coral puede tener muchos animalitos llamados pólipos.'],
 ['ocean','coral','coral backbone columna','Corals are invertebrates: they have no backbone.','Los corales son invertebrados: no tienen columna vertebral.'],
 ['ocean','coral','coral tentacles tentaculos','Coral polyps use tentacles to catch food.','Los pólipos del coral usan tentáculos para atrapar alimento.'],
 ['ocean','coral','coral algae algas','Some corals share their homes with algae that help provide food.','Algunos corales comparten su hogar con algas que ayudan a producir alimento.'],
 ['ocean','sponge','sponge esponja animal','Living sea sponges are animals, not plants.','Las esponjas marinas vivas son animales, no plantas.'],
 ['ocean','sponge','sponge freshwater dulce','Not every sponge lives in the sea; some live in fresh water.','No todas las esponjas viven en el mar; algunas viven en agua dulce.'],
 ['ocean','sponge','sponge filter filtrar','Sponges filter water to collect tiny food particles.','Las esponjas filtran agua para recoger partículas pequeñas de alimento.'],
 ['ocean','sponge','sponge coral different diferente','Sponges and corals are different kinds of animals.','Las esponjas y los corales son tipos distintos de animales.'],
 ['ocean','sponge','sponge reef arrecife','Sponges help recycle nutrients in reef ecosystems.','Las esponjas ayudan a reciclar nutrientes en los arrecifes.'],
 ['ocean','octopus','octopus hearts pulpo corazones','An octopus has three hearts.','Un pulpo tiene tres corazones.'],
 ['ocean','octopus','octopus blood sangre azul','Oxygen-carrying copper helps give octopus blood its blue color.','El cobre que transporta oxígeno ayuda a dar color azul a la sangre del pulpo.'],
 ['ocean','octopus','octopus gills branquias','Two octopus hearts send blood through its gills.','Dos corazones del pulpo envían sangre por sus branquias.'],
 ['ocean','octopus','octopus arms brazos','An octopus has eight arms with suckers.','Un pulpo tiene ocho brazos con ventosas.'],
 ['ocean','octopus','octopus camouflage camuflaje','Many octopuses change color to blend into their surroundings.','Muchos pulpos cambian de color para confundirse con su entorno.'],
 ['tiny-world','insects','insect legs insecto patas','Adult insects have six legs. Spiders have eight, so they are not insects.','Los insectos adultos tienen seis patas. Las arañas tienen ocho, así que no son insectos.'],
 ['tiny-world','insects','insect body cuerpo','An insect’s three main body sections are head, thorax, and abdomen.','Las tres partes principales de un insecto son cabeza, tórax y abdomen.'],
 ['tiny-world','insects','insect antennae antenas','Insect antennae help detect signals in the world around them.','Las antenas de los insectos ayudan a detectar señales a su alrededor.'],
 ['tiny-world','insects','beetle wings escarabajo alas','A beetle’s hard wing covers protect the flying wings underneath.','Las cubiertas duras de un escarabajo protegen sus alas de vuelo.'],
 ['tiny-world','insects','fly balance mosca equilibrio','Flies have tiny balancing structures called halteres.','Las moscas tienen pequeñas estructuras de equilibrio llamadas halterios.'],
 ['dinosaurs','dino','birds dinosaurs aves dinosaurios','Birds are living dinosaurs. The dinosaur story is not completely over!','Las aves son dinosaurios vivos. ¡Su historia no ha terminado del todo!'],
 ['dinosaurs','dino','dinosaur continents continentes','Dinosaur fossils have been found on every continent.','Se han encontrado fósiles de dinosaurios en todos los continentes.'],
 ['dinosaurs','dino','dinosaur feathers plumas','Some dinosaurs had feathers before any dinosaur could fly.','Algunos dinosaurios tenían plumas antes de que alguno pudiera volar.'],
 ['dinosaurs','dino','dinosaur footprints huellas','Fossil footprints can give clues about how dinosaurs moved.','Las huellas fósiles dan pistas sobre cómo se movían los dinosaurios.'],
 ['dinosaurs','dino','dinosaur extinction extincion','Non-bird dinosaurs disappeared about 66 million years ago.','Los dinosaurios que no eran aves desaparecieron hace unos 66 millones de años.'],
 ['dinosaurs','fossils','fossil plants plantas','Plants can become fossils too. Fossils are not only animal bones.','Las plantas también pueden fosilizarse. Los fósiles no son solo huesos.'],
 ['dinosaurs','fossils','amber ambar insect','Amber is fossilized tree resin that can preserve tiny creatures.','El ámbar es resina de árbol fosilizada que puede conservar criaturas pequeñas.'],
 ['dinosaurs','fossils','paleontologist paleontologo','Paleontologists use fossils to investigate ancient life.','Los paleontólogos usan fósiles para investigar la vida antigua.'],
 ['dinosaurs','fossils','fossil teeth dientes','Teeth, shells, and eggs can all be body fossils.','Dientes, conchas y huevos pueden ser fósiles de partes del cuerpo.'],
 ['dinosaurs','fossils','trace fossils rastros','A trace fossil records activity, like an ancient footprint.','Un fósil de rastro conserva una actividad, como una huella antigua.'],
 ['earth','water','water cycle ciclo agua','Earth’s water keeps moving through the water cycle.','El agua de la Tierra se mueve continuamente por el ciclo del agua.'],
 ['earth','water','water solid liquid gas solido','Water can be solid ice, liquid water, or water vapor.','El agua puede ser hielo sólido, agua líquida o vapor.'],
 ['earth','water','evaporation evaporacion sun','Energy from the Sun helps liquid water evaporate.','La energía del Sol ayuda a evaporar el agua líquida.'],
 ['earth','water','transpiration transpiracion plants','Plants release water vapor through their leaves.','Las plantas liberan vapor de agua por sus hojas.'],
 ['earth','water','clouds wind nubes viento','Winds move clouds and help carry water around our planet.','Los vientos mueven las nubes y ayudan a transportar agua por el planeta.'],
 ['earth','deep','ocean floor fondo','The ocean floor has mountains and valleys, not just flat ground.','El fondo del océano tiene montañas y valles, no solo terreno plano.'],
 ['earth','deep','challenger deep mariana','Challenger Deep is in the Mariana Trench in the Pacific Ocean.','El abismo Challenger está en la fosa de las Marianas, en el océano Pacífico.'],
 ['earth','deep','ocean average depth profundidad','The ocean’s average depth is roughly 3.7 kilometers.','La profundidad media del océano es de aproximadamente 3.7 kilómetros.'],
 ['earth','deep','ocean deep eleven once','The deepest known ocean point is almost 11 kilometers below the surface.','El punto oceánico más profundo conocido está a casi 11 kilómetros de la superficie.'],
 ['earth','deep','satellite map ocean satelite','Tiny sea-surface changes help satellites estimate the shape of the ocean floor.','Pequeños cambios de la superficie marina ayudan a estimar el relieve del fondo con satélites.'],
 ['numbers','','zero even cero par','Zero is even: it can be split into two equal whole-number groups of zero.','Cero es par: puede dividirse en dos grupos iguales de cero.'],
 ['numbers','','prime two primo dos','Two is the only even prime number. Every larger even number is divisible by two.','Dos es el único número primo par. Todo par mayor es divisible entre dos.'],
 ['numbers','','triangle triangulo','A triangle has three sides. Try drawing three different triangles.','Un triángulo tiene tres lados. Intenta dibujar tres triángulos distintos.'],
 ['numbers','','square cuadrado','A square has four equal sides and four right angles.','Un cuadrado tiene cuatro lados iguales y cuatro ángulos rectos.'],
 ['numbers','','hexagon hexagono','A hexagon has six sides. Count them on a drawing!','Un hexágono tiene seis lados. ¡Cuéntalos en un dibujo!'],
 ['numbers','','cube cubo','A cube has six square faces, twelve edges, and eight corners.','Un cubo tiene seis caras cuadradas, doce aristas y ocho esquinas.'],
 ['numbers','','chessboard ajedrez','An eight-by-eight board has 64 small squares because 8 times 8 is 64.','Un tablero de ocho por ocho tiene 64 cuadritos porque 8 por 8 es 64.'],
 ['numbers','','sum suma ten diez','The numbers from 1 through 10 add up to 55. Pair 1 with 10, 2 with 9, and so on.','Los números del 1 al 10 suman 55. Junta 1 con 10, 2 con 9, y así sucesivamente.'],
 ['numbers','','half quarters mitad cuartos','One half and two quarters describe the same amount.','Una mitad y dos cuartos representan la misma cantidad.'],
 ['numbers','','minute seconds minuto segundos','Five minutes contain 300 seconds: 5 times 60.','Cinco minutos tienen 300 segundos: 5 por 60.'],
 ['numbers','','kilometer metro kilometro','One kilometer is exactly 1,000 meters.','Un kilómetro equivale exactamente a 1,000 metros.'],
 ['numbers','','palindrome palindromo','121 reads the same backward and forward. It is a number palindrome.','121 se lee igual de izquierda a derecha y al revés. Es un número palíndromo.'],
 ['numbers','','multiply zero multiplicar cero','Any whole number multiplied by zero gives zero.','Cualquier número entero multiplicado por cero da cero.'],
 ['numbers','','odd impar','Adding two odd whole numbers always gives an even number. Try 3 plus 5!','Sumar dos enteros impares siempre da un número par. ¡Prueba 3 más 5!'],
 ['numbers','','rectangle rectangulo','You can find a rectangle’s area by multiplying its length by its width.','El área de un rectángulo se obtiene multiplicando su largo por su ancho.'],
 ['numbers','','double duplicar','Doubling 1 ten times gives 1,024. Small beginnings can grow quickly!','Duplicar el 1 diez veces da 1,024. ¡Algo pequeño puede crecer rápido!'],
 ['numbers','','nine nueve','The digits in 9 times any whole number add to a multiple of 9, or zero.','Las cifras del producto de 9 por un entero no negativo suman un múltiplo de 9, o cero.'],
 ['numbers','','percent porcentaje','Fifty percent means fifty out of a hundred: exactly one half.','Cincuenta por ciento significa cincuenta de cien: exactamente la mitad.'],
 ['numbers','','fraction fraccion','One third plus one third plus one third makes one whole.','Un tercio más un tercio más un tercio forman un entero.'],
 ['numbers','','order ordenar multiply','Three rows of four dots and four rows of three dots both contain twelve dots.','Tres filas de cuatro puntos y cuatro filas de tres puntos tienen doce puntos.'],
];
export const FUN_FACTS: readonly FunFact[] = rows.map(([topic,source,tags,en,es],i)=>({id:`fact-${i+1}`,topic,source,tags:tags.split(' '),en,es}));
export function nextFact(topic:FactTopic|'all', seen: readonly string[]): FunFact {
  const pool=FUN_FACTS.filter(f=>topic==='all'||f.topic===topic), remaining=pool.filter(f=>!seen.includes(f.id));
  const choices=remaining.length?remaining:pool.filter(f=>f.id!==seen.at(-1));
  return choices[Math.floor(Math.random()*choices.length)]??pool[0];
}
const normalize=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9 ]/g,' ');
export function findFact(question:string):FunFact|null {
  const tokens=new Set(normalize(question).split(/\s+/).filter(t=>t.length>2));
  const ranked=FUN_FACTS.map(f=>({f,n:f.tags.filter(t=>tokens.has(t)).length})).sort((a,b)=>b.n-a.n);
  return ranked[0]?.n>=2?ranked[0].f:null;
}
export const factText=(f:FunFact,language:Language)=>language==='es-MX'?f.es:f.en;
export const FACT_QUIZZES = [
 {q:['Which planet is hottest?','¿Qué planeta es el más caliente?'],a:['Venus','Mars / Marte','Mercury / Mercurio'],correct:0,fact:'fact-1'},
 {q:['How many hearts does an octopus have?','¿Cuántos corazones tiene un pulpo?'],a:['1','2','3'],correct:2,fact:'fact-31'},
 {q:['What are corals?','¿Qué son los corales?'],a:['Plants / Plantas','Animals / Animales','Rocks / Rocas'],correct:1,fact:'fact-21'},
 {q:['How many legs does an adult insect have?','¿Cuántas patas tiene un insecto adulto?'],a:['6','8','10'],correct:0,fact:'fact-36'},
 {q:['Which dinosaurs are alive today?','¿Qué dinosaurios viven hoy?'],a:['T. rex','Triceratops','Birds / Aves'],correct:2,fact:'fact-41'},
 {q:['Where does moonlight come from?','¿De dónde viene la luz de la Luna?'],a:['The Sun / El Sol','A lamp / Una lámpara','Fire / Fuego'],correct:0,fact:'fact-11'},
 {q:['What is one half equal to?','¿A qué equivale una mitad?'],a:['One quarter / Un cuarto','Two quarters / Dos cuartos','Three quarters / Tres cuartos'],correct:1,fact:'fact-69'},
 {q:['How many small squares make an 8 by 8 board?','¿Cuántos cuadritos tiene un tablero de 8 por 8?'],a:['16','32','64'],correct:2,fact:'fact-67'},
] as const;
