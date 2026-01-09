# Interaktive-Medien-3
Ein Projekt von Tim Eberhard und Carlo Pierotto

Projektbeschrieb:
In der ganzen Stadt Chur lassen sich Mietvelos finden, sogenannte Mooinz Velos. Dies wird von der Stadt angeboten im Rahmen eines Mobilitäts-Programms.
Mit Velogeier können User sehen, wo in der Stadt sich wie viele Velos befinden und können eine Timeline sehen, wann wo wie viele Velos zu erwarten sind.
Durch einen Klick auf den gewünschten Standort, wird die Timeline als Balkendiagramm angezeigt.
Ebenfalls wird dir angezeigt, ob momentan mehr oder weniger Velos als üblich an einem gewissen Standort sind.

Stelle dir vor, du besuchst deinen Kollegen Lorenzo im Welschdörfli. Du nimmst an, dass du um 23:00 - 00:00 Uhr nach Hause gehen wirst. Da du aber mit einem Mooinz Velo gekommen bist, kannst du nicht wissen, ob dieses auch noch verfügbar sein wird, wenn du nach Hause gehen möchtest. 
Mit Velogeier kannst du ganz leicht schauen, wo zu welcher Zeit, wie viele Velos im Schnitt zu finden sind. So weisst du auch, ob es sicherer ist bei der Station Brambrüeschbahn oder beim Obertor nach einem Mooinz Velo zu suchen.

Durch die Grösse der Punkte auf der Karte kann man ebenfalls sehen, wo wie viele Velos im Moment sind.


Learnings:
Wir haben zwar in unserer Mediematiker Lehre bereits mit all diesen Sprachen und Tools (HTML, CSS, JS, PHP, SQL Datenbanken) gearbeitet, dies aber nur sehr oberflächlich. Mit diesem Projekt haben wir unser Wissen und vorallem das praktische Anwenden und die Zusammenarbeit dieser Tools besser kennengelernt. Nach diesem Projekt fühlen wir und bereit, um die gelernten Skills in grösseren Projekten mit vielen Datensätzen anzuwenden und kennen die Möglichkeiten von APIs, Datenbanken und PHP Scripts, die automatisch ausgeführt werden.
Das UI weicht etwas von unserem ursprünglichen Entwurf ab, da wir gesehen haben, dass es viel mehr Sinn macht, direkt zu sehen, zu welcher Stunde wie viele Velos verfügbar sind, statt, dass es zuerst auf Tagesbasis angezeigt wird. Wir haben uns also dazu entschieden, direkt den Stundenchart anzuzeigen, wenn man auf einen Standort klickt. Den Tageschart haben wir weggelassen, da es praktisch keinen usecase dafür gibt.


Schwierigkeiten:
Leider ist die API, die wir verwendet haben, nicht Statisch. Wir haben das am Anfang nicht gewusst und haben für die Datenabfrage das Land mit der Nummer 125 abgefragt. Nach ein paar Tagen - Wochen hat aber die API falsche Daten gesammelt und wir mussten feststellen, dass es daran liegt, dass unser Land nicht mehr die Nummer 125 hat.
Am Montag haben wir dieses Problem behoben, dass für die Datenabfrage das Land mit der Stadt Chur gesucht wird, statt einfach das Land mit der Nummer 125. Da die Daten, die über Monate hätten gesammelt werden können falsch waren und gelöscht wurden, haben wir Daten für die API erfunden, damit der Chart etwas anzeigt.
Die Daten werden aber laufend von der API hegolt und in der Datenbank gespeichert. in 30 Tagen wird nichts mehr von den erfundenen Zahlen sichtbar sein.

Ansonsten ist die erstellung sehr gut verlaufen und die Erstellung hat so funktioniert, wie gewünscht.
Wir mussten asm Schluss des Projekts ein neues Github repository machen, da wir das config.php File mithochgeladen hatten. Doch jetzt sollte keine Spur mehr davon sein.


Genutzte Ressourcen:
Wir haben mit VS Code gearbeitet und die Daten auf Github hochgeladen. Github haben wir so eingerichtet, dass die gepushten Daten, automatisch auf die Website hochgeladen werden. So konnten wir immer direkt sehen, ob die gewünschten Änderungen funktionieren, ohne, dass wir die Files manuell mit Filezille hochladen mussten.
Die Seite wurde mit HTML, CSS, JS und PHP erstellt, ausserdem werden die Daten, welche von der Nextbike API genommen werden, auf einer Datenbank gespeichert (damit auch die Timeline angezeigt werden kann).
Mit Leaflet wird eine interaktive Karte von Chur angezeigt. Auch die Punkte auf der Karte wurden mit Leaflet (über Javascript) erstellt. Die Timeline wird mit Chart.js angezeigt. 