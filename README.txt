LA ÚLTIMA FRAGUA 2.0 — ALPHA 3.9.4.2 · RUNAS, BASURERO Y CONSTRUCCIONES

- Engastes de runas desde Personaje: seleccionar espada, pico, casco, pechera, pantalones, botas o escudo.
- Runa de veneno fabricada con el colmillo de la Viuda: se puede engastar en la espada aunque esté en la hotbar; aplica veneno en combate.
- Nueva Runa de Veta: engastar en pico para posibilidad de mineral adicional; no omite tier necesario.
- Nueva Runa de Guardia: se puede colocar en armaduras o escudo para reducir daño.
- Las runas se pueden extraer sin perderlas; al cambiar armadura la runa viaja con la pieza.
- Mochila: soltar una unidad o pila en el suelo cercano; eliminar una unidad o pila con confirmación.
- Corrección visual de muros y esquinas; estructuras anteriores permanecen intactas.
- Guarda sobre la misma versión interna 4, sin limpiar IndexedDB ni datos locales. Exportar respaldo antes de instalar.
- Caché PWA y panel Novedades actualizados.

LA ÚLTIMA FRAGUA 2.0 — ALPHA 3.9.4.1 · PELIGROS DE LAS PROFUNDIDADES

- Los mobs escalan vida, daño, rapidez de ataque/seguimiento, variantes veteranas y XP por estrato.
- Viuda de Carbón con salud y daño ajustados; el combate conserva sus tres fases.
- Nueva geografía procedural por semilla: escaleras, ascensores, ruinas, campamentos y Galería Silenciosa cambian de lugar en cada NUEVA PARTIDA.
- Las rutas importantes están excavadas/alcanzables; no se revelan coordenadas en el HUD.
- Minas Abandonadas: alijo único oculto con 1 cristal y 2 antorchas; murciélagos de los primeros tres estratos tienen 1% de probabilidad de soltar cristal.
- La clave y el formato de los guardados permanecen: los mundos antiguos mantienen las ubicaciones previas (worldLayoutVersion=0).
- Novedades muestra solo los cambios de esta versión al abrir, historial en Ajustes.

INSTALACIÓN: subir el ZIP completo en Cloudflare Pages, mismo proyecto. Exporta un respaldo antes de actualizar. NO desinstales la PWA ni borres datos del sitio.

LA ÚLTIMA FRAGUA 2.0 — ALPHA 3.9.4 · EL CAMINO DEL FORJADOR

NOVEDADES
- Experiencia por minería natural (sin XP por romper bloques que colocaste), fundición de lingotes y derrotas de criaturas/miniboss.
- Nivel de personaje con barra de XP en HUD independiente del estrato.
- Habilidades: Minería (+1 golpe por rango), Combate (+10% daño por rango, +4 EN/s), Herrería (-10% tiempo de fundición por rango).
- Cada nivel otorga un punto; especializaciones disponibles desde NV 2/3/4, máximo cinco rangos con requisitos escalonados hasta nivel 16.
- Progresión guardada en el mismo formato versión 4 y reconocimiento inicial de estadísticas de partidas previas.
- Se mantiene la necesidad de forjar picos para minerales de alta dureza.
- Aviso de Novedades con solo los cambios de esta versión e historial en Ajustes.

INSTALACIÓN: subir el contenido ZIP al MISMO proyecto Cloudflare Pages.
ANTES: exportar respaldo desde Pausa. No borrar datos del sitio, ni desinstalar PWA.

LA ÚLTIMA FRAGUA 2.0 — ALPHA 3.9.2.2
Actualización de ícono PWA: la entrada de la cueva ilustrada del Diario de Khaz'dûn pasa a ser el ícono de la aplicación, Apple Touch Icon y favicon del navegador.
No modifica game.js, style.css, ni claves/formato de guardado. No borrar datos del sitio.
Los iconos de apps ya instaladas pueden tardar en actualizarse por caché del sistema operativo; NO desinstalar sin exportar respaldo antes.


Alpha 3.9.3 — HUD Renovado
- Nueva cabecera de zona, cuatro iconos superiores y minimapa circular táctil.
- Indicador de vida y aguante junto al joystick.
- Hotbar central más discreta. Conserva guardados, mundo y las funciones anteriores.
- El minimapa revela solo celdas exploradas. Se toca para abrir el mapa completo.


ALPHA 3.9.3.1 — FORJA DE HERRAMIENTAS
- Recetas → FORJA muestra Pico y Espada, estado y materiales requeridos.
- Forjar cerca de una mesa, horno o yunque inicial en superficie.
- Cobre (3 lingotes + 1 tronco) permite minar oro, cristal y mithril.
- Siguientes mejoras: hierro y oro.
- La espada básica se fabrica en Recetas → Herramientas; luego se forja.
- Conserva partidas de las versiones anteriores, sin alterar las claves de guardado.


Alpha 3.9.3.2 — NOVEDADES: al abrir, muestra únicamente cambios del deploy actual, una vez por dispositivo. Historial en Ajustes > Novedades. Para futuros deploys, añadir una entrada en RELEASE_HISTORY y actualizar RELEASE_VERSION, HTML JS/CSS con ?v=..., y CACHE en sw.js. El progreso se mantiene en IndexedDB original.
