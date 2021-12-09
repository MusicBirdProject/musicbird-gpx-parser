import { BooleanString, List, Accidental, Vibrato } from '../common';
import { NoteProperty, NoteXProperty } from './note-properties';

export interface Note {
    node: "note";
    tie: Tie;
    letring: boolean;
    vibrato: Vibrato;
    trill: string; // 50..100
    accent: Accentuation;
    ornament: Ornament;
    antiaccent: Antiaccent;
    leftfingering: Fingering;
    rightfingering: Fingering;
    accidental: Accidental;
    properties: List<NoteProperty>;
    xproperties: List<NoteXProperty>;
    attrs: {
        id: string;
    };
}

export interface Tie {
    attrs: {
        origin: BooleanString;
        destination: BooleanString;
    };
}

export enum Ornament {
    UpperMordent = 'uppermordent',
    LowerMordent = 'lowermordent',
    Turn = 'turn',
    InvertedTurn = 'invertedturn'
}

export enum Fingering {
    Open = 'open',
    Thumb = 'p',
    Index = 'i',
    Middle = 'm',
    Ring = 'a',
    Pinky = 'c'
}

export enum Accentuation {
    Staccato = 1,
    Normal = 4,
    Heavy = 8
}

export enum Antiaccent {
    Normal = 'normal'
}
