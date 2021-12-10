import fs from 'fs';
import path from 'path';

///

export function loadBinary(filePath: string): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        fs.readFile(filePath, (error, data) => {
            if (error) return reject(error);
            resolve(data);
        });
    });
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
