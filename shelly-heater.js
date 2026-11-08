// Water heater on spot price (api.spot-hinta.fi)
// Heats during the cheapest hours of the day.

// Settings:
let SWITCH_ID = 0;          // 0 = first output
let CHEAPEST_HOURS = 2;     // hours to heat per day
let MAX_PRICE = 99;         // never heat above this (c/kWh)
let ALWAYS_ON_PRICE = 0;    // always heat at or below this (c/kWh)
let BACKUP_HOURS = [0];     // no internet: heat 00:00-01:00
let CHECK_MINUTES = 5;
let REGION = "FI";

// Script:
let API = "https://api.spot-hinta.fi/JustNowRanksAndPrice";
let SAFETY_OFF = CHECK_MINUTES * 3 * 60; // relay turns itself off if the script stops
let lastState = null;

function ranks(n) {
  let list = [];
  for (let i = 1; i <= n; i++) list.push(i);
  return list.join(",");
}

function buildUrl() {
  let params = {
    ranksAllowed: ranks(CHEAPEST_HOURS),
    priceAlwaysAllowed: ALWAYS_ON_PRICE,
    maxPrice: MAX_PRICE,
    priceResolution: 60,
    region: REGION
  };
  let query = [];
  for (let key in params) query.push(key + "=" + params[key]);
  return API + "?" + query.join("&");
}

let URL = buildUrl();

// Sent every check, so manual changes get corrected too.
// Log only when the state changes.
function setRelay(on, why) {
  if (on !== lastState) print((on ? "ON" : "OFF") + " - " + why);
  lastState = on;
  let args = { id: SWITCH_ID, on: on };
  if (on) args.toggle_after = SAFETY_OFF;
  Shelly.call("Switch.Set", args);
}

// Clock is only reliable once it's synced from the internet
function clockOk() {
  let sys = Shelly.getComponentStatus("sys");
  return sys && sys.unixtime;
}

// No internet: heat only during BACKUP_HOURS
function backup() {
  if (!clockOk()) return setRelay(false, "no internet, clock not set");
  let hour = new Date().getHours();
  setRelay(BACKUP_HOURS.indexOf(hour) !== -1, "no internet, backup hours");
}

// 200 = heat now
// 400 = not now
// anything else = something's wrong
function onResponse(res, err, msg) {
  if (err !== 0 || !res) {
    print("API error: " + msg);
    return backup();
  }
  if (res.code === 200) return setRelay(true, "cheap hour");
  if (res.code === 400) return setRelay(false, "not cheap");
  print("Odd response: " + res.code);
  backup();
}

function check() {
  Shelly.call("HTTP.GET", { url: URL, timeout: 15, ssl_ca: "*" }, onResponse);
}

if (CHEAPEST_HOURS < 1 || CHEAPEST_HOURS > 24) {
  print("CHEAPEST_HOURS should be 1-24, now " + CHEAPEST_HOURS);
}

print("Started: " + URL);
check();
Timer.set(CHECK_MINUTES * 60 * 1000, true, check);