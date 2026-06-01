# Portfolio

Static V1 of my personal portfolio.

## Structure

- `index.html`: main content and page sections.
- `styles.css`: initial visual system and responsive styles.
- `script.js`: minimal behavior.
- `firebase.json`: Firebase Hosting configuration.
- `.firebaserc`: linked Firebase project.

## Requirements

This project uses `npm` and Vite for local development and production builds.

Tested with:

- Node.js `v24.15.0`
- npm `11.12.1`

Check your local version:

```bash
node --version
npm --version
```

If you use `nvm` and your terminal cannot find `npm`, load `nvm` with:

```bash
source "$HOME/.nvm/nvm.sh"
```

## Install Dependencies

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Vite will print a local URL similar to:

```text
http://localhost:5173
```

## Build

```bash
npm run build
```

The compiled site is generated in `dist/`.

## Preview The Build

```bash
npm run preview
```

## Tests

There are no automated tests yet. The current command is:

```bash
npm run test
```

## Firebase Deploy

Initial setup TLDR: [docs/firebase-hosting.md](docs/firebase-hosting.md).

For regular deploys, first generate the build:

```bash
npm run build
```

Install Firebase CLI if it is not available:

```bash
npm install -g firebase-tools
```

Log in and deploy:

```bash
firebase login
firebase init hosting
firebase deploy
```

The full initialization flow is documented in the guide linked above.

## Next Steps

- Replace placeholders with real bio, email, and links.
- Add projects with links or case studies.
- Add real project images/screenshots.
- Refine colors, typography, and visual tone.
- Migrate to Vite/React if the portfolio grows in interactivity.
