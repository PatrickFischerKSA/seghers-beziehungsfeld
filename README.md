# Seghers – Beziehungsfeld (Spiel zum Figuren- und Beziehungswissen)

**Textbasis:** Anna Seghers, *Der Ausflug der toten Mädchen*.

## Was ist das?
Ein Unterrichtsspiel (Matura-Niveau), das Figurenwissen nicht über Abfrage, sondern über **Beziehungen**, **Zeitbruch** und **moralische Kollisionen** aufbaut.

## Start
- Repo auf GitHub hochladen
- GitHub Pages aktivieren (Settings → Pages → Deploy from Branch → main / root)
- Dann `index.html` öffnen

## Struktur (wichtig: getrennte Inhalte)
- `assets/` Medien (Bilder/Icons)
- `texts/` Markdown-Texte (Figuren + Interpretationsimpulse)
- `data/` JSON (Figuren/Beziehungen/Zeitfenster)
- `js/` Logik (nur Funktionen)
- `css/` Darstellung

## Inhalte erweitern
1. Neue Figur:
   - Bild in `assets/images/figures/`
   - Text in `texts/figures/`
   - Eintrag in `data/figures.json`
2. Neue Beziehung:
   - Eintrag in `data/relationships.json`
3. Neue Interpretationskarte:
   - Eintrag in `data/interpretations.json`

## Export/Import
- Export erstellt `beziehungsfeld_state.json` (Gruppenstand speichern)
- Import lädt diese Datei wieder ein

## ARBEITSMODUS-Transparenz
- **Keine Platzhalter**: alle Dateien sind real vorhanden.
- **Keine stillschweigenden Änderungen**: v1 = initiale Vollversion.
