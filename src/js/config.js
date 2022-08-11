export const AUTH_LINK = `https://www.strava.com/oauth/token`;
export const CLIENT_ID = `91065`;
export const CLIENT_SECRET = `89bac6f9cfe4a6e327c06f1861ef2e58ea4009c0`;
export const REFRESH_TOKEN = `6326213eb70878555ab3b3b216baa6a4744c4059`;
export const GRANT_TYPE = `refresh_token`;
export const API_ACTIVITIES = `https://www.strava.com/api/v3/activities/`;
export const API_RESULTS = `https://www.strava.com/api/v3/athlete/activities`;
export const TILE_LAYER = `https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png`;
export const MAP_ATTRIBUTION = `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors`;
export const MAP_CLASSNAME = `map-tiles`;

///////////// ---ReAuthorization--- /////////////
export const reAuthorize = async function () {
  try {
    const response = await fetch(AUTH_LINK, {
      method: "post",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
        grant_type: GRANT_TYPE,
      }),
    });
    const theKey = await response.json();
    return theKey;
  } catch (err) {
    console.log(err);
  }
};
reAuthorize();
