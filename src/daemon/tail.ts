const {promises: {open}} = require("electron").remote.require("fs");

// Opens a file, seeks to the end, and then yields on each new line.
export default async function* tail(file: string): AsyncIterable<string> {
    let fd;
    while (true) {
        try {
            fd = await open(file, "r");
        } catch (e) {
            if (e?.code == 'ENOENT') {
                await new Promise(r => setTimeout(r, 500));
                continue;
            }
            throw e;
        }

        // Seek to the end of the file.
        await fd.readFile();
        break;
    }

    let buffer = '';
    while (true) {
        buffer += (await fd.readFile()).toString();
        const parts = buffer.split("\n");
        if (buffer.endsWith("\n")) buffer = '';
        else buffer = parts.pop();

        for (const part of parts) {
            if (part) yield part;
        }

        await new Promise(r => setTimeout(r, 500));
    }
}