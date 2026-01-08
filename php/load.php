<?php
require "config.php"; // DB-Verbindung

$fetchUrl = "https://im3.carlopierotto.ch/php/fetch_data.php";

// cURL statt file_get_contents
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $fetchUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
$apiData = curl_exec($ch);

if ($apiData === false) {
    // Das zeigt dir den genauen Grund (z.B. "Connection timed out" oder SSL Fehler)
    die("cURL Fehler: " . curl_error($ch)); 
}
curl_close($ch);

if ($apiData === false) {
    die("Fehler: Daten konnten nicht geladen werden.");
}

// JSON dekodieren
$places = json_decode($apiData, true);
if ($places === null) {
    die("Fehler: Ungültiges JSON von fetch_data.php");
}

// Daten in die DB
foreach ($places as $place) {
    $location = $place['location'];
    $velos = $place['velos'];

    $stmt = $pdo->prepare("INSERT INTO IM3Velo (location, Velos) VALUES (?, ?)");
    $stmt->execute([$location, $velos]);
}

echo "Alle Daten erfolgreich in die Datenbank geschrieben!";
