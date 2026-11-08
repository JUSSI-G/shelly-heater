// Water heater on spot price (api.spot-hinta.fi)
// Heats during the cheapest hours of the day.

// Settings:
let SWITCH_ID = 0;              // 0 = first output
let CHEAPEST_HOURS = 2;         // hours to heat per day
let MAX_PRICE = 99;            // never heat above this (c/kWh)
let ALWAYS_ON_PRICE = 0;        // always heat at or below this (c/kWh)
let BACKUP_HOURS = [1, 2, 3, 4]; // used if the API is down
let CHECK_MINUTES = 5;
let REGION = "FI";

// Script:
let API = "https://api.spot-hinta.fi/JustNowRanksAndPrice";
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
    region: REGION
  };
  let query = [];
  for (let key in params) query.push(key + "=" + params[key]);
  return API + "?" + query.join("&");
}

let URL = buildUrl();

function setRelay(on, why) {
  if (on === lastState) return;
  lastState = on;
  print((on ? "ON" : "OFF") + " - " + why);
  Shelly.call("Switch.Set", { id: SWITCH_ID, on: on });
}

function backup() {
  let hour = new Date().getHours();
  setRelay(BACKUP_HOURS.indexOf(hour) !== -1, "backup hours");
}

// 200 = heat now
// 400 = not now, anything
// else = something's wrong
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

print("Started: " + URL);
check();
Timer.set(CHECK_MINUTES * 60 * 1000, true, check);