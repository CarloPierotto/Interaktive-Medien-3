<?php
require "config.php"; // DB-Verbindung

if (!isset($_GET['location'])) {
    http_response_code(400);
    echo json_encode(["error" => "Location fehlt"]);
    exit;
}
$location = $_GET['location'];

// SQL: Durchschnitt pro Wochentag UND Stunde, basierend auf den letzten 30 Tagen
// Wir gruppieren hier nach zwei Werten: Wochentag und Stunde
$sql = "
    SELECT 
        DAYOFWEEK(`timestamp`) AS wochentag,
        HOUR(`timestamp`) AS stunde,
        AVG(velos) AS durchschnitt
    FROM IM3Velo
    WHERE location = :location
      AND `timestamp` >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY wochentag, stunde
    ORDER BY wochentag, stunde
";

$stmt = $pdo->prepare($sql);
$stmt->execute(['location' => $location]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Mapping DAYOFWEEK (MySQL: 1=Sonntag, 2=Montag ...)
$wochentage = [1=>"Sonntag", 2=>"Montag", 3=>"Dienstag", 4=>"Mittwoch", 5=>"Donnerstag", 6=>"Freitag", 7=>"Samstag"];

// Ergebnisarray vorbereiten: 
// Wir wollen für jeden Tag ein Array mit 24 Stunden (0-23), initialisiert mit 0.
$result = [];
foreach ($wochentage as $tag) {
    $result[$tag] = array_fill(0, 24, 0); 
}

// Daten einfüllen
foreach ($rows as $row) {
    $tagName = $wochentage[$row['wochentag']]; // z.B. "Donnerstag"
    $stunde  = (int)$row['stunde'];            // z.B. 14
    
    // Wir runden auf Ganze Zahlen, da halbe Velos im Chart komisch aussehen
    $result[$tagName][$stunde] = round($row['durchschnitt']);
}

// JSON ausgeben
header('Content-Type: application/json');
echo json_encode($result);
?>