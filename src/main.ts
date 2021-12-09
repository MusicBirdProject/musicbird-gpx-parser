import { parseXml } from '@musicbird/xml-parser';
import { decode, ParsedData, FileTypes } from './decoder';
import { gpifReducer } from './reducers';
import { GPXRoot } from './types';

export * from './types';

///

export function parseGpx(blob): GPXRoot {
    const internalFiles: ParsedData = decode(blob);
    const mainFile = internalFiles[FileTypes.ScoreGpif];
    const xmlTree = parseXml(mainFile, {
        lowerCaseTagsNames: true
    });

    return {
        gpif: gpifReducer(xmlTree),
        xml: {
            gpif: mainFile
        }
    };
}
