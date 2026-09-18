# Agenda — je eigen app, offline bruikbaar, gelijk op al je toestellen

Een agenda die op je toestel draait, ook zonder internet, en die zichzelf bijwerkt
zodra je weer verbinding hebt. Geen abonnement, geen bedrijf dat ermee stopt.

Je hebt twee dingen nodig: een plek om de bestanden neer te zetten (GitHub Pages,
gratis) en een database (Supabase, gratis laag is ruim voldoende voor een agenda).

Als je alleen wilt kijken hoe het voelt: sla stap 2 over. De app werkt dan
meteen, maar houdt je telefoon en laptop niet gelijk.

---

## Stap 1 — Zet de bestanden online

Een service worker werkt alleen via HTTPS. Vandaar deze stap; lokaal een bestand
openen met `file://` werkt niet.

1. Maak een account op github.com als je die nog niet hebt.
2. Maak een nieuwe repository, bijvoorbeeld `agenda`. Zet hem op **Public**.
3. Upload alle bestanden uit deze map naar de repository
   (`index.html`, `sw.js`, `config.js`, `manifest.webmanifest`, de drie iconen).
   Ze moeten in de hoofdmap staan, niet in een submap.
4. Ga naar **Settings → Pages**. Kies bij Source: `Deploy from a branch`,
   branch `main`, map `/ (root)`. Opslaan.
5. Na een minuut of twee staat je agenda op
   `https://<jouwnaam>.github.io/agenda/`.

Even controleren: open die link. Je hoort de agenda te zien, met onderin
"Niet gekoppeld". Werkt dat, dan is stap 1 klaar.

## Stap 2 — Database voor de synchronisatie

1. Maak een account op supabase.com en daarna een nieuw project.
   Kies een regio in Europa (Frankfurt of Ierland) — schelt reactietijd.
2. Open in het linkermenu de **SQL Editor**, plak de volledige inhoud van
   `setup.sql` en druk op Run. Je hoort "Success" te zien.
3. Ga naar **Project Settings → API** en kopieer twee waarden:
   - `Project URL` (iets als `https://abcdefgh.supabase.co`)
   - de `anon` `public` key (een lange tekst)
4. Zet ze in `config.js`:

   ```js
   window.PLANNER_CONFIG = {
     supabaseUrl: "https://abcdefgh.supabase.co",
     supabaseAnonKey: "eyJhbGciOi..."
   };
   ```

5. Upload de gewijzigde `config.js` opnieuw naar GitHub.

> De anon key hoort publiek te zijn — hij zit in elke Supabase-app die in een
> browser draait. Hij geeft op zichzelf geen toegang tot gegevens: de regels uit
> `setup.sql` zorgen ervoor dat elke ingelogde gebruiker uitsluitend zijn eigen
> rijen ziet. De `service_role` key is een heel ander verhaal: die geeft wél
> volledige toegang. Zet die nooit in `config.js` of in een repository.

### E-mailbevestiging

Supabase vraagt standaard om bevestiging van je e-mailadres bij het aanmaken van
een account. Dat werkt prima, maar voor een agenda die alleen jij gebruikt is het
gedoe. Je kunt het uitzetten onder **Authentication → Sign In / Providers →
Email → Confirm email**. Doe dat alleen als jij de enige gebruiker bent.

## Stap 3 — Installeren op je toestellen

Open de link op het toestel, log in, en zet hem daarna op je beginscherm:

- **iPhone / iPad (Safari):** deelknop → *Zet op beginscherm*.
  Let op: dit moet in Safari, niet in Chrome.
- **Android (Chrome):** menu ⋮ → *App installeren* of *Toevoegen aan startscherm*.
- **Windows / macOS (Chrome of Edge):** het installatie-icoontje rechts in de
  adresbalk.

Je krijgt een eigen icoon en een venster zonder adresbalk. Vanaf dat moment
start de agenda ook zonder internet.

---

## Hoe het onder water werkt

**Alles gaat eerst naar je eigen toestel.** Een taak die je toevoegt staat
onmiddellijk in IndexedDB, de opslag van je browser. Pas daarna, op de
achtergrond, gaat hij naar de server. Daarom voelt de app even snel aan met of
zonder verbinding, en daarom werkt hij in het vliegtuig.

**De balk bovenin vertelt wat er speelt.** "Bijgewerkt om 12:04" betekent dat
alles rond is. "Offline — 3 wijzigingen worden verstuurd zodra je verbinding
hebt" betekent dat je gerust door kunt werken.

**Bij een botsing wint de laatste wijziging.** Verander je dezelfde taak op je
telefoon en op je laptop terwijl beide offline zijn, dan overleeft degene die
het laatst is aangepast. Voor een persoonlijke agenda is dat vrijwel altijd wat
je wilt. Het betekent wel dat de andere wijziging weg is — er is geen
samenvoeging en geen waarschuwing.

**Verwijderen laat een spoor achter.** Een verwijderde taak wordt gemarkeerd in
plaats van weggegooid, anders zou je andere toestel hem bij de eerstvolgende
synchronisatie vrolijk terugzetten. Die markeringen zie je nergens; onderaan
`setup.sql` staat een opdracht om ze na een paar maanden echt op te ruimen.

**Bij elke synchronisatie worden alle rijen opgehaald.** Dat klinkt verkwistend,
maar een jaar agenda is een paar honderd kilobyte. Het alternatief — alleen
ophalen wat gewijzigd is — gaat stuk zodra de klok van je telefoon een paar
seconden afwijkt van die van je laptop, en dan verdwijnen er stilletjes taken.
Dit is die onbetrouwbaarheid niet waard.

## Waar je tegenaan gaat lopen

**Geen meldingen.** De app port je nergens voor. Push-meldingen kunnen technisch
wel, maar vereisen een aparte server en op iPhone de nodige omwegen. De
exportknop onderin geeft je een `.ics`-bestand dat je in Google Agenda of Apple
Agenda kunt importeren — dan doet je gewone agenda-app de herinneringen.

**Een bijgewerkte versie komt met vertraging binnen.** Zet je een nieuwe
`index.html` online, dan toont je toestel de eerstvolgende keer nog de oude
versie en pas daarna de nieuwe. Verhoog `CACHE = "agenda-v1"` bovenin `sw.js`
naar `v2`, `v3` enzovoort bij elke wijziging; dan gaat het één keer opnieuw
laden in plaats van twee keer.

**iOS ruimt opslag op.** Safari gooit lokale gegevens van websites weg die je
zeven dagen niet gebruikt. Geïnstalleerde apps op je beginscherm zijn
uitgezonderd — nog een reden om stap 3 echt te doen. En met de synchronisatie
aan staat je agenda toch ook op de server.

**Een privévenster werkt niet.** Daar is IndexedDB geblokkeerd; de app zegt dat
dan ook.

**Alles staat en valt bij je wachtwoord.** Er is geen herstelprocedure ingebouwd.
Raak je het kwijt, dan kun je in Supabase een nieuw wachtwoord instellen onder
Authentication → Users.

## Sleutelen

Alles zit in `index.html` — opmaak, logica en weergave in één bestand, met
genummerde blokken. Je hebt geen bouwstap nodig: aanpassen, uploaden, klaar.

Voor de hand liggende volgende stappen: herhalende taken (een `repeat`-veld en
bij het afvinken de volgende aanmaken), een maandweergave, notities per taak,
of `title` doorzoekbaar maken.
