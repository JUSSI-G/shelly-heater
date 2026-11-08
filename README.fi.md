# Lämminvesivaraajan ohjaus pörssisähkön mukaan Shellyllä

[In English](README.md)

Pieni skripti Shelly Prolle, joka lämmittää varaajaa vuorokauden halvimpina tunteina. Hinnat tulevat [spot-hinta.fi](https://spot-hinta.fi):n rajapinnasta.

Yksinkertainen ja muokattava.

## Miten se toimii

Shelly kysyy viiden minuutin välein spot-hinta.fi:n rajapinnalta yhden asian: *onko tämä tunti yksi päivän halvimmista?*

- **Kyllä** -> varaaja päälle
- **Ei** -> varaaja pois

Rajapinta hoitaa järjestyksen, joten skriptin ei tarvitse ladata tai tallentaa hintoja. Seuraavan päivän hinnat julkaistaan joka päivä noin klo 14, joten koko päivän järjestys on tiedossa jo ennen puoltayötä.

"Halvimmat tunnit" tarkoittaa halvimpia tunteja kalenteripäivän (00-24) sisällä.

## Mitä tarvitset

- Shelly Pro, joka ohjaa varaajan **kontaktoria**
- Ajan tasalla olevat laiteohjelmistot
- Shellylle nettiyhteys

**Huom:** Älä kytke varaajaa suoraan Shellyn releen kautta. Käytä kontaktoria ja anna sähköasentajan tehdä kytkennät. Jätä varaajan oma termostaatti paikalleen, jolloin Shelly päättää vain sen, *milloin* varaaja saa lämmittää.

## Asennus

1. Avaa Shellyn hallintasivu (kirjoita laitteen IP-osoite selaimeen).
2. Tarkista, että Settings -> Time näyttää aikavyöhykkeenä **Europe/Helsinki**.
3. Mene Scripts -> Create script ja anna skriptille nimi.
4. Liitä tiedoston `shelly-heater.js` sisältö ja paina **Save**.
5. Muuta asetuksia skriptin alussa tarvittaessa (katso alta).
6. Paina **Start** ja katso konsolia.
7. Laita päälle **Run on startup**, jotta skripti käynnistyy myös sähkökatkon jälkeen.
8. Aseta Output settings -> Power on default -> **Off**.

Konsolissa pitäisi näkyä jotain tällaista:

```
Started: https://api.spot-hinta.fi/JustNowRanksAndPrice?...
OFF - not cheap
```

## Asetukset

Kaikki asetukset ovat skriptin alussa:

| Asetus | Oletus | Mitä tekee |
|---|---|---|
| `SWITCH_ID` | `0` | Mitä lähtöä ohjataan. 0 = ensimmäinen lähtö |
| `CHEAPEST_HOURS` | `2` | Montako päivän halvinta tuntia lämmitetään |
| `MAX_PRICE` | `99` | Ei koskaan lämmitetä tätä kalliimmalla (c/kWh) |
| `ALWAYS_ON_PRICE` | `0` | Lämmitetään aina, kun hinta on tämä tai alle (c/kWh) |
| `BACKUP_HOURS` | `[0]` | Tunnit, joina lämmitetään ilman nettiä. `[0]` = klo 00-01 |
| `CHECK_MINUTES` | `5` | Kuinka usein tarkistetaan |
| `REGION` | `"FI"` | Hinta-alue |

Tarvittavien tuntien määrä riippuu varaajasta. Aloita parilla tunnilla ja lisää, jos lämmin vesi loppuu kesken.

## Kun netti on poikki

- Varaaja lämmittää vain `BACKUP_HOURS`-tunteina (oletuksena klo 00-01) ja on muuten pois päältä.
- Jos Shellyn kello ei ole synkronoitunut (esim. sähköt ja netti katkesivat yhtä aikaa), varaaja pysyy pois päältä arvailun sijaan.
- Kun yhteys palaa, seuraava tarkistus palaa normaaliin pörssiohjaukseen. Sinun ei tarvitse tehdä mitään.

## Turvaominaisuudet

- **Automaattinen sammutus:** jokaisen "päälle"-komennon mukana on 15 minuutin ajastin. Skripti uusii sen koko ajan, joten jos skripti joskus kaatuu, rele sammuu itsestään.
- **Käsin tehdyt muutokset korjataan:** jos joku kääntää releen sovelluksesta, skripti palauttaa sen viiden minuutin sisällä. Pysäytä skripti, jos haluat ohjata käsin.

## Testaus

Varmistaaksesi, että rele oikeasti kytkee, aseta `CHEAPEST_HOURS = 24`, tallenna ja käynnistä skripti uudelleen. Releen pitäisi naksahtaa päälle ja konsolissa lukea `ON - cheap hour`. Palauta asetus sen jälkeen.

Voit myös katsoa kuluvan tunnin hinnan ja sijoituksen selaimella:

```
https://api.spot-hinta.fi/JustNow?region=FI&priceResolution=60
```

## Kiitokset

Hinnat tulevat ilmaisesta [spot-hinta.fi](https://spot-hinta.fi):n rajapinnasta. Jos kaipaat lisää ominaisuuksia (sääennusteen mukainen lämmitys, yösiirto jne.), katso heidän viralliset skriptinsä: [Spot-hinta-fi/Shelly](https://github.com/Spot-hinta-fi/Shelly).

## Lisenssi

Katso [LICENSE](LICENSE).
