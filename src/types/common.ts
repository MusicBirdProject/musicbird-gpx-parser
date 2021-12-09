export interface List<T> {
    items: T[];
}

export interface Property<T> {
    node: "property";
    attrs: {
        name: T;
    };
}

export interface XProperty<T> {
    node: "xproperty";
    int?: string;
    float?: string;
    double?: string;
    attrs: {
        id: T;
    };
}

export interface Effect<T> {
    node: "effect";
    parameters?: string;
    bypass?: boolean;
    bypassedautomations?: string;
    automations?: List<Automation<AutomationTypes>>;
    attrs?: {
        id: T;
    };
}

export interface Automation<T> {
    node: "automation";
    attrs?: {
        id: string;
    };
    type: T;
    bar?: string;
    position: string;
    parameters: string;
    value: string;
    text?: string;
    visible?: BooleanString;
    linear?: BooleanString;
}

// Lyrics

export interface Lyrics extends List<LyricsLine> {
    attrs: {
        dispatched: BooleanString;
    };
}

export interface LyricsLine {
    node: "line";
    offset: string;
    text: string;
}

///

export enum AutomationTypes {
    MasterVolume = 'dspparam_00',
    MasterPan = 'dspparam_01'
}

export enum BooleanString {
    True = 'true',
    False = 'false'
}

export enum Finger {
    None = 'None',
    Thumb = 'Thumb',
    Index = 'Index',
    Middle = 'Middle',
    Ring = 'Ring',
    Pinky = 'Pinky'
}

export enum Accidental {
    Natural = 'natural',
    Flat = 'flat',
    Sharp = 'sharp',
    DoubleSharp = 'doublesharp',
    DoubleFlat = 'doubleflat'
}

export enum Step {
    C = 'C',
    D = 'D',
    E = 'E',
    F = 'F',
    G = 'G',
    A = 'A',
    B = 'B'
}

export enum Interval {
    Second = 'Second',
    Third = 'Third',
    Fourth = 'Fourth',
    Fifth = 'Fifth',
    Sixth = 'Sixth',
    Seventh = 'Seventh',
    Eighth = 'Eighth',
    Ninth = 'Ninth',
    Eleventh = 'Eleventh',
    Thirteenth = 'Thirteenth'
}

export enum Alteration {
    Minor = 'Minor',
    Perfect = 'Perfect',
    Major = 'Major',
    Diminished = 'Diminished',
    Augmented = 'Augmented'
}

export enum Ottavia {
    OttavaAlta = '8va', // play this an octave higher than written
    Quindicesima = '15ma', // play two octaves higher than written
    OttavaBassa = '8vb', // ottava bassa or ottava sotta
    QuindicesimaBassa = '15mb' // play two octaves lower than written
}

export enum UpDown {
    Down = 'down',
    Up = 'up'
}

export enum Vibrato {
    Slight = 'slight',
    Wide = 'wide'
}