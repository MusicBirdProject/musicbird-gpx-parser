import fs from 'fs';
import path from 'path';

const jBinary = require('jbinary');
const commonTypes = {
    'jBinary.littleEndian': true
};

///

export function loadBinary(file): Promise<any> {
    return jBinary.load(file, commonTypes)
        .then(binary => binary.read('blob'));
}

export function saveToFile(fileName, rawData, isJson = false): void {
    const data = !isJson
        ? rawData
        : JSON.stringify(rawData, null, ' ');

    fs.writeFileSync(fileName, data);
}

export function loadFile(fileName, isJson = false): any {
    const data = fs.readFileSync(fileName).toString();

    return isJson
        ? JSON.parse(data)
        : data;
}

export function logError(sourceFile, logFile, error: any = {}) {
    let content = `${sourceFile}:\n`;

    content += JSON.stringify(error, null, ' ') + '\n\n';

    fs.appendFileSync(logFile, content);
}

export function logCheckResult(success: boolean, sourceFile, logFile, data: any = {}) {
    const resSym = success ? '+' : '-';
    const line = `${resSym} ${sourceFile}`;

    console.log(line);

    if (!logFile) {
        return;
    }

    fs.appendFileSync(logFile, `${line}\n`);
}

export function walkSync(dir, filelist: string[] = []) {
    fs.readdirSync(dir).forEach(file => {
        filelist = fs.statSync(path.join(dir, file)).isDirectory()
            ? walkSync(path.join(dir, file), filelist)
            : filelist.concat(path.join(dir, file));

    });

    return filelist;
}
