// Local identifiers; no remote images, prices or reviews.
const CATEGORIES = {
  "all": {
    "name": "All products",
    "icon": ""
  },
  "cables": {
    "name": "USB-C Cables",
    "icon": "&#128268;"
  },
  "earbuds": {
    "name": "Bluetooth Earbuds",
    "icon": "&#127911;"
  },
  "powerbanks": {
    "name": "Power Banks",
    "icon": "&#128267;"
  }
};
const PRODUCTS = [
  {
    "asin": "B08D6NCQ1Z",
    "category": "cables",
    "title": "UGREEN USB C Kabel 100W Ladekabel USB-C PD 3.0 Schnellladekabel"
  },
  {
    "asin": "B0BR3L78XN",
    "category": "cables",
    "title": "INIU 240W USB C Kabel, [2Stück 2m] PD Schnellladekabel USB C auf USBC Kabel"
  },
  {
    "asin": "B0FJL4CB6F",
    "category": "cables",
    "title": "RAVIAD 100W USB C auf USB C Kabel [2Stück 1M] 5A Schnellladekabel Ladekabel"
  },
  {
    "asin": "B09GXRWQYQ",
    "category": "cables",
    "title": "USB-C to USB-C 3.1 Gen2 Cable 10Gbps Data Transfer, 100W 20V/5A 3.3ft USB Type C PD Fast Charging Cable 4K Video Output Compatible with Thunderbolt 3, MacBook Pro, Galaxy S21 1M, Smartphone"
  },
  {
    "asin": "B0BW989F4Y",
    "category": "cables",
    "title": "CAKOBLE USB C Kabel auf USB C 2M, USB 3.2 Gen2 Typ C ladekabel, 20 Gbps Datenübertragung, 100W 20V/5A Schnellladekabel,4K @@ 60Hz Videoübertragung für Laptop, Mobiltelefon, Monitor, Geräte"
  },
  {
    "asin": "B0D95W3L7X",
    "category": "cables",
    "title": "SKW USB-C auf USB-C 3.1 Kabel 10 Gbit/s, 4K Video Übertragung, 100W (5A) Schnellladekabel mit E-Marker, 1m – Hochgeschwindigkeit & zuverlässige Datenübertragung"
  },
  {
    "asin": "B0BTYCRJSS",
    "category": "earbuds",
    "title": "soundcore by Anker P20i Kabellose Bluetooth Kopfhörer in-Ear, 10mm Treiber"
  },
  {
    "asin": "B0HJC9BBFR",
    "category": "earbuds",
    "title": "2026 Kopfhörer Kabellos Bluetooth 5.4 Kopfhörer, 6D-Stereo Ohrhörer in Ear"
  },
  {
    "asin": "B0HGWSGVB1",
    "category": "earbuds",
    "title": "Offene Ohr Kabellose Ohrhörer, Sport Bluetooth mit Echtzeitübersetzung"
  },
  {
    "asin": "B0BCKHQGJN",
    "category": "earbuds",
    "title": "Kopfhörer Kabellos Bluetooth, Bluetooth 5.4 Kopfhörer, Tiefer Bass Ohrhörer"
  },
  {
    "asin": "B0H8P8CNMF",
    "category": "earbuds",
    "title": "MORELOCO Bluetooth Kopfhörer, Kopfhörer Kabellos Bluetooth 5.4 In-Ear Earbuds mit 4 ENC Mikrofonen Geräuschunterdrückung, Tiefer Bass HiFi Sound, 40 Std. Gesamtspielzeit, IP7 Wasserdicht, Dual LED"
  },
  {
    "asin": "B0CJ538WPG",
    "category": "earbuds",
    "title": "Bluetooth 5.3 Kopfhörer, In Ear Kopfhörer Kabellos mit 4 Mic, 48H Tiefer Bass Spielzeit Wireless Earbud, LED-Anzeige, Bluetooth Ohrhörer mit ENC Noise Cancelling, IP7 Wasserdicht Kopfhörer Sport USB-C"
  },
  {
    "asin": "B0DCYR5VNR",
    "category": "powerbanks",
    "title": "INIU 45W Power Bank, Klein 20000mAh Handyakkus mit Integriertem USB-C Kabel"
  },
  {
    "asin": "B0HDQ3BZL4",
    "category": "powerbanks",
    "title": "Power Bank 20000 mAh 22.5 W PD3.0 QC4.0 Externer Handyakku PD20W Schnellladen Powerbank mit LCD-Display USB-C Ausgänge und Eingänge Tragbares Ladegerät mit Smartphones"
  },
  {
    "asin": "B0F6LTV18Z",
    "category": "powerbanks",
    "title": "Podoru Powerbank für Magsafe, 5000mAh Mini Wireless Power Bank für iPhone"
  },
  {
    "asin": "B0FLY676TH",
    "category": "powerbanks",
    "title": "AOGUERBE Powerbank für MagSafe, 10000mAh Magnetische Power Bank für iPhone"
  },
  {
    "asin": "B0CTH7L29Z",
    "category": "powerbanks",
    "title": "JUOVI Power Bank, Tragbare Powerbank 45W 20000mAh Schnellladefunktion"
  },
  {
    "asin": "B0D63H6KKV",
    "category": "powerbanks",
    "title": "NOBIS Power Bank, Powerbank 20000mAh, 45W Externe Handyakkus Schnellladen"
  }
];
