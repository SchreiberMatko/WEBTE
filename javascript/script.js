// Teaching part of the winter semester 2026/2027 at FEI STU (local time)
const SEMESTER_START = new Date("2026-09-14T00:00:00"); // 14.09.2026
const SEMESTER_END = new Date("2026-12-11T23:59:59"); // 11.12.2026, exams start 14.12.2026

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_WEEK = 7 * MS_PER_DAY;
const REFRESH_INTERVAL_MS = 60 * 1000;

// Visitor-facing texts are in Slovak
const DAY_PHRASES = ["v nedeľu", "v pondelok", "v utorok", "v stredu", "vo štvrtok", "v piatok", "v sobotu"];
const LESSON_TYPE_LABELS = {
  lecture: "prednáška",
  exercise: "cvičenie",
  sport: "telesná výchova",
};

const dateFormatter = new Intl.DateTimeFormat("sk-SK", { day: "numeric", month: "numeric", year: "numeric" });
const shortDateFormatter = new Intl.DateTimeFormat("sk-SK", { day: "numeric", month: "numeric" });

function startOfDay(date) {
  const day = new Date(date);
  day.setHours(0, 0, 0, 0);
  return day;
}

function getMinutesOfDay(date) {
  return date.getHours() * 60 + date.getMinutes();
}

// "08:30" -> 510
function parseTime(text) {
  const [hours, minutes] = text.split(":").map(Number);
  return hours * 60 + minutes;
}

// 510 -> "8:30"
function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  return `${hours}:${String(minutes % 60).padStart(2, "0")}`;
}

/* =========================================================
   Schedule page
   ========================================================= */

function readLessons(table) {
  return Array.from(table.querySelectorAll(".lesson"), (cell) => ({
    cell,
    day: Number(cell.closest("tr").dataset.day),
    start: parseTime(cell.dataset.start),
    end: parseTime(cell.dataset.end),
    type: cell.dataset.type,
    name: cell.querySelector(".lesson__name").textContent.trim(),
  }));
}

function describeLesson(lesson) {
  return `${lesson.name} (${LESSON_TYPE_LABELS[lesson.type]})`;
}

function describeWhen(date, now) {
  const dayDiff = Math.round((startOfDay(date) - startOfDay(now)) / MS_PER_DAY);
  const time = formatTime(getMinutesOfDay(date));

  if (dayDiff === 0) return `dnes o ${time}`;
  if (dayDiff === 1) return `zajtra o ${time}`;
  return `${DAY_PHRASES[date.getDay()]} ${shortDateFormatter.format(date)} o ${time}`;
}

// First lesson that starts after the given moment, searching one week ahead
function findNextLesson(lessons, from) {
  const fromMinutes = getMinutesOfDay(from);

  for (let offset = 0; offset <= 7; offset++) {
    const date = startOfDay(from);
    date.setDate(date.getDate() + offset);

    const upcoming = lessons
      .filter((lesson) => lesson.day === date.getDay() && (offset > 0 || lesson.start > fromMinutes))
      .sort((a, b) => a.start - b.start);

    if (upcoming.length > 0) {
      date.setHours(0, upcoming[0].start);
      return { lesson: upcoming[0], date };
    }
  }
  return null;
}

function markToday(table, isTeachingDay) {
  const today = new Date().getDay();

  table.querySelectorAll("tbody tr").forEach((row) => {
    const header = row.querySelector("th");
    if (isTeachingDay && Number(row.dataset.day) === today) {
      header.setAttribute("aria-current", "date");
    } else {
      header.removeAttribute("aria-current");
    }
  });
}

function updateLessonStatus(table, lessons, status) {
  const now = new Date();
  const minutes = getMinutesOfDay(now);
  const isInSemester = now >= SEMESTER_START && now <= SEMESTER_END;

  lessons.forEach((lesson) => lesson.cell.removeAttribute("aria-current"));
  markToday(table, isInSemester);

  if (now < SEMESTER_START) {
    const first = findNextLesson(lessons, SEMESTER_START);
    status.textContent = `Semester ešte nezačal, výučba začína ${dateFormatter.format(SEMESTER_START)}.`;
    if (first) {
      status.textContent += ` Prvá hodina: ${describeLesson(first.lesson)} – ${describeWhen(first.date, now)}.`;
    }
    return;
  }

  if (now > SEMESTER_END) {
    status.textContent = `Semester sa skončil ${dateFormatter.format(SEMESTER_END)} a výučba už neprebieha. Najlepšie ma zastihnete e-mailom.`;
    return;
  }

  const current = lessons.find(
    (lesson) => lesson.day === now.getDay() && lesson.start <= minutes && minutes < lesson.end
  );

  if (current) {
    current.cell.setAttribute("aria-current", "time");
    status.textContent = `Práve mám hodinu: ${describeLesson(current)}, končí o ${formatTime(current.end)}.`;
    return;
  }

  const next = findNextLesson(lessons, now);

  if (!next || next.date > SEMESTER_END) {
    status.textContent = "Práve nemám výučbu a do konca semestra ma už žiadna hodina nečaká.";
    return;
  }

  status.textContent = `Práve nemám výučbu. Najbližšia hodina: ${describeLesson(next.lesson)} – ${describeWhen(next.date, now)}.`;
}

function initScheduleFilter(table) {
  const buttons = document.querySelectorAll("[data-filter]");
  const tableWrapper = table.closest(".table-scroll");
  const emptyMessage = document.getElementById("filter-empty");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      buttons.forEach((other) => other.setAttribute("aria-pressed", String(other === button)));
      table.dataset.activeFilter = filter;

      // Show a message instead of an empty table when nothing matches
      const selector = filter === "all" ? ".lesson" : `.lesson[data-type="${filter}"]`;
      const hasLessons = table.querySelector(selector) !== null;
      tableWrapper.hidden = !hasLessons;
      emptyMessage.hidden = hasLessons;
    });
  });
}

function updateSemesterProgress() {
  const bar = document.getElementById("semester-progress");
  const label = document.getElementById("semester-label");
  if (!bar || !label) return;

  const total = SEMESTER_END - SEMESTER_START;
  const elapsed = Math.min(Math.max(Date.now() - SEMESTER_START, 0), total);
  const percent = Math.round((elapsed / total) * 100);
  const range = `${dateFormatter.format(SEMESTER_START)} – ${dateFormatter.format(SEMESTER_END)}`;

  bar.value = percent;
  bar.textContent = `${percent} %`;
  label.textContent = `Uplynulo ${percent} % semestra (${range}).`;

  if (elapsed > 0 && elapsed < total) {
    const week = Math.floor(elapsed / MS_PER_WEEK) + 1;
    const totalWeeks = Math.ceil(total / MS_PER_WEEK);
    label.textContent += ` Prebieha ${week}. týždeň z ${totalWeeks}.`;
  }
}

function initSchedule() {
  const table = document.getElementById("schedule");
  const status = document.getElementById("lesson-status");
  if (!table || !status) return;

  const lessons = readLessons(table);
  const refresh = () => {
    updateLessonStatus(table, lessons, status);
    updateSemesterProgress();
  };

  initScheduleFilter(table);
  refresh();
  setInterval(refresh, REFRESH_INTERVAL_MS);
}

/* =========================================================
   Map page
   ========================================================= */

const EARTH_RADIUS_KM = 6371;
const POINTS_STORAGE_KEY = "webte-map-points";
const LABEL_OFFSET = [0, -10];

// Fixed places shown on the map all the time (home is approximate)
const PLACES = {
  school: { name: "FEI STU", lat: 48.151965, lng: 17.072995 },
  home: { name: "Domov – Banská Bystrica", lat: 48.7358, lng: 19.1462 },
};

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

// Great-circle distance in kilometres using the haversine formula
function getDistanceKm(from, to) {
  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(deltaLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toLocaleString("sk-SK", { maximumFractionDigits: 2 })} km`;
}

function formatCoordinates(point) {
  return `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`;
}

function loadPoints() {
  try {
    const saved = JSON.parse(localStorage.getItem(POINTS_STORAGE_KEY));
    if (!Array.isArray(saved)) return [];

    return saved.filter(
      (point) =>
        typeof point.id === "string" &&
        typeof point.name === "string" &&
        Number.isFinite(point.lat) &&
        Number.isFinite(point.lng)
    );
  } catch {
    return [];
  }
}

function savePoints(points) {
  try {
    localStorage.setItem(POINTS_STORAGE_KEY, JSON.stringify(points));
    return true;
  } catch {
    return false;
  }
}

function createPinIcon(variant) {
  return L.divIcon({ className: `map-pin map-pin--${variant}`, iconSize: [18, 18] });
}

// Tooltip content as a text node, so user-entered names are never parsed as HTML
function createLabel(text) {
  const label = document.createElement("span");
  label.textContent = text;
  return label;
}

function setMarkerLabel(marker, text, permanent) {
  marker.unbindTooltip();
  marker.bindTooltip(createLabel(text), {
    permanent,
    direction: "top",
    offset: LABEL_OFFSET,
    className: "map-label",
  });
}

function initMap() {
  const mapElement = document.getElementById("map");
  if (!mapElement || typeof L === "undefined") return;

  const elements = {
    list: document.getElementById("point-list"),
    empty: document.getElementById("points-empty"),
    form: document.getElementById("point-form"),
    nameInput: document.getElementById("point-name"),
    coordinates: document.getElementById("point-coordinates"),
    cancelButton: document.getElementById("point-cancel"),
    addCenterButton: document.getElementById("add-center"),
    targetButtons: document.querySelectorAll("[data-target]"),
    result: document.getElementById("route-result"),
    storageWarning: document.getElementById("storage-warning"),
    commute: document.getElementById("commute-distance"),
  };

  const state = {
    points: loadPoints(),
    selectedId: null,
    target: "school",
    pending: null,
  };

  const map = L.map(mapElement);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  const placeMarkers = {};
  Object.entries(PLACES).forEach(([key, place]) => {
    placeMarkers[key] = L.marker([place.lat, place.lng], {
      icon: createPinIcon(key),
      interactive: false,
      keyboard: false,
    }).addTo(map);
  });

  const pointLayer = L.layerGroup().addTo(map);
  const routeLayer = L.layerGroup().addTo(map);
  const pointMarkers = new Map();
  let pendingMarker = null;

  map.fitBounds(L.latLngBounds([PLACES.school, PLACES.home]).pad(0.6));

  if (elements.commute) {
    elements.commute.textContent = formatDistance(getDistanceKm(PLACES.home, PLACES.school));
  }

  function createListItem(point) {
    const item = document.createElement("li");
    item.className = "point-list__item";

    const selectButton = document.createElement("button");
    selectButton.type = "button";
    selectButton.className = "button point-list__select";
    selectButton.dataset.id = point.id;
    selectButton.setAttribute("aria-pressed", "false");

    const name = document.createElement("span");
    name.className = "point-list__name";
    name.textContent = point.name;

    const coordinates = document.createElement("span");
    coordinates.className = "point-list__coordinates";
    coordinates.textContent = formatCoordinates(point);

    selectButton.append(name, coordinates);
    selectButton.addEventListener("click", () => selectPoint(point.id));

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "button";
    removeButton.textContent = "Odstrániť";
    removeButton.setAttribute("aria-label", `Odstrániť bod ${point.name}`);
    removeButton.addEventListener("click", () => removePoint(point.id));

    item.append(selectButton, removeButton);
    return item;
  }

  // Rebuilds list items and markers from state.points
  function renderPoints() {
    pointLayer.clearLayers();
    pointMarkers.clear();
    elements.list.replaceChildren();
    elements.empty.hidden = state.points.length > 0;

    state.points.forEach((point) => {
      const marker = L.marker([point.lat, point.lng], {
        icon: createPinIcon("point"),
        title: point.name,
      })
        .on("click", () => selectPoint(point.id))
        .addTo(pointLayer);

      pointMarkers.set(point.id, marker);
      elements.list.append(createListItem(point));
    });
  }

  function renderRoute(shouldFit) {
    routeLayer.clearLayers();

    Object.entries(PLACES).forEach(([key, place]) => setMarkerLabel(placeMarkers[key], place.name, true));
    state.points.forEach((point) => setMarkerLabel(pointMarkers.get(point.id), point.name, false));

    const point = state.points.find((item) => item.id === state.selectedId);
    const target = PLACES[state.target];

    if (!point) {
      elements.result.textContent =
        state.points.length > 0
          ? "Vyberte bod zo zoznamu alebo kliknite na jeho značku v mape."
          : "Vzdialenosť zobrazím, keď pridáte a vyberiete prvý bod.";
      return;
    }

    const distance = formatDistance(getDistanceKm(point, target));
    const line = L.polyline(
      [
        [point.lat, point.lng],
        [target.lat, target.lng],
      ],
      { className: "map-route", interactive: false }
    ).addTo(routeLayer);

    setMarkerLabel(pointMarkers.get(point.id), `${point.name} · ${distance}`, true);
    setMarkerLabel(placeMarkers[state.target], `${target.name} · ${distance}`, true);
    elements.result.textContent = `${point.name} → ${target.name}: ${distance} vzdušnou čiarou.`;

    if (shouldFit) {
      map.fitBounds(line.getBounds(), { padding: [48, 48], maxZoom: 16 });
    }
  }

  // Updates the selected state in place, so keyboard focus stays where it was
  function updateSelection(shouldFit) {
    elements.list.querySelectorAll(".point-list__select").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.id === state.selectedId));
    });
    pointMarkers.forEach((marker, id) => {
      marker.getElement()?.classList.toggle("map-pin--selected", id === state.selectedId);
    });
    renderRoute(shouldFit);
  }

  function selectPoint(id) {
    state.selectedId = id;
    updateSelection(true);
  }

  function persistPoints() {
    elements.storageWarning.hidden = savePoints(state.points);
  }

  function removePoint(id) {
    state.points = state.points.filter((point) => point.id !== id);
    if (state.selectedId === id) state.selectedId = null;

    persistPoints();
    renderPoints();
    updateSelection(false);

    const firstButton = elements.list.querySelector("button");
    (firstButton ?? elements.addCenterButton).focus();
  }

  function startNewPoint(latlng) {
    state.pending = latlng;

    if (pendingMarker) {
      pendingMarker.setLatLng(latlng);
    } else {
      pendingMarker = L.marker(latlng, {
        icon: createPinIcon("pending"),
        interactive: false,
        keyboard: false,
      }).addTo(map);
    }

    // Keep a name the visitor already started typing when they pick another spot
    if (elements.form.hidden) {
      elements.nameInput.value = `Bod ${state.points.length + 1}`;
    }
    elements.coordinates.textContent = `Súradnice: ${formatCoordinates(latlng)}`;
    elements.form.hidden = false;
    elements.nameInput.focus();
    elements.nameInput.select();
  }

  function cancelNewPoint() {
    state.pending = null;
    pendingMarker?.remove();
    pendingMarker = null;
    elements.form.hidden = true;
  }

  function addPendingPoint() {
    const name = elements.nameInput.value.trim();

    if (!name) {
      elements.nameInput.setCustomValidity("Zadajte názov bodu.");
      elements.nameInput.reportValidity();
      return;
    }

    const point = {
      id: Date.now().toString(36),
      name,
      lat: Number(state.pending.lat.toFixed(6)),
      lng: Number(state.pending.lng.toFixed(6)),
    };

    state.points.push(point);
    state.selectedId = point.id;

    persistPoints();
    cancelNewPoint();
    renderPoints();
    updateSelection(true);
    elements.list.querySelector(`[data-id="${point.id}"]`).focus();
  }

  // The form disappears, so focus goes back to the button that opens it
  function cancelFromForm() {
    cancelNewPoint();
    elements.addCenterButton.focus();
  }

  map.on("click", (event) => startNewPoint(event.latlng.wrap()));
  elements.addCenterButton.addEventListener("click", () => startNewPoint(map.getCenter()));
  elements.cancelButton.addEventListener("click", cancelFromForm);
  elements.nameInput.addEventListener("input", () => elements.nameInput.setCustomValidity(""));

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    addPendingPoint();
  });

  elements.form.addEventListener("keydown", (event) => {
    if (event.key === "Escape") cancelFromForm();
  });

  elements.targetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.target = button.dataset.target;
      elements.targetButtons.forEach((other) => other.setAttribute("aria-pressed", String(other === button)));
      renderRoute(true);
    });
  });

  // The map is moved into <main> once navigation.js loads nav.html
  document.addEventListener("nav-loaded", () => map.invalidateSize());

  renderPoints();
  updateSelection(false);
}

initSchedule();
initMap();
