const jDataView = require('jdataview');
import { readBitsReversed, getString } from './helpers';

///

export enum FileTypes {
    MiscXml = "misc.xml",
    ScoreGpif = "score.gpif"
}

export interface ParsedData {
    [key: string]: string;
}

export interface InternalFile {
    name: string;
    size: number;
    data?: any;
}

///

export function decode(blob): ParsedData {
    const bin = new jDataView(blob, 0, blob.length, true);
    const files: InternalFile[] = handleBlock(bin);

    return files
        .filter(isFileToStore)
        .map(mapFile)
        .reduce((files, file) => (files[file.name] = file.data, files), {});

    ///

    function mapFile(file: InternalFile): InternalFile {
        switch (file.name) {
            case 'score.gpif':
            case 'misc.xml':
                if (!file.data) {
                    return file;
                }

                file.data = file.data.getString(file.data.byteLength, 0, 'utf-8');
        }

        return file;
    }
}

///

function handleBlock(bin): InternalFile[] {
    const header = bin.getString(4);

    switch(header) {
        case "BCFZ":
            return parseBlock(decompressBlock(bin, true));

        case "BCFS":
            return parseBlock(bin);

        default:
            throw `Bad Header: ${header} (unsupported format)`;
    }
}

function parseBlock(bin): InternalFile[] {
    const SECTOR_SIZE = 0x1000;

    let offset = SECTOR_SIZE;
    let files: InternalFile[] = [];

    while (offset + SECTOR_SIZE + 3 < bin.byteLength) {
        const entryType = bin.getUint32(offset, true);

        if (entryType == 2) {
            const file: InternalFile = {
                name: getString(bin, offset + 0x04, 127),
                size: bin.getUint32(offset + 0x8C, true)
            };

            files.push(file);

            ///

            const isStoreFile = isFileToStore(file);
            const blocksOffset = offset + 0x94;

            let dataBlocks: Array<typeof jDataView> = [];
            let blockCount = 0;
            let blockId = 0;

            while ((blockId = bin.getUint32(blocksOffset + 4 * blockCount, true)) != 0) {
                offset = blockId * SECTOR_SIZE;

                if (isStoreFile) {
                    const max = offset + SECTOR_SIZE;
                    const blockSize = max > bin.byteLength
                        ? SECTOR_SIZE - (max - bin.byteLength)
                        : SECTOR_SIZE;

                    dataBlocks.push(bin.getBytes(blockSize, offset));
                }

                blockCount++;
            }

            if (isStoreFile) {
                const fileDataSize = dataBlocks.reduce((size, block) => size += block.length, 0);
                const buffer = new jDataView(Math.max(file.size, fileDataSize));

                dataBlocks
                    .forEach(block => buffer.writeBytes(block));

                file.data = new jDataView(Math.min(file.size, fileDataSize));
                file.data.writeBytes(buffer.getBytes(file.data.byteLength, 0));
            }
        }

        offset += SECTOR_SIZE;
    }

    return files;
}

function decompressBlock(bin, isSkipHeader: boolean = false) {
    const expectedLength = bin.getUint32();
    const temp = new jDataView(expectedLength);
    let pos = 0;

    try {
        while(pos < expectedLength) {
            const flag = bin.getUnsigned(1);

            if (flag == 1) {
                const wordSize = bin.getUnsigned(4);
                const offset = readBitsReversed(bin, wordSize);
                const size = readBitsReversed(bin, wordSize);

                const sourcePosition = pos - offset;
                const readSize = Math.min(offset, size);

                const copy = temp.slice(sourcePosition, sourcePosition + readSize, false);
                temp.writeBytes(copy.getBytes(copy.byteLength, 0), pos);

                pos += copy.byteLength;

            } else {
                const size = readBitsReversed(bin, 2);

                for (let i = 0; i < size; i++){
                    temp.writeUint8(bin.getUnsigned(8), pos++);
                }
            }
        }

    } catch (e) {
        console.error('End of Block Exception', e);
    }

    const resultOffset = isSkipHeader ? 4 : 0;
    const resultSize = temp.byteLength - resultOffset;

    return temp.slice(resultOffset, resultSize, false);
}

///

function isFileToStore(file: InternalFile): boolean {
    switch (file.name) {
        case 'score.gpif':
        case 'misc.xml':
            return true;

        default:
            return false;
    }
}
