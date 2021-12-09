import { Property, XProperty, UpDown, Vibrato } from '../common';

export type BeatProperty = RasgueadoProperty
    | PoppedProperty
    | SlappedProperty
    | PickStrokeProperty
    | BrushProperty
    | VibratoWTremBarProperty
    | WhammyBarProperty
    | WhammyBarValue
    | WhammyBarExtendProperty
    | BarreFretProperty
    | BarreStringProperty;

export type BeatXProperty = XProperty<string>;

export enum XProperties {
    BrushDuration = '687935489',
    BrushOffset = '687935490'
}

export const BeatXPropertyNames = {
    687935489: 'BrushDuration',
    687935490: 'BrushOffset',
    687931393: 'ArpeggioDuration',
    687931394: 'ArpeggioOffset',
    1124204545: 'InvertBeams'
};

///

export enum BeatPropertyType {
    Rasgueado = 'Rasgueado',
    Brush = 'Brush',
    VibratoWTremBar = 'VibratoWTremBar',
    WhammyBar = 'WhammyBar',
    WhammyBarOriginValue = 'WhammyBarOriginValue',
    WhammyBarMiddleValue = 'WhammyBarMiddleValue',
    WhammyBarDestinationValue = 'WhammyBarDestinationValue',
    WhammyBarMiddleOffset1 = 'WhammyBarMiddleOffset1',
    WhammyBarMiddleOffset2 = 'WhammyBarMiddleOffset2',
    WhammyBarDestinationOffset = 'WhammyBarDestinationOffset',
    WhammyBarExtend = 'WhammyBarExtend',
    Popped = 'Popped',
    Slapped = 'Slapped',
    PickStroke = 'PickStroke',
    BarreFret = 'BarreFret',
    BarreString = 'BarreString'
}

/* Properties */

export interface RasgueadoProperty extends Property<'Rasgueado'> {
    rasgueado: RasgueadoPatterns;
}

export interface BrushProperty extends Property<'Brush'> {
    direction: UpDown;
}

export interface VibratoWTremBarProperty extends Property<'VibratoWTremBar'> {
    strength: Vibrato;
}

export interface WhammyBarProperty extends Property<'WhammyBar'> {
    enable: boolean;
}

export interface WhammyBarValue extends Property<'WhammyBarOriginValue'
        |'WhammyBarMiddleValue'
        |'WhammyBarDestinationValue'
        |'WhammyBarMiddleOffset1'
        |'WhammyBarMiddleOffset2'
        |'WhammyBarDestinationOffset'> {
    float: string;
}

export interface WhammyBarExtendProperty extends Property<'WhammyBarExtend'> {
    enable: boolean;
}

export interface PoppedProperty extends Property<'Popped'> {
    enable: boolean;
}

export interface SlappedProperty extends Property<'Slapped'> {
    enable: boolean;
}

export interface PickStrokeProperty extends Property<'PickStroke'> {
    direction: UpDown;
}

export interface BarreFretProperty extends Property<'BarreFret'> {
    fret: string;
}

export interface BarreStringProperty extends Property<'BarreString'> {
    string: string;
}

///

export enum RasgueadoPatterns {
    ii = 'ii_1',
    mi = 'mi_1',
    mii_triplet = 'mii_1',
    mii_anapaest = 'mii_2',
    pmp_triplet = 'pmp_1',
    pmp_anapaest = 'pmp_2',
    pei_triplet = 'pei_1',
    pei_anapaest = 'pei_2',
    pai_triplet = 'pai_1',
    pai_anapaest = 'pai_2',
    ami_triplet = 'ami_1',
    ami_anapaest = 'ami_2',
    ppp = 'ppp_1',
    amii = 'amii_1',
    amip = 'amip_1',
    eami = 'eami_1',
    eamii = 'eamii_1',
    peami = 'peami_1'
}
