/* Datos de diseño. El catálogo no registra enemigos ni activa combates. */
const CHAMBER_TEMPLATES = Object.freeze({
 miniboss:Object.freeze({
  size:'12–16 × 9–12 casillas',
  entrance:'Dintel bajo y acceso lateral de dos casillas',
  perimeter:'Pilares separados y muros rotos que enmarcan el recinto',
  center:'Espacio despejado para el duelo',
  lighting:'Luz del estrato con un foco apagado o residual',
  accents:'Dos elementos del oficio o hábitat del guardián'
 }),
 boss:Object.freeze({
  size:'20–26 × 14–18 casillas',
  entrance:'Portal axial y tramo de aproximación ceremonial',
  perimeter:'Muros y columnas que conservan la lectura de arena',
  center:'Pedestal, reliquia o resto arquitectónico dominante',
  lighting:'Color del estrato y luces que separan umbral, perímetro y centro',
  accents:'Motivos propios del jefe, con el área de duelo despejada'
 }),
 final:Object.freeze({
  size:'28–34 × 20–26 casillas',
  entrance:'Pórtico de la Última Fragua y puente sobre canales',
  perimeter:'Nave de piedra oscura y contrafuertes de hierro',
  center:'Gran yunque elevado con runas y canales convergentes',
  lighting:'Fuego rojo en los bordes y luz blanca sobre el yunque',
  accents:'Yunques laterales, runas, canales de energía y fuego'
 })
});

const ENCOUNTER_CATALOG = (() => {
 const entry=(id,name,layer,rank,recommendedLevel,story,theme,chamber,phases,patterns,rewards,status='pending')=>
  Object.freeze({id,name,layer,rank,recommendedLevel,story,theme,chamber,phases,
   patterns:Object.freeze(patterns),rewards:Object.freeze(rewards),status});
 return Object.freeze([
  entry('centinela-desgastado','Centinela Desgastado',0,'miniboss',1,
   'Vigila un camino de superficie que ya nadie utiliza.','Hierro oxidado y piedra húmeda','miniboss',2,
   ['Guardia y golpe directo','Abre su guardia tras un golpe fallido'],['Placa del centinela']),
  entry('guardian-del-umbral','Guardián del Umbral',0,'boss',2,
   'Custodia el último portón que comunicaba con el refugio.','Piedra labrada y herrajes dorados','boss',3,
   ['Escudo y empuje','Golpe cargado anunciado','Contraataque tras defensas consecutivas'],['Llave del Umbral','Fragmento del primer descenso']),
  entry('viuda-de-carbon','Viuda de Carbón',1,'miniboss',3,
   'Teje su nido en la Galería Silenciosa, tras los sellos existentes.','Seda negra y carbón','miniboss',3,
   ['Secuencia de ataques por turnos existente','Amenazas anunciadas y enredo con seda','Cambios de fase existentes'],['Colmillo de la Viuda','Botín y registros actuales de la Galería'],'implemented'),
  entry('capataz-encadenado','Capataz Encadenado',1,'boss',4,
   'Su última orden aún resuena en los pozos.','Cadenas y lámparas de hierro','boss',3,
   ['Azote de cadena','Tirón anunciado','Cadena rota y golpes alternos'],['Insignia del capataz','Fragmento del turno perdido']),
  entry('acechador-de-esporas','Acechador de Esporas',2,'miniboss',5,
   'Caza siguiendo las vibraciones entre los hongos.','Pelusa verde y tallos quebrados','miniboss',2,
   ['Zarpazo','Esporas precedidas por una postura defensiva'],['Glándula de esporas']),
  entry('madre-micelia','Madre Micelia',2,'boss',6,
   'Mantiene unidos los brotes que invadieron las galerías.','Micelio luminoso entre raíces','boss',3,
   ['Látigo de raíces','Nube tóxica anunciada','Recupera fuerza mientras conserva su coraza'],['Núcleo micelial','Fragmento de la colonia']),
  entry('caballero-sin-juramento','Caballero Sin Juramento',3,'miniboss',7,
   'Vela por una tumba cuyo nombre fue borrado.','Armadura partida y estandarte gris','miniboss',2,
   ['Tajo y parada','Pierde defensa al quebrarse el escudo'],['Broche del juramento']),
  entry('rey-de-las-cenizas','Rey de las Cenizas',3,'boss',8,
   'Reclama un trono que quedó vacío tras la caída del reino.','Ceniza, cobre y piedra funeraria','boss',3,
   ['Mandoble','Golpe de ceniza anunciado','Coraza quebrada y daño persistente'],['Corona de ceniza','Fragmento de la caída']),
  entry('vigia-de-cuarzo','Vigía de Cuarzo',4,'miniboss',9,
   'Protege una veta que los mineros dejaron intacta.','Flecos de cuarzo y reflejos azules','miniboss',2,
   ['Impactos de cristal','La coraza refleja el primer golpe de la secuencia'],['Lente de cuarzo']),
  entry('corazon-prismatico','Corazón Prismático',4,'boss',10,
   'Una veta viva concentra el resplandor de la caverna.','Cristal facetado y anillos de luz','boss',3,
   ['Pulsos cortos','Haz anunciado','Alternancia entre facetas expuestas y blindadas'],['Faceta del corazón','Fragmento de la veta viva']),
  entry('devorador-de-escoria','Devorador de Escoria',5,'miniboss',11,
   'Consume los residuos de los hornos clausurados.','Escoria negra con juntas encendidas','miniboss',2,
   ['Mordisco','Se sobrecalienta y expone el vientre'],['Nódulo de escoria']),
  entry('senor-de-la-forja-rota','Señor de la Forja Rota',5,'boss',12,
   'Martillea una forja incapaz de sostener el fuego.','Hierro chamuscado y hornos fracturados','boss',3,
   ['Martillazo','Golpe cargado anunciado','Ciclos de quemadura y enfriamiento'],['Martillo de la forja rota','Fragmento de los hornos']),
  entry('heraldo-del-silencio','Heraldo del Silencio',6,'miniboss',13,
   'Aparece cuando se apagan los ecos del descenso.','Piedra azul oscura y máscara velada','miniboss',2,
   ['Golpe velado','Se descubre tras un turno que agota energía'],['Máscara del heraldo']),
  entry('el-que-susurra-bajo-la-piedra','El Que Susurra Bajo la Piedra',6,'boss',14,
   'Recita los nombres de quienes cavaron demasiado hondo.','Estratos negros con inscripciones tenues','boss',3,
   ['Susurro que consume energía','Pulso anunciado','Debilitamiento temporal y golpes periódicos'],['Sello del silencio','Fragmento del abismo']),
  entry('ultimo-custodio','Último Custodio',7,'miniboss',15,
   'Guarda el paso a la nave de los primeros forjadores.','Armadura ceremonial con bronce oscuro','miniboss',2,
   ['Guardia y estocada','Desafío que exige alternar defensa y ataque'],['Emblema del custodio']),
  entry('el-primer-forjador','El Primer Forjador',7,'boss',16,
   'Conserva la última brasa del reino y recuerda cómo se encendió.','Yunque monumental, runas y fuego blanco','final',3,
   ['Golpes medidos de martillo','Descarga rúnica anunciada','Alternancia de energía, fuego y ventanas de defensa'],['Brasa primera','Fragmento del origen de la Fragua'])
 ]);
})();
