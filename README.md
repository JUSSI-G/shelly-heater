# Shelly water heater on spot price

[Suomeksi](README.fi.md)

A small script for Shelly Pro that heats your water heater during the cheapest hours of the day, using Finnish spot prices from [spot-hinta.fi](https://spot-hinta.fi).

I wanted something simpler than the bigger scripts out there, easy to read and easy to change. This is it.

## How it works

Every 5 minutes the Shelly asks the spot-hinta.fi API one question: *is this hour one of today's cheapest?*

- **Yes** -> heater on
- **No** -> heater off

The API does the ranking, so the script doesn't need to download or store any prices. Tomorrow's prices are published around 14:00 each day, so the whole day's ranking is known before midnight.

"Cheapest hours" means cheapest within the calendar day (00-24).

## What you need

- A Shelly Pro (or other Gen2+ Shelly with scripting) controlling a **contactor** for the water heater
- Up-to-date firmware
- Internet connection on the Shelly

**Note:** Don't run the water heater directly through the Shelly relay. Use a contactor and have an electrician wire it. Keep the heater's own thermostat in place, so the Shelly only decides *when* it's allowed to heat.

## Installation

1. Open the Shelly web interface (type the device IP into your browser).
2. Check **Settings -> Time** shows **Europe/Helsinki**.
3. Go to **Scripts -> Create script**, give it a name.
4. Paste in the contents of `shelly-heater.js` and click **Save**.
5. Change the settings at the top if needed (see below).
6. Click **Start** and check the console.
7. Turn on **Run on startup** so it survives power cuts.
8. Set **Output settings -> Power on default -> Off**.

In the console you should see something like:

```
Started: https://api.spot-hinta.fi/JustNowRanksAndPrice?...
OFF - not cheap
```

## Settings

All settings are at the top of the script:

| Setting | Default | What it does |
|---|---|---|
| `SWITCH_ID` | `0` | Which output to control. 0 = first output |
| `CHEAPEST_HOURS` | `2` | How many of the day's cheapest hours to heat |
| `MAX_PRICE` | `99` | Never heat above this price (c/kWh) |
| `ALWAYS_ON_PRICE` | `0` | Always heat at or below this price (c/kWh) |
| `BACKUP_HOURS` | `[0]` | Hours to heat if there's no internet. `[0]` = 00:00-01:00 |
| `CHECK_MINUTES` | `5` | How often to check |
| `REGION` | `"FI"` | Price area |

How many hours you need depends on your tank. As a rough guide, a 300 L tank with a 3 kW heater does fine with 3-4 hours. Start there and adjust if you run out of hot water.

## When the internet is down

- The heater only runs during `BACKUP_HOURS` (by default 00:00-01:00) and stays off otherwise.
- If the Shelly's clock isn't synced (e.g. power and internet went out together), it stays off rather than guessing.
- When the connection comes back, the next check goes back to normal spot price control. Nothing to do on your end.

## Safety features

- **Self-off timer:** every "on" command includes a 15-minute timer. The script renews it while running, so if the script ever crashes, the relay switches itself off.
- **Manual changes get corrected:** if someone toggles the relay from the app, the script puts it back within 5 minutes. Stop the script if you want manual control.

## Testing

To check the relay actually switches, set `CHEAPEST_HOURS = 24`, save and restart the script. The relay should click on and the console should say `ON - cheap hour`. Set it back afterwards.

You can also check the current hour's price and rank in your browser:

```
https://api.spot-hinta.fi/JustNow?region=FI&priceResolution=60
```

## Credits

Prices come from the free [spot-hinta.fi](https://spot-hinta.fi) API. If you want more features (weather-based heating, night tariffs, etc.), check out their official scripts: [Spot-hinta-fi/Shelly](https://github.com/Spot-hinta-fi/Shelly).

## License

See [LICENSE](LICENSE).