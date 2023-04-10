import { existsSync, readFileSync, writeFile } from "fs";
import { join } from "path";
import { color } from "./functions";

const saveLocation = join(__dirname, "../../lib/saves/");

export function saveFile<T extends object>(file: string, data: T) {
    const filePath = join(saveLocation, file);
    const dataString = JSON.stringify(data);
    writeFile(filePath, dataString, (err) => {
        if (err) throw err;
    });
}

export function loadFile<T extends object>(file: string, data: T) {
    const filePath = join(saveLocation, file);
    if (existsSync(filePath)) {
        const dataString = readFileSync(filePath, "utf8");
        const dataJson = JSON.parse(dataString) as T;

        Object.assign(data, dataJson);
        console.log(color("text", `📝 Successfully loaded save ${color("variable", file)}`));
    } else {
        console.error(`[loadFile] Cannot find directory "${filePath}"`);
    }
}