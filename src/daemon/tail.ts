const {promises: {open}} = require("electron").remote.require("fs");

// Opens a file, seeks to the end, and then yields on each new line.
export default async function* tail(file: string): AsyncIterable<string> {
    let fd;
    let i = 0;
    while (true) {
        try {
            fd = await open(file, "r");
        } catch (e) {
            if (e?.code != 'ENOENT') {
                console.error(`Error opening ${file}: ${e.message}`);
            } else if (i++ % 100 == 0) {
                console.warn(`Still waiting to open ${file}...`);
            }
            await new Promise(r => setTimeout(r, 500));
            continue;
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