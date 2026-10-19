Voy a fijar una arquitectura modernizada basada en `IndexedDB`, sincronización manual con Google Sheets y una experiencia operativa móvil/escritorio, dejando explícita la limitación de que el ZIP recibido contiene solo el manifiesto.La dirección queda cerrada: reconstrucción modernizada de los seis módulos visibles, operación local-first en `IndexedDB`, sincronización manual y auditable con Google Sheets, sin cuentas ni backend de datos. </comment>



# ClaraSoft Modern

## 1. Overview

ClaraSoft Modern será una SPA local-first y modular construida con React, TypeScript y Vite para administrar ventas, compras, producción, clientes y configuración operativa desde escritorio, tablet o móvil. Reemplazará la arquitectura React/Python original por una aplicación completamente cliente, ejecutable en local sin backend.

El flujo principal será un punto de venta rápido, conectado a inventario, clientes y movimientos de caja. Los demás módulos permitirán revisar ventas, registrar compras, transformar insumos mediante órdenes de producción, administrar catálogos y sincronizar datos con Google Sheets.

### Alcance de la primera versión

- Punto de venta con búsqueda, categorías, carrito, cantidades, descuentos y cobro.
- Historial y detalle de ventas.
- Registro e historial de compras.
- Órdenes de producción y consumo de insumos.
- Directorio e historial de clientes.
- Administración de productos, insumos, existencias, precios y parámetros.
- Persistencia exclusivamente local mediante `IndexedDB`.
- Importación y exportación manual de libros XLSX y archivos CSV compatibles con Google Sheets.
- Vista previa, validación, detección de duplicados y reporte de errores antes de importar.
- Diseño responsive con navegación inferior en móvil y lateral en escritorio.
- Tema claro/oscuro controlado por el usuario.
- Interfaz en español.

### Fuera de alcance

- Cuentas, inicio de sesión, roles y permisos reales.
- Base de datos alojada o sincronización entre múltiples dispositivos.
- Facturación fiscal, pagos en línea o conexión con terminal bancaria.
- Conexión directa, OAuth o sincronización automática con Google Sheets.
- Backend propio, API remota o servicios Lyzr durante la operación normal.
- Reproducción exacta de lógica que no pueda verificarse en el manifiesto recibido.
- Eliminación automática de registros remotos durante una sincronización.

### Restricción de migración

El archivo recibido expone el manifiesto de 142 entradas, pero no el contenido binario extraíble. La implementación tomará los módulos, nombres y arquitectura visibles como referencia. Antes de declarar paridad con el sistema anterior deberá ejecutarse una revisión funcional contra el ZIP fuente real.

### Criterios de éxito

- Una venta común puede completarse en menos de 45 segundos.
- Cada movimiento actualiza existencias de forma transaccional en el dispositivo.
- La app funciona sin conexión después de la primera carga.
- Una importación nunca sobrescribe datos sin presentar primero un resumen.
- Los errores de validación identifican el archivo, hoja, fila, campo y corrección necesaria.
- Las tablas y acciones esenciales son utilizables en pantallas desde 360 px.

## 2. User Stories

### Operación de caja

- Como vendedor, quiero localizar productos por nombre, código o categoría para agregarlos rápidamente al carrito.
- Como vendedor, quiero modificar cantidades, descuentos y cliente antes de cobrar.
- Como vendedor, quiero elegir efectivo, tarjeta, transferencia u otro método y registrar el monto recibido.
- Como vendedor, quiero ver cambio, subtotal, descuento y total antes de confirmar.
- Como vendedor, quiero emitir una vista imprimible o descargar un comprobante simple.
- Como vendedor, quiero suspender o cancelar un carrito sin modificar existencias.

### Ventas y compras

- Como operador, quiero filtrar ventas por fecha, cliente, método y estado.
- Como operador, quiero abrir una venta para revisar sus líneas, totales y trazabilidad.
- Como encargado, quiero registrar compras con proveedor, productos, costos y referencia.
- Como encargado, quiero que una compra confirmada incremente existencias.
- Como encargado, quiero anular movimientos mediante reversos auditables, no borrando su historial.

### Producción

- Como responsable de producción, quiero crear una orden con producto terminado y cantidad objetivo.
- Como responsable, quiero ver los insumos requeridos y detectar faltantes antes de iniciar.
- Como responsable, quiero registrar cantidades reales consumidas y producidas.
- Como responsable, quiero completar o cancelar una orden conservando su trazabilidad.
- Como encargado, quiero que completar producción descuente insumos e incremente producto terminado en una sola operación.

### Clientes y administración

- Como operador, quiero crear y editar clientes con datos mínimos y notas.
- Como operador, quiero consultar compras e importe acumulado de un cliente.
- Como administrador local, quiero gestionar productos, categorías, insumos, recetas, proveedores y ajustes de inventario.
- Como administrador local, quiero exportar un respaldo y restaurarlo con una vista previa.

### Intercambio CSV/XLSX

- Como encargado, quiero importar libros XLSX o archivos CSV exportados desde Google Sheets.
- Como encargado, quiero mapear hojas y columnas cuando el archivo no use la plantilla oficial.
- Como encargado, quiero revisar altas, cambios, duplicados y conflictos antes de aplicarlos.
- Como encargado, quiero exportar todos los módulos o un rango seleccionado a XLSX/CSV.
- Como encargado, quiero descargar un informe cuando una fila no pueda procesarse.

## 3.a. Agent Architecture

No se crearán agentes. Ventas, inventario, producción, validación de archivos y resolución de conflictos usarán lógica determinista dentro de la aplicación React.

| Agent Type | Agent Name | Description | Tools/Data Sources | Trigger | Provider | Model | Temperature | Top_p |
|---|---|---|---|---|---|---|---:|---:|
| — | — | No aplica; la aplicación funciona completamente en local. | — | — | — | — | — | — |

### Arquitectura React

- React + TypeScript con Vite como servidor de desarrollo y empaquetador.
- Componentes organizados por dominios: `pos`, `sales`, `purchases`, `production`, `customers`, `inventory`, `admin` e `imports`.
- Estado de interfaz mediante hooks y contextos pequeños por dominio; sin un contexto global monolítico.
- Capa de repositorios para aislar `IndexedDB` de componentes y casos de uso.
- Servicios puros para totales, existencias, folios, recetas, validación y conciliación.
- Web Workers para procesar libros grandes sin bloquear la interfaz.
- CSS modular y variables de diseño; sin dependencia de Next.js, Python o Tailwind.
- Dependencias mínimas: `react`, `react-dom`, `vite`, TypeScript y `xlsx` para leer/escribir libros en el navegador.

## 3.c. Local Domain Model

Entidades almacenadas en `IndexedDB`:

- `products`: código, nombre, categoría, unidad, precio, costo, existencia, mínimo, activo.
- `ingredients`: código, nombre, unidad, costo, existencia, mínimo, activo.
- `recipes`: producto terminado, rendimiento y líneas de insumos.
- `customers`: nombre, contacto, notas, fecha de alta y estado.
- `suppliers`: nombre, contacto, notas y estado.
- `sales`: folio, fecha, cliente opcional, líneas, descuentos, impuestos configurables, total, pago y estado.
- `purchases`: folio, fecha, proveedor opcional, líneas, total, referencia y estado.
- `productionOrders`: folio, producto, cantidad prevista/real, consumos previstos/reales, fechas y estado.
- `inventoryMovements`: entidad origen, tipo, artículo, cantidad, saldo resultante y fecha.
- `settings`: moneda, impuestos, métodos de pago, folios, negocio y preferencias.
- `syncRuns`: inicio, fin, archivo, alcance, dirección, resumen, errores y estado.
- `syncMappings`: módulo local, hoja, columnas, transformaciones y versión del esquema.

Cada registro sincronizable tendrá `id`, `createdAt`, `updatedAt`, `deletedAt` opcional, `version`, `deviceId` y `syncStatus`.

## 3.d. Business Rules

- Solo movimientos confirmados afectan existencias.
- Una venta confirmada descuenta productos; una compra confirmada incrementa existencias.
- Una producción completada aplica consumos y rendimientos atómicamente.
- Las existencias negativas estarán bloqueadas por defecto y podrán habilitarse desde ajustes.
- Ventas, compras y órdenes confirmadas no se editan: se corrigen mediante cancelación/reverso.
- Los folios usan prefijo configurable y contador local.
- Un borrado sincronizable será lógico mediante `deletedAt`.
- La restauración de respaldos valida versión, estructura e identificadores antes de escribir.
- Los importes se almacenan en unidades menores para evitar errores de redondeo.

## 3.e. CSV/XLSX Import and Export

### Importación

Flujo manual iniciado desde Administración → Importar y exportar:

1. Seleccionar o arrastrar un archivo `.xlsx` o `.csv`.
2. Detectar hojas, encabezados, codificación y separadores.
3. Elegir el módulo de destino y mapear columnas si no coincide con la plantilla.
4. Normalizar fechas, moneda, números, unidades e identificadores.
5. Validar el archivo completo sin modificar `IndexedDB`.
6. Mostrar nuevos, actualizados, duplicados, sin cambios, inválidos y conflictos.
7. Resolver conflictos por registro y elegir si los errores bloquean todo o se omiten.
8. Crear automáticamente un respaldo JSON.
9. Aplicar los cambios aprobados en una transacción local.
10. Guardar el resultado en `syncRuns` como historial de intercambio.

### Política de conflictos

- Mismo `id` y mayor `version` importada: proponer actualización.
- Mismo `id` modificado localmente desde la última exportación: exigir elección entre local, archivo o duplicado.
- Registro sin identificador: importar como nuevo solo después de validarlo.
- Coincidencia probable por código o referencia: marcar como posible duplicado.
- Campo vacío: no eliminar el valor local salvo que el usuario lo confirme.
- Venta o movimiento confirmado: tratar como inmutable y crear una corrección, no sobrescribir.
- Eliminaciones físicas en el archivo nunca se propagan automáticamente.

### Exportación

- Exportación completa a un libro XLSX con una hoja por módulo.
- Exportación parcial por módulo, rango de fechas, estado o selección.
- CSV disponible para una sola entidad por archivo.
- Plantilla XLSX vacía con encabezados, formatos y ejemplos opcionales.
- Nombres de hojas: `Productos`, `Insumos`, `Recetas`, `Clientes`, `Proveedores`, `Ventas`, `Compras`, `Produccion`, `Movimientos` y `Configuracion`.
- Los archivos generados serán compatibles con carga manual en Google Sheets.

## 3.f. Reliability, Privacy, and Accessibility

- Copia de seguridad JSON antes de importaciones y restauraciones.
- Indicador persistente de cambios pendientes, última sincronización y errores.
- Operaciones transaccionales de inventario en `IndexedDB`.
- Recuperación de borradores tras cierre accidental.
- Los datos empresariales permanecen en el dispositivo salvo los archivos que el usuario exporte manualmente.
- Los archivos seleccionados se procesan en memoria en el navegador y no se suben a ningún servicio.
- Confirmación reforzada para anulaciones, restauraciones y cambios masivos.
- Navegación por teclado, foco visible, etiquetas accesibles y objetivos táctiles mínimos de 44 px.
- Contraste AA, estados no dependientes solo del color y tablas con alternativa compacta en móvil.

## 3.g. Database Configuration

No se aprovisionará PostgreSQL ni autenticación. La decisión de producto es persistencia exclusiva en el navegador mediante `IndexedDB`.

- El dispositivo y perfil del navegador constituyen el límite de datos.
- Borrar los datos del navegador puede eliminar la información local.
- El usuario deberá descargar respaldos JSON o exportaciones XLSX como mecanismos de recuperación.
- No se prometerá colaboración multiusuario ni continuidad entre dispositivos.
- No se usará `localStorage` para registros operativos; solo podrá guardar preferencias visuales no sensibles.

## 4. User Flow

### Inicio operativo

1. La app abre directamente en Punto de venta.
2. Si no existen datos, ofrece cargar datos de ejemplo, importar respaldo o configurar catálogo.
3. El operador busca productos y arma el carrito.
4. Selecciona cliente opcional, descuento y método de pago.
5. Revisa el resumen y confirma.
6. La app registra venta, líneas y movimientos en una transacción.
7. Muestra comprobante y opciones de imprimir, descargar o iniciar nueva venta.

### Compras

1. Abrir Ventas y compras → Compras.
2. Crear compra y seleccionar proveedor.
3. Añadir productos o insumos con cantidad y costo.
4. Guardar borrador o confirmar.
5. Al confirmar, actualizar costos configurados y existencias.
6. Mostrar detalle y trazabilidad del movimiento.

### Producción

1. Crear orden y seleccionar producto/receta.
2. Introducir cantidad objetivo.
3. Ver requerimientos, disponibilidad y faltantes.
4. Iniciar, registrar consumos reales y completar.
5. Aplicar movimientos atómicos y mostrar variaciones.

### Clientes

1. Buscar o crear cliente.
2. Editar contacto y notas.
3. Consultar métricas e historial de compras.
4. Iniciar una venta con el cliente preseleccionado.

### Importación y exportación

1. Abrir Administración → Importar y exportar.
2. Arrastrar un archivo XLSX/CSV o elegir una exportación.
3. Seleccionar hojas, módulos y mapeo de columnas.
4. Ejecutar la validación sin alterar los datos locales.
5. Revisar el resumen y resolver conflictos.
6. Crear el respaldo y aplicar los cambios aprobados.
7. Descargar el informe de errores o el archivo exportado.

## 5. Integrations Required

No se requieren integraciones remotas. La aplicación usa las APIs del navegador para seleccionar, descargar y procesar archivos localmente.

- `File`, `FileReader` y arrastrar/soltar para entrada local.
- `Blob` y descarga mediante URL temporal para exportaciones.
- Paquete cliente `xlsx` para analizar y generar libros XLSX.
- Generador CSV local con soporte para UTF-8, comillas y separadores configurables.
- Los archivos exportados pueden cargarse manualmente en Google Sheets.

No se requieren OAuth, Lyzr, Stripe, correo, calendarios, CRM ni almacenamiento externo.

## 6. UI/UX Specification

La interfaz usará el tema `tw:stella`: superficies cálidas, acento naranja suave, tipografía Montserrat y esquinas redondeadas. Debe sentirse como una herramienta comercial contemporánea, no como un panel administrativo genérico.

En escritorio, una barra lateral compacta contiene Punto de venta, Movimientos, Producción, Clientes y Administración. En móvil se transforma en navegación inferior de cinco destinos. El encabezado muestra contexto, búsqueda cuando aplica, estado local/sincronización y selector claro/oscuro.

**Punto de venta:** composición de dos paneles. El catálogo ocupa el área principal con búsqueda, categorías y tarjetas densas; el carrito permanece visible a la derecha. En móvil, el carrito abre como panel inferior y su botón muestra cantidad y total.

**Ventas y compras:** una cabecera de métricas precede pestañas y una tabla filtrable. Cada fila abre un panel lateral con líneas, pagos y movimientos. La creación de compra usa un formulario progresivo, no una tabla editable interminable.

**Producción:** tablero por estados con órdenes activas y una ficha dominante de requerimientos, disponibilidad y variación real. Los faltantes se explican con texto y acción directa.

**Clientes y administración:** Clientes usa búsqueda y panel de perfil. Administración agrupa Catálogo, Inventario, Configuración, Respaldos e Importar/exportar. El asistente de archivos muestra carga, mapeo, validación, resolución y resultado como pasos; nunca esconde conflictos en un toast.

Los estados de éxito, advertencia y error combinan icono, etiqueta y color. Las acciones destructivas están separadas visualmente. Skeletons se reservan para lecturas remotas; las operaciones locales deben responder de inmediato.

## Artifacts & references

- Fuente disponible: manifiesto de `ClaraSoft-main.zip`, 142 entradas y 335,966 bytes sin comprimir.
- Módulos de referencia: `POS.tsx`, `Ventas.tsx`, `Compras.tsx`, `Produccion.tsx`, `Clientes.tsx`, `Admin.tsx` y `SheetsConfig.tsx`.
- Capas de datos de referencia: `AppDataContext.tsx`, `db.ts`, `localDbProvider.ts`, `sync.ts` y `types.ts`.
- Arquitectura objetivo: SPA modular React + TypeScript + Vite, `IndexedDB`, Web Workers y procesamiento local CSV/XLSX.
- Backend de referencia no inspeccionable: `server.py` y `sheets.py`; no será migrado a la aplicación objetivo.
- Criterio de aceptación pendiente: comparar entidades, validaciones, recetas, folios y reglas de sincronización contra el ZIP binario real cuando esté disponible.