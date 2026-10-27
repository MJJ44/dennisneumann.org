# Homepage dennisneumann.org – Anforderungen

Stand: 27.10.2026

## Aufbau
- **Navigation oben (zentriert):** nur der Reiter **HOME**, der immer zur Startseite führt (aktiv in Gold mit Unterstrich).
- Kein Reiter „Kontakt“ (gestrichen).
- **Mitte:** Logo (`assets/img/logo.png`, zugeschnitten aus `referenz/logo-original.png`), darunter Schriftzug „dennis neumann“ (Serifenschrift, weit gesperrt, weiß) und eine goldene Trennlinie mit Waben-Symbol.
- **Footer:** dauerhaft sichtbar, Brief-Icon + `mail@dennisneumann.org`.
  Klick öffnet das lokale E-Mail-Programm mit neuer Nachricht (`mailto:`-Link).

## Design
- Schwarzer Hintergrund, Gold-/Weiß-Akzente wie im Konzept (`referenz/konzept-mockup.png`).
- Logo-PNG wird unverändert genutzt (schwarzer Hintergrund verschmilzt mit der Seite).
- Goldene Waben links und rechts **per Code (SVG/CSS) animiert**, durch die in regelmäßigen Abständen ein Lichtimpuls läuft: eine ringförmige Welle, die vom Logo ausgeht und die Kanten beim Durchlaufen aufleuchten lässt (keine pulsierenden Lichtpunkte).
- Responsiv: auf dem Handy Waben reduziert/ausgeblendet, Logo skaliert.

## Technik
- Statische Seite: HTML, CSS, etwas JavaScript – kein Framework.
- E-Mail im Klartext (kein Spamschutz gewünscht).

## Hosting
- **GitHub Pages** mit eigener Domain **dennisneumann.org** (Datei `CNAME`, HTTPS über GitHub).
- DNS beim Domain-Anbieter auf GitHub Pages umstellen (A-Records / CNAME für `www`).

## Geklärt
- Kein Impressum/Datenschutz gewünscht.
- GitHub-Konto vorhanden.
- Domain liegt bei IONOS (Anleitung siehe `README.md`).
- Schriften liegen lokal im Projekt, es werden keine externen Server (z. B. Google Fonts) geladen.
