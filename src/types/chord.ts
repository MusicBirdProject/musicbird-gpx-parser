import { List, Finger } from './common';
import { BooleanString, Accidental, Interval, Alteration, Step } from "./common";

///

export interface ChordCollectionItem {
    node: 'item';
    diagram: Diagram;
    chord: Chord;
    attrs: {
        id: string;
        name: string;
    };
}

export interface Diagram extends List<Fret|FingeringProperty|DiagramProperty> {
    attrs: {
        stringcount: string;
        fretcount: string;
        basefret: string;
        barsstates: string;
    };
}

export interface Fret {
    node: "fret";
    attrs: {
        string: string;
        fret: string;
    };
}

export interface FingeringProperty extends List<Position> {
    node: "fingering";
}

export interface Position {
    node: "position";
    attrs: {
        finger: Finger;
        fret: string;
        string: string;
    };
}

export interface DiagramProperty {
    node: "property";
    attrs: {
        name: string;
        type: string;
        value: string;
    };
}

///

export interface Chord extends List<KeyNote|BassNote|Degree> {}

export interface KeyNote {
    node: "keynote";
    attrs: {
        step: Step;
        accidental: Accidental;
    };
}

export interface BassNote {
    node: "bassnote";
    attrs: {
        step: Step;
        accidental: Accidental;
    };
}

export interface Degree {
    node: "degree";
    attrs: {
        interval: Interval;
        alteration: Alteration;
        omitted: BooleanString;
    };
}
