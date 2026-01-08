<?php
require "config.php"; // Deine bestehende Verbindung nutzen

// Liste aller Standorte aus deinem Screenshot
$locations = [
    "Klinik Waldhaus",
    "FHGR Comercialstrasse",
    "FHGR Pulvermühlestrasse",
    "Postplatz",
    "PHGR Campus",
    "Kantonsspital Graubünden",
    "Kreuzspital",
    "Brambrüeschbahn",
    "Obere Au",
    "Stadthaus Chur",
    "Obertor",
    "GBC",
    "Kantonsschule Plessur",
    "Karlihof",
    "sinergia",
    "Naturmuseum",
    "Neumühle",
    "Bahnhof Nord",
    "Bahnhof Süd",
    "Cadonaustrasse",
    "Bahnhofplatz",
    "Fontana Spital",
    "Bikewerkstatt Feschtland",
    "Sommeraustrasse",
    "Giacomettistrasse",
    "Haldenstein",
    "Lacuna",
    "Pulvermühle",
    "Bahnhof Wiesental",
    "Austrasse",
    "Fortuna",
    "BIKE 90182"
];

// Konfiguration
$startId = 80000; 
$daysBack = 7;
$currentId = $startId;
$entriesCount = 0;

echo "Starte Datengenerierung...<br>";

try {
    $pdo->beginTransaction(); // Transaktion für Geschwindigkeit

    // SQL vorbereiten
    $sql = "INSERT INTO IM3Velo (id, location, timestamp, Velos) VALUES (:id, :location, :timestamp, :velos)";
    $stmt = $pdo->prepare($sql);

    // Schleife für die letzten 7 Tage (in Stunden)
    // 7 Tage * 24 Stunden = 168 Stunden
    for ($i = ($daysBack * 24); $i >= 0; $i--) {
        
        // Zeitstempel berechnen (jede Stunde zurückgehend von jetzt)
        $timeString = date('Y-m-d H:00:00', strtotime("-$i hours"));
        
        // Nur generieren, wenn wir vor 'heute 16:00' sind (optional, hier einfach alles füllen)
        // Wenn du genau bis heute 16:00 auffüllen willst, passt dieser Loop gut.

        foreach ($locations as $loc) {
            
            // Zufällige Anzahl Velos erfinden (z.B. zwischen 0 und 15)
            // Man könnte das noch verfeinern (nachts weniger, tagsüber mehr)
            $hour = (int)date('H', strtotime($timeString));
            
            if ($hour >= 0 && $hour < 6) {
                $velos = rand(0, 2); // Nachts wenig los
            } elseif (($hour >= 7 && $hour < 9) || ($hour >= 16 && $hour < 19)) {
                $velos = rand(5, 20); // Stosszeiten
            } else {
                $velos = rand(1, 10); // Tagsüber normal
            }

            // In Datenbank schreiben
            $stmt->execute([
                'id' => $currentId,
                'location' => $loc,
                'timestamp' => $timeString,
                'velos' => $velos
            ]);

            $currentId++;
            $entriesCount++;
        }
    }

    $pdo->commit(); // Alles speichern
    echo "Fertig! Es wurden $entriesCount Einträge erstellt. IDs von $startId bis " . ($currentId - 1);

} catch (Exception $e) {
    $pdo->rollBack();
    echo "Fehler: " . $e->getMessage();
}
?>