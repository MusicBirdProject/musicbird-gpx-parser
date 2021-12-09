import { List } from './common';
import { Score } from './score';
import { MasterTrack } from './master-track';
import { MasterBar } from './master-bar';
import { Track } from './track';
import { Bar } from './bar';
import { Voice, Beat, Note, Rhythm } from './music-data';

export interface Gpif {
    gprevision: string;
    score: Score;
    mastertrack: MasterTrack;
    masterbars: List<MasterBar>;
    tracks: List<Track>;
    bars: List<Bar>;
    voices: List<Voice>;
    beats: List<Beat>;
    notes: List<Note>;
    rhythms: List<Rhythm>;
}

export interface GPXRoot {
    gpif: Gpif;
    xml?: any;
}
