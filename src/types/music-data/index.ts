export * from './beat';
export * from './beat-properties';
export * from './note';

export interface Voice {
    node: "voice";
    beats: string;
    attrs: {
        id: string;
    };
}

export interface Rhythm {
    node: "rhythm";
    notevalue: Duration;
    primarytuplet: PrimaryTuplet;
    augmentationdot: AugmentationDot;
    attrs: {
        id: string;
    };
}

export interface PrimaryTuplet {
    attrs: {
        num: string;
        den: string;
    };
}

export interface AugmentationDot {
    attrs: {
        count: string;
    };
}

export enum Duration {
    Whole = 'whole',
    Half = 'half',
    Quarter = 'quarter',
    Eighth = 'eighth',
    One16th = '16th',
    One32nd = '32nd',
    One64th = '64th',
    One128th = '128th'
}
