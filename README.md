# Portfolio

V1 estatica del portfolio personal.

## Estructura

- `index.html`: contenido y secciones principales.
- `styles.css`: sistema visual inicial y responsive.
- `script.js`: comportamiento minimo.
- `firebase.json`: configuracion base para Firebase Hosting.

## Requisitos

Este proyecto usa `npm` y Vite para desarrollo local y build.

Probado con:

- Node.js `v24.15.0`
- npm `11.12.1`

Para verificar tu version local:

```bash
node --version
npm --version
```

Si usas `nvm` y la terminal no encuentra `npm`, carga `nvm` con:

```bash
source "$HOME/.nvm/nvm.sh"
```

## Instalar dependencias

```bash
npm install
```

## Ver localmente

```bash
npm run dev
```

Vite va a mostrar una URL local similar a:

```text
http://localhost:5173
```

## Build

```bash
npm run build
```

El sitio compilado queda en `dist/`.

## Preview del build

```bash
npm run preview
```

## Tests

Todavia no hay tests automatizados. El comando disponible por ahora es:

```bash
npm run test
```

## Deploy en Firebase

Primero generar el build:

```bash
npm run build
```

Instalar Firebase CLI si no esta disponible:

```bash
npm install -g firebase-tools
```

Iniciar sesion y desplegar:

```bash
firebase login
firebase init hosting
firebase deploy
```

Durante `firebase init hosting`, usar:

- Public directory: `dist`
- Configure as single-page app: `No`
- Overwrite `index.html`: `No`

## Proximos pasos

- Reemplazar placeholders por bio, email y links reales.
- Agregar proyectos con links o casos de estudio.
- Sumar imagenes/screenshot reales de proyectos.
- Ajustar colores, tipografia y tono visual.
- Migrar a Vite/React si el portfolio crece en interactividad.
