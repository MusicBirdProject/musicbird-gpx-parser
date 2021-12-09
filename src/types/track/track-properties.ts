import { Property, List } from '../common';
import { ChordCollectionItem } from '../chord';

export enum PropertyType {
    Tuning = 'Tuning',
    TuningFlat = 'TuningFlat',
    AutoBrush = 'AutoBrush',
    CapoFret = 'CapoFret',
    PartialCapoFret = 'PartialCapoFret',
    DiagramCollection = 'DiagramCollection',
    DiagramWorkingSet = 'DiagramWorkingSet',
    ChordCollection = 'ChordCollection',
    ChordWorkingSet = 'ChordWorkingSet'
}

/* Properties */

export interface TuningProperty extends Property<"Tuning"> {
    pitches: string;
}

export interface CapoFretProperty extends Property<"CapoFret"> {
    fret: string;
}

export interface PartialCapoFretProperty extends Property<"PartialCapoFret"> {
    fret: string;
}

export interface AutoBrushProperty extends Property<"AutoBrush"> {
    enable: boolean;
}

export interface TuningFlatProperty extends Property<"TuningFlat"> {
    enable: boolean;
}

export interface ChordCollectionProperty extends Property<"DiagramCollection"|"DiagramWorkingSet"|"ChordCollection"|"ChordWorkingSet"> {
    items: List<ChordCollectionItem>;
}

export type TrackProperty = TuningProperty
    | CapoFretProperty
    | PartialCapoFretProperty
    | AutoBrushProperty
    | TuningFlatProperty
    | ChordCollectionProperty;
