# dennisneumann.org

Statische Homepage: Logo in der Mitte, Reiter „Home“, E-Mail-Adresse im Footer.

## Lokal ansehen
`index.html` per Doppelklick im Browser öffnen.

## Projektstruktur
```
index.html            Seite
css/style.css         Gestaltung
js/hexagons.js        animierte goldene Waben
assets/img/logo.png   Logo (zugeschnitten)
assets/fonts/         Schriften (lokal, DSGVO-freundlich)
CNAME                 eigene Domain für GitHub Pages
referenz/             Original-Logo und Konzeptbild (wird nicht hochgeladen)
```

## Veröffentlichen mit GitHub Pages

### 1. Repository anlegen und hochladen
1. Auf github.com ein neues **öffentliches** Repository anlegen, z. B. `dennisneumann.org`.
2. Im Terminal:
   ```bash
   cd ~/dennisneumann-homepage
   git init -b main
   git add .
   git commit -m "Homepage"
   git remote add origin https://github.com/<DEIN-GITHUB-NAME>/dennisneumann.org.git
   git push -u origin main
   ```

### 2. Pages einschalten
Repository → **Settings → Pages**
- *Source:* „Deploy from a branch“, Branch `main`, Ordner `/ (root)` → **Save**
- *Custom domain:* `dennisneumann.org` (ist durch die Datei `CNAME` meist schon eingetragen)

### 3. DNS bei IONOS einstellen
IONOS → **Domains & SSL** → `dennisneumann.org` → **DNS**

> **Wichtig:** Die **MX-Einträge** (für die E-Mail-Adresse) **nicht löschen oder ändern**, sonst funktioniert `mail@dennisneumann.org` nicht mehr.

Vorhandene **A**- und **AAAA**-Einträge für `@` (die auf IONOS zeigen) löschen. Danach diese Einträge anlegen:

| Typ   | Hostname | Wert                     |
|-------|----------|--------------------------|
| A     | @        | 185.199.108.153          |
| A     | @        | 185.199.109.153          |
| A     | @        | 185.199.110.153          |
| A     | @        | 185.199.111.153          |
| AAAA  | @        | 2606:50c0:8000::153      |
| AAAA  | @        | 2606:50c0:8001::153      |
| AAAA  | @        | 2606:50c0:8002::153      |
| AAAA  | @        | 2606:50c0:8003::153      |
| CNAME | www      | `<DEIN-GITHUB-NAME>.github.io` |

Falls IONOS beim Speichern fragt, ob eine Weiterleitung oder ein IONOS-Webspace aktiv bleiben soll: Die Domain darf **nicht** auf IONOS-Webspace bzw. eine IONOS-Weiterleitung zeigen.

### 4. HTTPS aktivieren
Die DNS-Änderung kann bis zu 24 Stunden dauern. Sobald GitHub unter **Settings → Pages** „DNS check successful“ meldet, **Enforce HTTPS** anhaken.

Optional: Unter GitHub → *Settings (Profil) → Pages* die Domain **verifizieren**, damit niemand anderes sie auf GitHub verwenden kann.

## Änderungen später veröffentlichen
```bash
git add .
git commit -m "Beschreibung der Änderung"
git push
```
Nach ca. 1 Minute ist die neue Version online.
