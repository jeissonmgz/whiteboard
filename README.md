# Whiteboard Infinite Canvas

Whiteboard es una aplicación web interactiva de lienzo infinito diseñada para dibujo vectorial, diagramación y maquetación gráfica en tiempo real.

Demo en vivo: [https://jeissonmgz.github.io/whiteboard/](https://jeissonmgz.github.io/whiteboard/)

## Arquitectura del Proyecto

La arquitectura de la aplicación está construida sobre React 19, TypeScript y Zustand, aplicando patrones de diseño orientados a la extensión, separación de responsabilidades y persistencia desacoplada.

### 1. Sistema de Figuras (Engine y Patrón Strategy / Factory)

El manejo de las figuras vectoriales del lienzo está estructurado bajo un motor extensible basado en los patrones Factory y Strategy:

- ShapeEngineFactory: Actúa como el registro central y punto de acceso unificado para resolver las operaciones de cualquier figura vectorial en función de su tipo.
- ShapeStrategy: Interfaz que define el contrato común para todas las figuras. Cada tipo de figura (rectángulo, elipse, línea, flecha, polilínea y texto) implementa su propia estrategia independiente.
- Responsabilidades de cada Estrategia:
  - Definición de propiedades permitidas (borde, relleno, alineación, tamaño de fuente).
  - Cálculo de la caja envolvente (BoundingBox) y punto central.
  - Generación de puntos de control interactivos para cambio de tamaño, edición de vértices y rotación.
  - Creación inicial y actualización dinámica de puntos durante el arrastre o transformación.

Esta separación permite agregar nuevas figuras al lienzo de forma modular sin modificar la lógica central de la aplicación.

### 2. Arquitectura de Almacenamiento (Storage y Zustand)

El estado global de la aplicación se gestiona mediante Zustand y se divide de forma estricta en dos almacenes persistentes independientes en almacenamiento local (localStorage):

- Almacén de Lienzo (whiteboard_canvas_storage):
  - Responsabilidad: Almacena exclusivamente el arreglo de figuras vectoriales y el estado de la vista (coordenadas de desplazamiento X, Y y nivel de zoom).
  - Desacoplamiento: Aislado completamente de las preferencias de usuario para prevenir la pérdida de configuraciones durante la manipulación del lienzo o carga de archivos.

- Almacén de Configuración (whiteboard_settings_storage):
  - Responsabilidad: Guarda las preferencias de usuario, incluyendo el modo de color (claro, oscuro o sistema) y el idioma activo de la interfaz.

- Sincronización en Tiempo Real entre Pestañas (Cross-Tab Sync):
  - Ambos almacenes implementan listeners del evento global de almacenamiento del navegador.
  - Cuando se realiza cualquier modificación en una pestaña (edición de figuras, cambio de tema o idioma), las demás pestañas abiertas detectan la actualización en el almacenamiento local y rehidratan su estado de forma síncrona sin necesidad de recargar la página.

### 3. Servicios Auxiliares

- Internacionalización (i18n): Proveedor de contexto que conecta el almacén de configuración con diccionarios de traducción para español, inglés, francés, portugués y alemán, incluyendo la detección automática del idioma del navegador.
- Motor de Exportación e Impresión: Servicio encargado de calcular límites de captura, clonar y limpiar el árbol SVG, inyectar variables de estilo CSS del tema activo y generar archivos en formatos PNG, JPG, SVG y JSON, además de gestionar la canalización de impresión nativa.

## Características Principales

- Lienzo Infinito: Navegación libre con desplazamiento, arrastre y zoom centrado.
- Herramientas de Dibujo: Creación de líneas, flechas, polilíneas, rectángulos, elipses y bloques de texto.
- Selección y Edición Grupal: Control unificado para mover, escalar, rotar, duplicar y transformar múltiples elementos simultáneamente.
- Ordenamiento de Capas: Controles para superponer, enviar al fondo, avanzar o retroceder elementos.
- Personalización de Estilos: Selección de colores de borde y relleno, grosores, opacidad y alineación de texto.
- Modos de Color: Compatibilidad con tema Claro, Oscuro y Detección Automática del Sistema.
- Internacionalización (i18n): Soporte multilingüe en español, inglés, francés, portugués y alemán, con detección automática del navegador.
- Persistencia y Sincronización: Almacenamiento local del lienzo y configuración, con sincronización automática en tiempo real entre pestañas abiertas.
- Exportación e Impresión: Exportación a formatos PNG, JPG y SVG (todo el lienzo o selección), guardado/carga de proyectos en JSON e impresión nativa.

## Requisitos Previos

- Node.js (versión 18 o superior)
- npm

## Instalación y Ejecución

1. Clonar el repositorio e instalar las dependencias:

```bash
npm install
```

2. Iniciar el servidor de desarrollo:

```bash
npm run dev
```

3. Compilar para producción:

```bash
npm run build
```

4. Previsualizar la compilación de producción:

```bash
npm run preview
```
