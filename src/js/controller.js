import {
  API_ACTIVITIES,
  API_RESULTS,
  TILE_LAYER,
  MAP_ATTRIBUTION,
  MAP_CLASSNAME,
} from "./config";
import "core-js/stable";
import "regenerator-runtime/runtime";
import icon from "url:../icon.svg";
import * as config from "./config.js";

const activity = document.querySelector(".activities");
const activityData = document.querySelector(".data");
const date = document.querySelector(".info__date");
const info = document.querySelector(".info");
const modal = document.querySelector(".modal");
const theMap = document.getElementById("map");
const activityData2 = document.querySelector(".data2");
const tabsContainer = document.querySelector(".arrows");
const tabsContent = document.querySelectorAll(".information");

class App {
  constructor() {
    this._loadDateTime();
    this._loadActivityResults();
  }

  _loadDateTime() {
    setInterval(() => {
      const now = new Date();
      const options = {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        day: "numeric",
        month: "long",
        year: "numeric",
      };
      date.textContent = new Intl.DateTimeFormat("en-GB", options).format(now);
    }, 1000);
  }

  _loadActivityResults() {
    ///////////// ---Load Spinner--- /////////////
    const renderSpinner = function (el) {
      const spinner = `
            <div class="spinner">
              <img src="${icon}" alt="SVG" />
            </div>
            `;
      el.innerHTML = "";
      el.insertAdjacentHTML("afterbegin", spinner);
    };

    ///////////// ---Load Activities--- /////////////
    const getActivity = async function () {
      try {
        const accessKey = await config.reAuthorize();
        const id = window.location.hash.slice(1);

        if (!id) return;
        renderSpinner(activityData);

        const response = await fetch(
          `${API_ACTIVITIES}${id}?access_token=${accessKey.access_token}`
        );
        const data = await response.json();

        if (!response.ok)
          throw new Error(`${data.message} (${response.status})`);

        let { ...activ } = data;
        activ = {
          movingTime: activ.moving_time,
          averageSpeed: activ.average_speed,
          averageCadence: activ.average_cadence,
          calories: activ.calories,
          heartRate: activ.average_heartrate,
          maxHeartRate: activ.max_heartrate,
          maxSpeed: activ.max_speed,
        };

        const html = `
          <div class="data__header">
              <h2>Results</h2>
              <h2>Time: ${
                activ.movingTime.toString().slice(0, 2) +
                ":" +
                activ.movingTime.toString().slice(2, 4)
              }</h2>
            </div>
            <hr />
            <hr / class="line1">
            <div class="info__data">
              <div>
                <h3 class="info__characteristics">Average Speed</h3>
                <h3 class="info__number">${activ.averageSpeed.toFixed(2)}</h3>
              </div>
              <div>
                <h3 class="info__characteristics">Average Cadence</h3>
                <h3 class="info__number">${activ.averageCadence.toFixed(2)}</h3>
              </div>
              <div>
                <h3 class="info__characteristics">Calories Burned</h3>
                <h3 class="info__number">${activ.calories.toFixed(2)}</h3>
              </div>
            </div>
        `;
        activityData.innerHTML = "";
        activityData.insertAdjacentHTML("afterbegin", html);

        const html2 = `
          <div class="data__header ">
              <h2>Results</h2>
              <h2>Time: ${
                activ.movingTime.toString().slice(0, 2) +
                ":" +
                activ.movingTime.toString().slice(2, 4)
              }</h2>
            </div>
            <hr />
            <hr / class="line2">
            <div class="info__data">
              <div>
                <h3 class="info__characteristics">Average Heart Rate</h3>
                <h3 class="info__number">${activ.heartRate}</h3>
              </div>
              <div>
                <h3 class="info__characteristics">Max Speed</h3>
                <h3 class="info__number">${activ.maxSpeed}</h3>
              </div>
              <div>
                <h3 class="info__characteristics">Max Heart Rate</h3>
                <h3 class="info__number">${activ.maxHeartRate}</h3>
              </div>
            </div>
        `;
        activityData2.innerHTML = "";
        activityData2.insertAdjacentHTML("afterbegin", html2);

        tabsContainer.addEventListener("click", function (e) {
          const clicked = e.target.closest(".btn-tab");

          if (!clicked) return;
          tabsContent.forEach((c) => c.classList.remove("info-active"));
          document
            .querySelector(`.info-change--${clicked.dataset.tab}`)
            .classList.add("info-active");
        });
      } catch (err) {
        console.log(err);
      }
    };
    ["hashchange", "load"].forEach((ev) =>
      window.addEventListener(ev, getActivity)
    );

    ///////////// ---Load Results--- /////////////
    const getResults = async function () {
      try {
        const accessKey = await config.reAuthorize();

        const response = await fetch(
          `${API_RESULTS}?access_token=${accessKey.access_token}`
        );
        const data = await response.json();

        if (!response.ok)
          throw new Error(`${data.message} (${response.status})`);

        for (let result of data) {
          result = {
            id: result.id,
            latLng: result.start_latlng,
            name: result.name,
            distance: result.distance,
            startDate: result.start_date,
          };

          // Auto display half marathons
          const halfMarathon = function () {
            if (result.distance >= 10000) {
              const html = `
                  <div class = "box">
                    <p>Congratulations, Prepare to Marathon ${(
                      result.distance / 1000
                    ).toFixed(2)} km !!! 👑🏃🥇</p>
                  </div>
              `;
              modal.insertAdjacentHTML("beforeend", html);
            }
          };
          halfMarathon();

          const openModal = function () {
            modal.classList.remove("hidden");
            theMap.style.zIndex = "-999";
          };
          setTimeout(openModal, 4000);

          const closeModal = function () {
            modal.classList.add("hidden");
            theMap.style.zIndex = "0";
          };
          setTimeout(closeModal, 8000);

          const html = `
            <div class="activities activities--scroll" data-id="${
              result.latLng
            }">
            <a class="clicking" href="#${result.id}">
              <div class="activities__row">
                <div class="activities__runDate">
                  <p class="activities__name">${result.name}</p>
                  <p class="activities__date">${result.startDate.slice(
                    0,
                    10
                  )}</p>
                </div>
                <p class="activities__distance">${(
                  result.distance / 1000
                ).toFixed(2)} km</p>
              </div>
              </a>
            `;
          activity.insertAdjacentHTML("afterbegin", html);
        }

        const infoHtml = `
            <div>
              <p class="info__name">Garmin vívoactive 3</p>
            </div>
            <p class="info__run">Total Activities: ${data.length}, ${data
          .flatMap((dis) => dis.distance)
          .reduce((sum, cur) => sum + cur / 1000, 0)
          .toFixed(2)} km</p>
            `;
        info.innerHTML = "";
        info.insertAdjacentHTML("afterbegin", infoHtml);

        //////////////--- Map & Geolocation ---//////////////
        const map = L.map("map").setView([47.0239, 28.8322], 12);

        L.tileLayer(`${TILE_LAYER}`, {
          attribution: `${MAP_ATTRIBUTION}`,
          className: `${MAP_CLASSNAME}`,
        }).addTo(map);

        ///////////// ---Target By Id Map--- /////////////
        activity.addEventListener("click", function (e) {
          const coordEl = e.target.closest(".activities");

          const coordsMove = data.find(
            (coords) => coords.start_latlng == coordEl.dataset.id
          );

          map.setView(coordsMove.start_latlng, 14, {
            animate: true,
            pan: {
              duration: 1,
            },
          });

          const coords = L.Polyline.fromEncoded(
            coordsMove.map.summary_polyline
          ).getLatLngs();

          L.polyline(coords, {
            color: "#FF4500",
            weight: 5,
            opacity: 0.8,
            lineJoin: "round",
          }).addTo(map);

          L.marker(coordsMove.start_latlng)
            .addTo(map)
            .bindPopup(
              L.popup({
                maxWidth: 200,
                minWidth: 80,
                closeOnClick: false,
              })
            )
            .setPopupContent("Start 🏃")
            .openPopup();
        });
      } catch (err) {
        console.log(err);
      }
    };
    getResults();
  }
}
const app = new App();
