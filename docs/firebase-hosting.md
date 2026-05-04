# Firebase Hosting TLDR

Short step-by-step guide to initialize and deploy this V1 with Firebase Hosting.

## 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

Installs the `firebase` command globally.

## 2. Log In

```bash
firebase login
```

Opens the browser to connect the CLI with your Google account.

## 3. Initialize Hosting

```bash
firebase init hosting
```

Options used in this project:

- Firebase feature: `Hosting`
- Project setup: `Use an existing project`
- Public directory: `dist`
- Single-page app rewrite: `No`
- Automatic builds and deploys with GitHub: `No`
- Overwrite `dist/index.html`: `No`
- Firebase Agent Skills: `No`

This creates/updates:

- `.firebaserc`: links this repo to the Firebase project.
- `firebase.json`: configures Hosting to publish `dist/`.

## 4. Generate The Build

```bash
npm run build
```

Compiles the site with Vite and generates the `dist/` folder.

## 5. Deploy

```bash
firebase deploy
```

Uploads the contents of `dist/` to Firebase Hosting and returns the public URL.

## Future Deploys

For future changes, usually this is enough:

```bash
npm run build
firebase deploy
```
