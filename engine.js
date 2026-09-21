/* ShadeSide engine - solar position + sun-side logic, pure functions.
   Works in the browser and node (Intl is used for timezone offsets). */
(function (global) {
  'use strict';

  var RAD = Math.PI / 180;

  /* UTC offset (minutes) of an IANA timezone on a given date. */
  function tzOffsetMinutes(tz, date) {
    var fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
    var parts = fmt.formatToParts(date);
    var o = {};
    for (var i = 0; i < parts.length; i++) o[parts[i].type] = parts[i].value;
    var asUTC = Date.UTC(+o.year, +o.month - 1, +o.day, +o.hour % 24, +o.minute, +o.second);
    return Math.round((asUTC - date.getTime()) / 60000);
  }

  /*
   * Solar position (suncalc math) for a UTC instant at lat/lon (degrees).
   * Returns { azimuth, elevation } in degrees; azimuth clockwise from north.
   */
  function solarPos(utcDate, lat, lon) {
    var d = utcDate.getTime() / 86400000 + 2440587.5 - 2451545;
    var M = RAD * (357.5291 + 0.98560028 * d);
    var C = RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
    var P = RAD * 102.9372;
    var L = M + C + P + Math.PI;
    var dec = Math.asin(Math.sin(L) * Math.sin(RAD * 23.4397));
    var ra = Math.atan2(Math.sin(L) * Math.cos(RAD * 23.4397), Math.cos(L));
    var H = RAD * (280.16 + 360.9856235 * d) + RAD * lon - ra;
    var az = Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(RAD * lat) - Math.tan(dec) * Math.cos(RAD * lat));
    var el = Math.asin(Math.sin(RAD * lat) * Math.sin(dec) + Math.cos(RAD * lat) * Math.cos(dec) * Math.cos(H));
    var azDeg = (az / RAD + 180) % 360;
    return { azimuth: azDeg, elevation: el / RAD };
  }

  /*
   * Which side of a vehicle the sun is on.
   * bearing: travel direction, degrees clockwise from north.
   * sunAz: sun azimuth, same convention.
   * Returns { side: 'left'|'right'|'ahead'|'behind', rel: relative bearing 0..360 }
   * ahead/behind bands are +-15 deg so borderline cases stay honest.
   */
  function sideOf(bearing, sunAz) {
    var rel = (sunAz - bearing + 360) % 360;
    if (rel <= 15 || rel >= 345) return { side: 'ahead', rel: rel };
    if (rel > 15 && rel < 165) return { side: 'right', rel: rel };
    if (rel >= 165 && rel <= 195) return { side: 'behind', rel: rel };
    return { side: 'left', rel: rel };
  }

  /* Glare severity from sun elevation: worst when the sun is low and in your eyes. */
  function glare(el) {
    if (el <= -6) return 'night';
    if (el <= 0) return 'sun on the horizon';
    if (el <= 20) return 'brutal - sun at eye level';
    if (el <= 45) return 'annoying';
    return 'mild - sun high overhead';
  }

  var api = { tzOffsetMinutes: tzOffsetMinutes, solarPos: solarPos, sideOf: sideOf, glare: glare };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.ShadeSide = api;
})(typeof window !== 'undefined' ? window : globalThis);
