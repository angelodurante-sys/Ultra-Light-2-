# CCUP Unternehmensanalyse — Neu starten (einfache Version)

Diese Version braucht KEINEN Unterordner mehr — alle Dateien liegen flach
nebeneinander. Das lässt sich auf dem iPhone in einem Rutsch hochladen.

## Schritt 1 — Altes Repository löschen (empfohlen, sauberer Neustart)
1. Zum alten Repository gehen (das mit App.jsx, main.jsx, etc.)
2. Oben "Settings" (ggf. über "..." Menü falls nicht sichtbar)
3. Ganz nach unten scrollen zu "Danger Zone" → "Delete this repository"
4. Repository-Namen zur Bestätigung eintippen, löschen

Falls dir das zu heikel ist: einfach überspringen und stattdessen unten ein
NEUES Repository mit anderem Namen erstellen (z. B. `ccup-unternehmensanalyse-v2`).

## Schritt 2 — Neues Repository erstellen
1. github.com → "+" oben rechts → "New repository"
2. Name eingeben, z. B. `ccup-unternehmensanalyse-v2`
3. NICHT mit README initialisieren
4. "Create repository"

## Schritt 3 — Alle 6 Dateien in einem Rutsch hochladen
Auf der leeren Repository-Seite auf "uploading an existing file" tippen.

Dann ALLE 6 Dateien aus diesem Ordner auswählen und hochladen:
- .gitignore
- App.jsx
- index.html
- main.jsx
- package.json
- vite.config.js

(Auf dem iPhone: "choose your files" antippen → in der Dateien-App zum
entpackten Ordner navigieren → oben rechts "Auswählen" → alle 6 Dateien
antippen → "Öffnen")

Unten "Commit changes" klicken. Fertig — keine Unterordner, kein
Umbenennen nötig!

## Schritt 4 — Mit Vercel verbinden
1. vercel.com → "Sign up" → "Continue with GitHub"
2. "Add New..." → "Project"
3. Das neue Repository auswählen → "Import"
4. Vercel erkennt automatisch Vite — direkt auf "Deploy" klicken
5. Nach ca. 1 Minute: echte URL wie
   `https://ccup-unternehmensanalyse-v2.vercel.app`

## Danach
- URL per Mail an Kollegen schicken oder auf LinkedIn verlinken
- Formspree-Adresse ist bereits im Code eingetragen — funktioniert sofort
