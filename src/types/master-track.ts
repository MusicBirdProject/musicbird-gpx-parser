import { List, Automation, AutomationTypes, Effect } from './common';

export interface MasterTrack {
    tracks: string;
    anacrusis?: boolean;
    automations?: List<Automation<MTAutomationTypes>>;
    rse?: MasterTrackRse;
}

export interface MasterTrackRse {
    master: List<Effect<MTEffects>>;
}

///

export enum MTAutomationTypes {
    Tempo = 'tempo'
}

export enum MTEffects {
    VolumeAndPan = 'I01_VolumeAndPan',
    GraphicEQ10Band = 'M08_GraphicEQ10Band',
    DynamicAnalogDynamic = 'M06_DynamicAnalogDynamic',
    
    // Reverb:
    StudioReverbHallConcertHall = 'M01_StudioReverbHallConcertHall',
    StudioReverbHallSmallTheater = 'M02_StudioReverbHallSmallTheater',
    StudioReverbRoomStudioA = 'M03_StudioReverbRoomStudioA',
    StudioReverbRoomAmbience = 'M04_StudioReverbRoomAmbience',
    StudioReverbPlatePercussive = 'M05_StudioReverbPlatePercussive'
}
