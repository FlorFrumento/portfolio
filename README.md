# Portfolio

Static V1 of my personal portfolio.

## Structure

- `index.html`: main content and page sections.
- `styles.css`: initial visual system and responsive styles.
- `script.js`: client-side behavior, including the contact form request.
- `firebase.json`: Firebase Hosting configuration.
- `.firebaserc`: linked Firebase project.
- `functions/`: Firebase Cloud Function used by the contact form.

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

## Setup

Run this once after cloning the repository:

```bash
npm run setup
```

This installs:

- the frontend dependencies in the project root
- the backend dependencies inside `functions/`

If you prefer to do it manually, the equivalent commands are:

```bash
npm install
npm install --prefix functions
```

`functions/.env` is optional. The current backend does not need one.
If you ever add backend-specific configuration, use `functions/.env` only for local development and keep it out of git. See [functions/.env.example](/home/flora/Documents/Proyectos/portfolio/functions/.env.example).

## Run Locally

There are two local workflows:

- Frontend only: useful for layout, styles, and static interactions.
- Full flow: useful for testing the contact form end-to-end.

### Frontend Only

From the project root:

```bash
npm run dev
```

Vite will print a local URL similar to:

```text
http://localhost:5173
```

### Full Flow With Local Firebase

This project now has a small backend: the `contactForm` Cloud Function.

To test the form locally, first build the frontend from the project root:

```bash
npm run build
```

Then start the Firebase emulators from the project root:

```bash
firebase emulators:start --only hosting,functions,firestore
```

This starts:

- `Hosting`: serves the built site.
- `Functions`: runs `/api/contact` locally.
- `Firestore`: stores form submissions locally.

In this mode, you do not need a second frontend server. Firebase serves both the site and the local backend together.

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

With the new contact form backend, deploy now includes:

- The static frontend in `dist/`
- The `contactForm` Cloud Function
- The Firestore rules

Before the first deploy, make sure setup was already run:

```bash
npm run setup
```

For regular deploys, go back to the project root and run:

```bash
npm run deploy
```

`npm run deploy` already builds the frontend and then runs `firebase deploy`.

That means the deploy process changed slightly: it is no longer only Hosting. Firebase will now deploy Hosting plus the Cloud Function and the current Firestore configuration.

Install Firebase CLI if it is not available:

```bash
npm install -g firebase-tools
```

Log in if needed:

```bash
firebase login
```

The full initialization flow is documented in the guide linked above.

## Contact Form Architecture

The contact form no longer writes to Firestore from the browser.

- The browser sends a `POST` request to `/api/contact`.
- Firebase Hosting rewrites that route to the `contactForm` Cloud Function.
- The Cloud Function validates the payload and writes to Firestore using the Admin SDK.

This removes Firebase client configuration from the repository and keeps database writes on the server side.

## Backend Configuration

The current Cloud Function does not require any custom environment variables.

- Locally, Firebase emulators provide the project context.
- In production, Firebase provides the project context automatically.
- You do not need to copy the old Firebase web config into `functions/.env`.

If the backend needs custom configuration in the future:

- Use `functions/.env` for local development only.
- Configure production values separately in Firebase.
- For sensitive values, prefer Firebase secrets instead of committing anything to the repository.

## Next Steps

- Replace placeholders with real bio, email, and links.
- Add projects with links or case studies.
- Add real project images/screenshots.
- Refine colors, typography, and visual tone.
- Migrate to Vite/React if the portfolio grows in interactivity.
