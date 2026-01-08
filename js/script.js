//leaflet Karte
var map = L.map('map').setView([46.8623, 9.5238], 13);

//Tiles von OpenStreetMap laden
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Live Anzahl Velos
let liveVelosProOrt = {};

//Toggle für Chart
let currentSelectedLocation = null;

// Speichert Verweise auf alle Marker, damit wir sie später ansprechen können
let allMarkers = [];

//API fetchen
fetch("https://api.nextbike.net/maps/nextbike-live.json")
.then(res => res.json())
.then(data => {

    const passendesLand = data.countries.find(country => {
        if (country.cities && country.cities.length > 0) {
            return country.cities[0].alias === "chur";
        }
        return false; //Falls keine Städte da sind, weitersuchen
    });
    
    if (passendesLand) {
        console.log("Richtigen Eintrag gefunden! Land:", passendesLand.name);
        
        // Da wir wissen, dass bei diesem Eintrag Chur an Stelle 0 ist:
        const chur = passendesLand.cities[0];

        // Daten mappen
        const ApiData = chur.places.map(spot => ({
            name: spot.name,
            lat: spot.lat,
            lng: spot.lng,
            bikes: spot.bikes
        }));

        console.log(ApiData);

    ApiData.forEach(function(place) {
        liveVelosProOrt[place.name] = place.bikes;
        var circle = L.circleMarker([parseFloat(place.lat), parseFloat(place.lng)], {
        color: 'red',
        fillColor: '#c60b0e', // var(--blood) direkt als HEX, da Leaflet keine CSS Variablen mag
        fillOpacity: 0.33,
        stroke: false,
        radius: place.bikes + 12    
    }).addTo(map);
    
    // Custom Property um den Namen zu speichern & Marker in Liste aufnehmen
    circle.locationName = place.name;
    allMarkers.push(circle);

    circle.on('click', function() {
        handleMarkerClick(place.name);
    });
    });
    }
});

//Hier kommt der Chart Teil

// --- 1. Variablen ---
let myChart;        // Globale Variable für das Chart
let alleDaten = {}; // Hier speichern wir die JSON-Daten

// Array für die Wochentage (für die Navigation)
const tageNamen = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
let aktuellerTagIndex = 0; // 0 = Montag, 1 = Dienstag ...

// Labels für die X-Achse (00 Uhr bis 23 Uhr)
const stundenLabels = Array.from({length: 24}, (_, i) => i + " Uhr");


// --- 2. Chart Initialisieren ---
function initChart() {
    if (myChart) {
        myChart.destroy();
    }

    const ctx = document.getElementById('veloChart').getContext('2d');
    
    const config = {
        type: 'bar',
        data: {
            labels: stundenLabels,
            datasets: [
                // Dataset 1: Der Live-Wert (Rot, schmal, im Vordergrund)
                {
                    label: 'Live jetzt',
                    data: [], // Wird gleich gefüllt
                    backgroundColor: '#ff40408b', // Rot
                    borderRadius: 4,
                    barPercentage: 0.9, // Schmaler als der Durchschnitt
                    grouped: false,     // WICHTIG: Nicht daneben, sondern davor
                    order: 1            // Liegt im Vordergrund (kleinere Zahl = weiter oben)
                },
                // Dataset 2: Der Durchschnitt (Blau, breit, im Hintergrund)
                {
                    label: 'Durchschnitt',
                    data: [], 
                    backgroundColor: '#B6B4A5', // Blau, leicht transparent
                    borderRadius: 4,
                    barPercentage: 0.9, // Breit
                    grouped: false,     // Lässt Überlappung zu
                    order: 2            // Liegt im Hintergrund
                }
            ]
        },
        options: {
            responsive: true,
            plugins: { 
                legend: { display: false } 
            },
            scales: {
                y: { 
                    display: true, // NEU: Jetzt zeigen wir die Achse an
                    beginAtZero: true,
                    border: { display: false }, // Entfernt die harte Linie am Rand
                    grid: { display: false },   // WICHTIG: Kein Gitter, damit es clean bleibt
                    ticks: {
                        stepSize: 5, // Zeigt nur Schritte in 5er Abständen (0, 5, 10...)
                        color: '#999' // Farbe der Zahlen (leichtes Grau)
                    }
                }, 
                x: { 
                    grid: { display: false, drawBorder: false },
                    ticks: {
                        maxRotation: 0,
                        autoSkip: false, 
                        callback: function(val, index) {
                            return index % 3 === 0 ? this.getLabelForValue(val) : '';
                        }
                    }
                }
            }
        }
    };

    myChart = new Chart(ctx, config);
}

// --- 3. Chart Daten aktualisieren ---
function updateChart(wochentag) {
    // Sicherheitscheck
    if (!alleDaten[wochentag]) return; 

    // 1. Durchschnitts-Daten setzen (immer)
    myChart.data.datasets[1].data = alleDaten[wochentag];

    // 2. Live-Daten vorbereiten
    // Zuerst: Welcher Tag ist heute wirklich?
    const jsDay = new Date().getDay(); 
    const heuteIndex = (jsDay + 6) % 7; // Umrechnung 0=So -> 6=So, 0=Mo
    const heuteString = tageNamen[heuteIndex]; // z.B. "Dienstag"

    // Wir erstellen ein leeres Array
    let liveArray = new Array(24).fill(null);

    // WICHTIG: Nur wenn der angezeigte Tag (wochentag) gleich heute ist (heuteString),
    // füllen wir den roten Balken ein.
    if (wochentag === heuteString) {
        
        const currentHour = new Date().getHours();
        
        const liveAnzahl = (currentSelectedLocation && liveVelosProOrt[currentSelectedLocation]) 
                            ? liveVelosProOrt[currentSelectedLocation] 
                            : null;

        if (liveAnzahl !== null) {
            liveArray[currentHour] = liveAnzahl;
        }
    }

    // Live-Daten setzen (Entweder mit Wert oder leer)
    myChart.data.datasets[0].data = liveArray;

    myChart.update();
}

// --- 4. Anzeige und Navigation aktualisieren (NEU) ---
function updateDayDisplay() {
    // Welcher Tag ist gerade dran?
    const tagString = tageNamen[aktuellerTagIndex];
    
    // Text im HTML ändern (zwischen den Pfeilen)
    const displayElement = document.getElementById('currentDayDisplay');
    if(displayElement) {
        displayElement.innerText = tagString;
    }
    
    // Chart aktualisieren
    updateChart(tagString);
}

// --- 5. Daten laden ---
async function loadData(locationName) {        
    try {
        const response = await fetch(`https://im3.carlopierotto.ch/php/get_average.php?location=${locationName}`);
        alleDaten = await response.json();

        // -----------------------------------------------------------
        // START NEUER CODE: Status (Mehr/Weniger) berechnen
        // -----------------------------------------------------------

        // 1. Wir brauchen den "echten" heutigen Wochentag (nicht den vom Chart-Pfeil)
        // JS: 0=Sonntag, 1=Montag ...
        const realJsDay = new Date().getDay(); 
        // Umrechnung auf unser Array: 0=Montag ... 6=Sonntag
        const realTodayIndex = (realJsDay + 6) % 7; 
        const realTodayString = tageNamen[realTodayIndex]; // z.B. "Dienstag"
        
        // Aktuelle Stunde (0-23)
        const currentHour = new Date().getHours(); 

        // 2. Werte vergleichen
        // Live-Wert holen (falls keiner da ist, nehmen wir 0)
        const liveWert = liveVelosProOrt[locationName] || 0;
        
        // Durchschnittswert holen (nur wenn Daten da sind)
        let durchschnittWert = 0;
        if (alleDaten[realTodayString] && alleDaten[realTodayString][currentHour]) {
            durchschnittWert = alleDaten[realTodayString][currentHour];
        }

        // 3. Text entscheiden
        let statusText = "";
        const element = document.getElementById('locationStatus'); // Das HTML Element suchen

        if (element) { // Nur machen, wenn das Element existiert
            if (liveWert > durchschnittWert) {
                statusText = "Mehr Velos als üblich";
                element.style.color = "#B6B4A5";
            } 
            else if (liveWert < durchschnittWert) {
                statusText = "Weniger Velos als üblich";
                element.style.color = "#B6B4A5";
            } 
            else {
                statusText = "Genau so viele Velos wie gewöhnlich";
                element.style.color = "#B6B4A5";
            }
            element.innerText = statusText;
        }

        // Den heutigen Wochentag ermitteln für den Start
        // JS getDay(): 0 = Sonntag, 1 = Montag ...
        let jsDay = new Date().getDay();
        
        // Umrechnung: JS (0=So) -> Unsere Logik (6=So, 0=Mo)
        aktuellerTagIndex = (jsDay + 6) % 7; 

        // Chart initialisieren
        initChart();
        
        // Text und Daten anzeigen
        updateDayDisplay();

    } catch (error) {
        console.error("Fehler beim Laden der Daten:", error);
    }
}

// --- 6. Event Listener für die Pfeile (NEU) ---

// Pfeil nach links
document.getElementById('prevDay').addEventListener('click', function() {
    aktuellerTagIndex--;
    if (aktuellerTagIndex < 0) {
        aktuellerTagIndex = 6; // Sprung zu Sonntag
    }
    updateDayDisplay();
});

// Pfeil nach rechts
document.getElementById('nextDay').addEventListener('click', function() {
    aktuellerTagIndex++;
    if (aktuellerTagIndex > 6) {
        aktuellerTagIndex = 0; // Sprung zu Montag
    }
    updateDayDisplay();
});

// Close Button Logic
document.querySelector('.close-button').addEventListener('click', function() {
    const wrapper = document.querySelector('.chart-wrapper');
    wrapper.classList.remove('open');
    currentSelectedLocation = null;

    // Alle Marker zurücksetzen
    allMarkers.forEach(marker => {
        marker.setStyle({ fillOpacity: 0.25 });
    });
});

// --- 7. Toggle Funktion (Klick auf Marker) ---
function handleMarkerClick(locationName) {
    const wrapper = document.querySelector('.chart-wrapper');

    // 1. Alle Marker zuerst zurücksetzen (blass machen)
    allMarkers.forEach(marker => {
        marker.setStyle({ fillOpacity: 0.25 });
    });

    // Chart ausblenden wenn gleicher Marker geklickt
    if (currentSelectedLocation === locationName) {
        wrapper.classList.remove('open');
        currentSelectedLocation = null;
    } 
    // Neuer Standort -> öffnen & Marker hervorheben
    else {
        currentSelectedLocation = locationName;
        
        // Den passenden Marker suchen und Deckkraft erhöhen
        const selectedMarker = allMarkers.find(marker => marker.locationName === locationName);
        if (selectedMarker) {
            selectedMarker.setStyle({ fillOpacity: 0.66 }); // Deutlich deckender
        }

        document.getElementById('locationTitle').innerText = locationName;
        
        loadData(locationName);
        
        // Erst sichtbar machen, wenn Daten geladen werden
        wrapper.classList.add('open');
        wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}