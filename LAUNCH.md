# Veröffentlichung von TechDeals

Produktübersicht mit Bildern und datierten Preisen. Keine Analyse oder Browser-Speicherung.

## Sprache

Die Seite bietet Deutsch und Englisch einschließlich Ratgebern, Kontakt und
rechtlichen Informationen. Ohne Auswahl gilt die bevorzugte Browsersprache:
Deutsch bei `de`, ansonsten Englisch. DE / EN im Kopfbereich schaltet um;
`?lang=de` und `?lang=en` überschreiben die Erkennung. Interne Links behalten die
Auswahl bei. Die Sprache wird nicht in Cookies oder Browser-Speicher geschrieben.
Preise bleiben in Euro, Händlerlinks führen in beiden Sprachen zu Amazon.de.
Originale Händler-Produktnamen bleiben unter Produktdetails erhalten.
Englische Rechtstexte sind Übersetzungen; noch offene Angaben bleiben auch dort
als Entwurf erkennbar. Änderungen an deutschen Texten auch in js/translations.js
pflegen.

## GitHub und Domain

Repository: https://github.com/JzNS/techdeals
Die vorbereitete Version liegt auf `codex/bilingual-site`. GitHub Pages ist im
Repository bereits aktiviert; dieser Branch ersetzt die bestehende öffentliche
Seite nicht automatisch. Die Quellen nur als Code auf GitHub verwalten. Für die
Veröffentlichung der Affiliate-Seite einen passenden Hoster wählen und ausschließlich
den freigegebenen Build aus dist hochladen.

`techdeals.com` ist laut Verisign-Domainregister bereits registriert
(Registrierung 20. August 1997; geprüft am 7. Oktober 2026). GitHub verkauft oder
registriert keine Domain. Eine eigene Domain zuerst erwerben bzw. vorhandenes
Eigentum bestätigen, dann beim ausgewählten Hoster verbinden. Die bereits
vorbereitete Adresse techdeals.de ist weiterhin unbestätigt. Keine automatische
Umstellung auf eine fremde Domain vornehmen.

Ein möglicher Ablauf ist ein geeigneter Hoster mit GitHub-Anbindung: Repository
verbinden, `node tools/build.cjs` als Build-Befehl und `dist` als Ausgabeordner
einrichten. Der Build wird erst erfolgreich, wenn die unten genannten offenen
Voraussetzungen tatsächlich geklärt sind. Danach Domain und www-Weiterleitung
nach den DNS-Vorgaben dieses Hosters konfigurieren.

Lokale Vorschau starten: `node tools/preview-server.cjs`, dann
http://127.0.0.1:4173/ öffnen. tools/refresh.bat erzeugt dieselbe Vorschau neu;
es startet nicht mehr das alte Scraping-Werkzeug.

## Bilder und Preise

`node tools/generate-products.cjs` stellt die lokale Vorschau aus dem vorhandenen
Katalog wieder her. Auf file://, localhost und 127.0.0.1 sind die archivierten
Amazon-Bilder und historischen Preise sichtbar. Die gelbe Vorschaukennzeichnung
weist auf Datenquelle und alte Preisstände hin. Auch lokale Bildabrufe übertragen
Verbindungsdaten an Amazon. Ausgelesene Daten sind keine freigegebenen API-Inhalte.

Der öffentliche Build erzeugt einen eigenen Katalog ohne diese Vorschauwerte.
Die öffentliche Website lädt externe freigegebene Amazon-Bilder erst nach Klick;
lokal gespeicherte Bilder werden direkt angezeigt. Einwilligung gilt im Speicher
der geöffneten Seite; sie erzeugt keine Cookies oder Local-Storage-Einträge.

Zwei Wege für die Veröffentlichung:

1. Eigene/lizenzierte Bilder nach assets/products legen. Einträge in
   data/approved-content.json anlegen mit asin, contentSource: "publisher",
   image: "assets/products/B08D6NCQ1Z.jpg", rightsConfirmed: true und
   rightsReference: "eigene Aufnahme / konkrete Nutzungserlaubnis".
   Für Preise zusätzlich price, priceSource (konkrete Prüfquelle),
   vatIncluded: true und updatedAt (tatsächlicher ISO-Abrufzeitpunkt mit Zeitzone).
   Bestätigungen müssen der tatsächlichen Rechte- und Datenlage entsprechen.
2. Bei Amazon PartnerNet anmelden und Creators-API-Zugang einrichten. Eine echte
   GetItems-Antwort mit Images und OffersV2 importieren:
   `node tools/import-creators.cjs <antwort.json> <tatsächliche-abrufzeit-ISO>`.
   Danach die echte Partner-ID in js/config.js setzen. Der Importer hält keine
   Zugangsdaten und führt keinen API-Abruf aus; automatische Aktualisierung
   muss auf dem Server/Build-System eingerichtet werden.

Preise für die öffentliche Website verfallen nach 24 Stunden automatisch;
API-Bilder ebenso. Ein erneuter Import/Build muss regelmäßig vor Ablauf erfolgen.
Alte API-Werte werden beim Build nicht übernommen. Originale Bilddateien von
Amazon werden weder heruntergeladen noch kopiert. Keine unbelegten Streichpreise,
Rabattprozente oder pauschalen Versand-/Rückgabezusagen. Quellen und Programmregeln
müssen zusätzlich zum technischen Ablauf stimmen.

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
