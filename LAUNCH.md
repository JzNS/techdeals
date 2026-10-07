# Veröffentlichung von TechDeals

Statische Produktübersicht ohne externe Bilder, Analyse, Preisfeeds oder Browser-Speicher.

## Offene Voraussetzungen

- Hoster festlegen. Vertrag/Auftragsverarbeitung, Protokollierung, Löschfristen,
  Empfänger und mögliche Drittlandübermittlungen prüfen. Den markierten Entwurf
  in datenschutz.html durch die tatsächlichen Angaben ersetzen.
- Zusätzliche Hoster/CDN-Dienste, Cookies und Analytics prüfen; die Erklärung
  muss auch deren tatsächliche Verarbeitung erfassen.
- Betreiberangaben, Rechtsform, Register sowie vorhandene Umsatzsteuer- oder
  Wirtschafts-Identifikationsnummer nach § 5 DDG prüfen und ggf. ergänzen.
  Keine private Steuernummer veröffentlichen. Gewerbliche/steuerliche Pflichten
  und Streitbeilegungsangaben unabhängig vom Code klären.
- GMX-Kommunikation und tatsächliche Löschpraxis bestätigen.
- Rechte und sachliche Richtigkeit aller verbleibenden Inhalte prüfen.
- Registrierung/Eigentum und DNS-Zugriff für techdeals.de bestätigen.
- Bei Amazon-Teilnahme die echte Partner-ID in js/config.js eintragen, Website
  bei Amazon anmelden und Programmregeln beachten. Ohne ID bleiben Links
  ungetaggt. Der Werbehinweis passt sich automatisch an.

Bestätigte Punkte in launch-config.json auf true setzen. Die Datei dokumentiert
die Prüfung, ersetzt sie aber nicht. Der Entwurfsmarker blockiert den Build weiter.

## Build

`node tools/check-launch.cjs` prüft offene Punkte.
`node tools/build.cjs` erzeugt nach erfolgreicher Prüfung den Ordner dist.
Nur dist veröffentlichen; Quellordner enthalten alte Scraping-Daten und Werkzeuge.
Der Check verhindert keinen manuellen Upload des Quellordners.
HTTPS erzwingen, HTTP und www zur Hauptdomain umleiten. Sicherheitsheader
(frame-ancestors, HSTS) beim Hoster konfigurieren und die Live-Seite prüfen.

GitHub ist als Code-Repository möglich. GitHub Pages ist laut Nutzungsbedingungen
für Websites mit dem Hauptzweck, kommerzielle Transaktionen zu vermitteln, nicht
vorgesehen/erlaubt. Für diese Affiliate-Seite einen geeigneten Hoster wählen.
techdeals.de ist nur vorbereitet; Verfügbarkeit und Eigentum sind unbestätigt.
Es wurden keine Domainregistrierung oder DNS-Änderungen vorgenommen.

## Grundlagen

- https://www.gesetze-im-internet.de/ddg/__5.html
- https://www.gesetze-im-internet.de/ttdsg/__25.html
- https://eur-lex.europa.eu/eli/reg/2016/679/oj
- https://partnernet.amazon.de/help/operating/policies
- https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits

Stand: 7. Oktober 2026. Keine verbindliche Rechtsprüfung.
