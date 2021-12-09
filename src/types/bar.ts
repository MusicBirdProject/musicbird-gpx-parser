import { Ottavia, XProperty, List } from './common';

export interface Bar {
    node: "bar";
    clef: Clef;
    ottavia: Ottavia;
    similemark: SimileMark;
    voices: string;
    xproperties: List<XProperty<string>>;
    attrs: {
        id: string;
    };
}

export enum Clef {
    Neutral = 'neutral',
    G2 = 'g2',
    C3 = 'c3',
    C4 = 'c4',
    F4 = 'f4'
}

export enum SimileMark {
    Simple = 'simple',
    FirstOfDouble = 'firstofdouble',
    SecondOfDouble = 'secondofdouble'
}
