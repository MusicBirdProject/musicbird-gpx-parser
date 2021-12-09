import rootSchema from './schemas/gpx-root.yml';
import gpifSchema from './schemas/gpif.yml';
import commonSchema from './schemas/gpif/common.yml';
import propsSchema from './schemas/gpif/props.yml';

import scoreSchema from './schemas/gpif/summary/score.yml';
import rseSchema from './schemas/gpif/summary/rse.yml';
import chordCollectionSchema from './schemas/gpif/summary/chords/chord-collection.yml';
import diagramCollectionSchema from './schemas/gpif/summary/chords/diagram-collection.yml';
import masterTrackSchema from './schemas/gpif/summary/master-track.yml';
import masterBarSchema from './schemas/gpif/summary/master-bar.yml';
import trackSchema from './schemas/gpif/summary/track.yml';
import trackPropertySchema from './schemas/gpif/summary/track-property.yml';

import barSchema from './schemas/gpif/music-data/bar.yml';
import beatSchema from './schemas/gpif/music-data/beat.yml';
import beatPropertySchema from './schemas/gpif/music-data/beat-property.yml';
import voiceSchema from './schemas/gpif/music-data/voice.yml';
import noteSchema from './schemas/gpif/music-data/note.yml';
import notePropertySchema from './schemas/gpif/music-data/note-property.yml';
import rhythmSchema from './schemas/gpif/music-data/rhythm.yml';

import itemsCountKeyword from './keywords/items-count';
import numbersStringKeyword from './keywords/numbers-string';
import typecastKeyword from './keywords/typecast';

///

const Ajv = require('ajv');
export const ajv = new Ajv({
    v5: true,
    allErrors: true,
    verbose: true,
    $data: true
});

require('ajv-keywords')(ajv, 'select');

const schemas = [
    rootSchema,
    gpifSchema,
    commonSchema,
    propsSchema,
    rseSchema,
    scoreSchema,
    chordCollectionSchema,
    diagramCollectionSchema,
    masterTrackSchema,
    masterBarSchema,
    trackPropertySchema,
    trackSchema,
    barSchema,
    beatPropertySchema,
    beatSchema,
    voiceSchema,
    noteSchema,
    notePropertySchema,
    rhythmSchema
];

ajv.addSchema(schemas);
ajv.addKeyword('itemsCount', itemsCountKeyword);
ajv.addKeyword('numbersString', numbersStringKeyword);
ajv.addKeyword('typecast', typecastKeyword);
