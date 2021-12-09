import { List, BooleanString } from './common';

export interface MasterBar {
    node: "masterbar";
    key?: Key;
    time?: string; // 4/4
    freetime?: boolean;
    doublebar?: boolean;
    section?: Section;
    repeat?: Repeat;
    fermatas?: List<Fermata>
    directions?: List<DirectionTargetItem | DirectionJumpItem>;
    alternateendings?: string; // numbers string
    tripletfeel?: TripletFeel;
    bars: string;
}

export interface Key {
    accidentalcount: string; // -7..7
    mode: KeyModes;
}

export interface Section {
    letter?: string;
    text?: string;
}

export interface Repeat {
    attrs: {
        start: BooleanString;
        end: BooleanString;
        count: string;
    }
}

export interface Fermata {
    node: "fermata";
    type: FermataType;
    offset: string;
    length: string; // 0..1
}

export interface DirectionTargetItem {
    node: "target";
    value: MusicalDirectionTarget;
}

export interface DirectionJumpItem {
    node: "jump";
    value: MusicalDirectionJump;
}

///

export enum FermataType {
    Short = "short",
    Medium = "medium",
    Long = "long"
}

export enum MusicalDirectionTarget {
    Coda = 'coda',
    DoubleCoda = 'doublecoda',
    Segno = 'segno',
    SegnoSegno = 'segnosegno',
    Fine = 'fine'
}

export enum MusicalDirectionJump {
    DaCapo = 'dacapo',
    DaCapoAlCoda = 'dacapoalcoda',
    DaCapoAlDoubleCoda = 'dacapoaldoublecoda',
    DaCapoAlFine = 'dacapoalfine',
    DaSegno = 'dasegno',
    DaSegnoAlCoda = 'dasegnoalcoda',
    DaSegnoAlDoubleCoda = 'dasegnoaldoublecoda',
    DaSegnoAlFine = 'dasegnoalfine',
    DaSegnoSegno = 'dasegnosegno',
    DaSegnoSegnoAlCoda = 'dasegnosegnoalcoda',
    DaSegnoSegnoAlDoubleCoda = 'dasegnosegnoaldoublecoda',
    DaSegnoSegnoAlFine = 'dasegnosegnoalfine',
    DaCoda = 'dacoda',
    DaDoubleCoda = 'dadoublecoda'
}

export enum KeyModes {
    Minor = 'minor',
    Major = 'major'
}

export enum TripletFeel {
    Triplet8th = 'triplet8th',
    Triplet16th = 'triplet16th',
    Dotted8th = 'dotted8th',
    Dotted16th = 'dotted16th',
    Scottish8th = 'scottish8th',
    Scottish16th = 'scottish16th'
}
