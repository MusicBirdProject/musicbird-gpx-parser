import { Property, XProperty } from '../common';

export type NoteProperty = MidiProperty
    | ShowStringNumberProperty
    | LeftHandTappedProperty
    | TappedProperty
    | OctaveProperty
    | ToneProperty
    | VariationProperty
    | ElementProperty
    | BendedProperty
    | BendValueProperty
    | SlideProperty
    | PalmMutedProperty
    | MutedProperty
    | HopoDestinationProperty
    | HopoOriginProperty
    | HarmonicTypeProperty
    | HarmonicFretProperty
    | FretProperty
    | StringProperty;

export type NoteXProperty = XProperty<string>;

///

export enum NotePropertyType {
    String = 'String',
    Fret = 'Fret',
    HarmonicType = 'HarmonicType',
    HarmonicFret = 'HarmonicFret',
    Muted = 'Muted',
    PalmMuted = 'PalmMuted',
    Slide = 'Slide',
    HopoOrigin = 'HopoOrigin',
    HopoDestination = 'HopoDestination',
    Bended = 'Bended',
    BendOriginValue = 'BendOriginValue',
    BendOriginOffset = 'BendOriginOffset',
    BendDestinationValue = 'BendDestinationValue',
    BendMiddleOffset1 = 'BendMiddleOffset1',
    BendMiddleOffset2 = 'BendMiddleOffset2',
    BendMiddleValue = 'BendMiddleValue',
    Element = 'Element',
    Variation = 'Variation',
    Tone = 'Tone',
    Octave = 'Octave',
    Tapped = 'Tapped',
    LeftHandTapped = 'LeftHandTapped',
    Midi = 'Midi',
    ShowStringNumber = 'ShowStringNumber'
}

export const NoteXPropertyNames = {
    688062467: 'TrillSpeed'
};

/* Properties */

export interface StringProperty extends Property<'String'> {
    string: string;
}

export interface FretProperty extends Property<'Fret'> {
    fret: string;
}

export interface HarmonicTypeProperty extends Property<'HarmonicType'> {
    htype: HarmonicType;
}

export interface HarmonicFretProperty extends Property<'HarmonicFret'> {
    hfret: string;
}

export interface HopoOriginProperty extends Property<'HopoOrigin'>{
    enable: boolean;
}

export interface HopoDestinationProperty extends Property<'HopoDestination'>{
    enable: boolean;
}

export interface MutedProperty extends Property<'Muted'>{
    enable: boolean;
}

export interface PalmMutedProperty extends Property<'PalmMuted'>{
    enable: boolean;
}

export interface SlideProperty extends Property<'Slide'>{
    flags: string;
}

export interface BendedProperty extends Property<'Bended'>{
    enable: boolean;
}

export interface BendValueProperty extends Property<'BendOriginValue'
    |'BendDestinationValue'
    |'BendOriginOffset'
    |'BendMiddleOffset1'
    |'BendMiddleOffset2'
    |'BendMiddleValue'> {
    float: string;
}

export interface ElementProperty extends Property<'Element'>{
    element: string;
}

export interface VariationProperty extends Property<'Variation'>{
    variation: string;
}

export interface ToneProperty extends Property<'Tone'>{
    step: string;
}

export interface OctaveProperty extends Property<'Octave'>{
    number: string;
}

export interface TappedProperty extends Property<'Tapped'>{
    enable: boolean;
}

export interface LeftHandTappedProperty extends Property<'LeftHandTapped'>{
    enable: boolean;
}

export interface ShowStringNumberProperty extends Property<'ShowStringNumber'>{
    enable: boolean;
}

export interface MidiProperty extends Property<'Midi'>{
    number: string;
}

///

export enum HarmonicType {
    Natural = 'natural',
    Pinch = 'pinch',
    Artificial = 'artificial',
    Tap = 'tap',
    Semi = 'semi',
    Feedback = 'feedback'
}

export enum SlideFlags {
    ShiftSlide = 1 << 0,
    LegatoSlide = 1 << 1,
    SlideOutDownwards = 1 << 2,
    SlideOutUpwards = 1 << 3,
    SlideInFromBelow = 1 << 4,
    SlideInFromAbove = 1 << 5,
    PickScrapeOutDownwards = 1 << 6,
    PickScrapeOutUpwards = 1 << 7
}
