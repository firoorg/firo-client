import fs from "fs";
import { join } from 'path';
import { getApp } from 'lib/utils';

class TIR {
    constructor(name) {
        this.name = name;
    }

    getFilePath() {
        let path;

        if (process.env.ZCOIN_CLIENT_TEST) {
            path = join(process.cwd(), this.name + '-test.json');
        } else {
            path = join(getApp().getPath('userData'), this.name + '.json');
        }

        return path;
    }

    readFile() {
        let json = {};

        try {
            json = JSON.parse(fs.readFileSync(this.getFilePath()));
        } catch(e) {
            console.log(`readFile ${this.name}: ${e.message}`);
        }

        return json;
    }

    writeFile(obj = {}) {
        let str = "{}";

        try {
            str = JSON.stringify(obj);
        } catch (e) {
            console.log(`writeFile ${this.name}: ${e.message}`);
        }

        return fs.writeFileSync(this.getFilePath(), str);
    }
}

export default TIR;