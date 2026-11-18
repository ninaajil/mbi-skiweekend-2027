# MBI Ski Weekend Anmeldung

## Start
1. Node.js 20+ installieren.
2. Im Ordner `npm install` ausführen.
3. Mit `npm start` starten.
4. `http://localhost:3000` öffnen.

## Auf eurer Website
Die App auf einem Node.js-Host mit dauerhaftem Datenträger deployen (z.B. VPS). Dann einen Link auf die App setzen oder mit `<iframe src="https://EURE-DOMAIN" width="100%" height="1100" title="Ski Weekend Anmeldung"></iframe>` einbetten. Bei iframe-Einbettung CSP/Frame-Einstellungen und Höhe prüfen.

## Wichtig vor dem Livegang
- Datenbankdatei `registrations.sqlite` muss auf persistentem Speicher liegen; `DB_PATH` kann einen anderen Pfad definieren.
- HTTPS aktivieren, Backups und Admin-Zugriff absichern.
- Datenschutzinformation und Löschfrist ergänzen; alle Teilnehmenden sehen Vornamen und Nachnameninitialen. Keine vollständigen Namen öffentlich anzeigen.
- Kein E-Mail-Versand integriert. E-Mail-Adresse ist einmalig; Änderungen/Stornos erfolgen derzeit manuell durch Admin in der Datenbank.
- Nur eine Serverinstanz mit gemeinsamem SQLite-Datenträger betreiben. Für verteilte Deployments PostgreSQL nutzen.
- Ein Nein wird nicht gespeichert; das Formular ist primär eine verbindliche Anmeldung.
- Bei Bedarf Spam-Schutz/CAPTCHA und Bestätigungsmails ergänzen.
- Zimmernamen und Preise sind aus der Hotelbuchung abgeleitet. Bei zwei Fünferzimmern wird Stätzerhorn als eines davon bezeichnet.

## Deployment auf Render (Web Service + persistente Disk)
1. Ordnerinhalt in ein privates GitHub-Repository laden.
2. Render Web Service mit Node.js erstellen, Root Directory `skiweekend-app` falls das Repository den übergeordneten Ordner enthält.
3. Build Command `npm install`, Start Command `npm start`.
4. Persistente Disk mit Mount Path `/var/data` konfigurieren (ein passender kostenpflichtiger Tarif kann nötig sein).
5. Umgebungsvariable `DB_PATH=/var/data/registrations.sqlite` setzen.
6. Umgebungsvariable `EMBED_ORIGIN=https://eure-club-domain.ch` setzen (nur Origin, kein Pfad oder Slash am Ende). Dies erlaubt iframe-Einbettung auf dieser Domain. Falls noch keine Domain bekannt ist, ist die App zunächst nur als eigene Seite nutzbar.
7. Auf `https://eure-app.onrender.com/api/rooms` testen und eine Testanmeldung ausführen. Anschliessend die Testdaten vor dem Livegang löschen.
8. Backups, Datenschutz, Admin-Zugriff und Recovery-Prozess einrichten.

Hinweis: `EMBED_ORIGIN` erlaubt genau eine Website-Origin. Für weitere Domains muss die Header-Konfiguration erweitert werden. `frame-ancestors` schützt nur die Einbettung; es ist kein Login.
