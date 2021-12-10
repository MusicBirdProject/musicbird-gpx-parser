import { BooleanString, List, Ottavia, UpDown } from '../common';
import { BeatProperty, BeatXProperty } from './beat-properties';

export interface Beat {
    node: 'beat';
    freetext: string;
    dynamic: Dynamic;
    ottavia: Ottavia;
    hairpin: Hairpin;
    arpeggio: UpDown;
    fadding: Fadding;
    tremolo: Tremolo;
    wah: WahStatus;
    rhythm: RhythmLink;
    legato: Legato;
    gracenotes: GracePosition;
    slashed: boolean;
    bank: string;
    variation: string;
    timer: string;
    chord: string;
    notes: string;
    properties: List<BeatProperty>;
    xproperties: List<BeatXProperty>;
    attrs: {
        id: string;
    };
}

export interface Legato {
    attrs:  {
        origin: BooleanString;
        destination: BooleanString;
    };
}

export interface RhythmLink {
    attrs:  {
        ref: string;
    };
}

///

export enum Dynamic {
    ppp = 'ppp',
    pp = 'pp',
    p = 'p',
    mp = 'mp',
    mf = 'mf',
    f = 'f',
    ff = 'ff',
    fff = 'fff'
}

export enum Hairpin {
    Crescendo = 'crescendo',
    Decrescendo = 'decrescendo'
}

export enum Tremolo {
    One32nd = '1/8',
    One16th = '1/4',
    One8th = '1/2'
}

export enum WahStatus {
    Open = 'open',
    Close = 'close'
}

export enum GracePosition {
    BeforeBeat = 'beforebeat',
    OnBeat = 'onbeat'
}

export enum Fadding {
    FadeIn = 'fadein',
    FadeOut = 'fadeout',
    VolumeSwell = 'volumeswell'
}
