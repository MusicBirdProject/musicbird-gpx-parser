import { List, Automation, AutomationTypes, Effect, Lyrics, BooleanString } from '../common';
import { Instrument } from './instruments';
import { TrackProperty } from './track-properties';

export interface Track {
    node: "track";
    attrs: {
        id: string;
    };
    name: string;
    shortname: string;
    color?: string;
    instrument?: {
        attrs: {
            ref: Instrument;
        };
    };
    partsounding?: Partsounding;
    generalmidi?: GeneralMidi;
    lyrics?: Lyrics;
    rse?: TrackRse;
    properties?: List<TrackProperty>;
    playbackstate?: PlaybackState;
    palmmute?: string;
    letringthroughout?: boolean;
    autoaccentuation?: string;
    systemsdefautlayout?: string;
    systemslayout?: string;
    playingstyle?: PlayingStyle;
}

export enum PlaybackState {
    Default = "default",
    Mute = "mute",
    Solo = "solo"
}

export enum PlayingStyle {
    Default = 'default',
    StringedFinger = 'stringedfinger',
    StringedFingerPicking = 'stringedfingerpicking',
    StringePick = 'stringedpick',
    DrumkitStick = 'drumkitstick',
    DrumkitBrush = 'drumkitbrush',
    DrumkitHotrod = 'drumkithotrod',
    BassSlap = 'bassslap'
}

export interface Partsounding {
    nominalkey: string;
    transpositionpitch: string;
}

export interface GeneralMidi {
    program: string;
    port: string;
    primarychannel: string;
    secondarychannel: string;
    foreonechannelperstring: BooleanString;
    attrs: {
        table: MidiTables;
    };
}

export enum MidiTables {
    Instrument = 'Instrument',
    Percussion = 'Percussion'
}

/// RSE

export interface TrackRse {
    bank: string;
    channelstrip: Channelstrip;
    effectchains: List<EffectChain>;
    pickups: List<Pickup>;
    bankchanges: List<BankChange>;
}

export interface Channelstrip {
    parameters: string;
    automations: List<Automation<TAutomationTypes>>;
    bypassedautomations: string;
    attrs: {
        version: string;
    };
}

export interface Pickup {
    node: "pickup";
    attrs: {
        id: string;
        volume: string;
        tone: string;
    };
}

export interface BankChange {
    node: "bankchange";
    attrs: {
        barindex: string;
        tickoffset: string;
        bankid: string;
    };
    pickups: List<Pickup>;
}

// Other

export interface EffectChain {
    node: "effectchain";
    name: string;
    rail: Rail;
}

export interface Rail extends List<Effect<TrackEffects>> {
    attrs: {
        name: string;
    };
}

///

export enum TAutomationTypes {
    TrackPan = 'dspparam_11',
    TrackVolume = 'dspparam_12'
}

export enum TrackEffects {
    A01_ComboTop30 = 'A01_ComboTop30',
    A04_ComboEddie = 'A04_ComboEddie',
    A07_StackRecti = 'A07_StackRecti',
    A08_StackModern = 'A08_StackModern',
    A09_StackOverloud = 'A09_StackOverloud',
    A15_LightBassLight = 'A15_LightBassLight',

    E01_OverdriveBlues = 'E01_OverdriveBlues',
    E02_OverdrivePreamp = 'E02_OverdrivePreamp',
    E06_DistortionRat = 'E06_DistortionRat',
    E07_DistortionGrunge = 'E07_DistortionGrunge',
    E12_FuzzFast = 'E12_FuzzFast',
    E14_FuzzBender = 'E14_FuzzBender',
    E15_ChorusEnsemble = 'E15_ChorusEnsemble',
    E17_ChorusBChorus = 'E17_ChorusBChorus',
    E18_FlangerMistress = 'E18_FlangerMistress',
    E20_Phaser90 = 'E20_Phaser90',
    E22_VibratoVibe = 'E22_VibratoVibe',
    E23_TremoloOpto = 'E23_TremoloOpto',
    E28_PitchOctaver = 'E28_PitchOctaver',
    E30_EqGEq = 'E30_EqGEq',
    E31_EqBEq = 'E31_EqBEq',
    E32_EqAcoustic = 'E32_EqAcoustic',
    E33_WahAutoWah = 'E33_WahAutoWah',
    E35_WahBWah = 'E35_WahBWah',
    E36_WahJimi = 'E36_WahJimi',
    E40_Volume = 'E40_Volume',

    M08_GraphicEQ10Band = 'M08_GraphicEQ10Band',
    M09_GraphicEQ15Band = 'M09_GraphicEQ15Band',
    M11_DelayTapeDelay = 'M11_DelayTapeDelay'
}