#!/usr/bin/env node
const fs = require("node:fs")
const os = require("node:os")
const path = require('path');

const APP_DIR = process.env.LOG_HOME || path.join(os.homedir(), ".log-cli");
const CONFIG_PATH = path.join(APP_DIR, "config.json");

if (!fs.existsSync(CONFIG_PATH)) {
    console.error("config.json not found. Please run 'log init'.");
    process.exit(1);
}

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));


function timeSince(date) {
    date = new Date(Date.now() - date);
    var seconds = Math.floor((new Date() - date) / 1000);

    var interval = seconds / 31536000;

    if (interval > 1) {
        return Math.floor(interval) + " years";
    }
    interval = seconds / 2592000;
    if (interval > 1) {
        return Math.floor(interval) + " months";
    }
    interval = seconds / 86400;
    if (interval > 1) {
        return Math.floor(interval) + " days";
    }
    interval = seconds / 3600;
    if (interval > 1) {
        return Math.floor(interval) + " hours";
    }
    interval = seconds / 60;
    if (interval > 1) {
        return Math.floor(interval) + " minutes";
    }
    return Math.floor(seconds) + " seconds";
}


let jsondata = []
const foldername = config.fileinfo.database_folder || "data";
const dataFolderPath = path.join(APP_DIR, foldername);
const datalocation = path.join(dataFolderPath, `${config.fileinfo.database_file}.${config.fileinfo.database_file_extension}`);

const writeJsonData = () => {
    fs.writeFileSync(datalocation, JSON.stringify(jsondata, null, 2));
}

const check = () => {
    fs.mkdirSync(dataFolderPath, { recursive: true });

    if (!fs.existsSync(datalocation)) {
        fs.writeFileSync(datalocation, "[]\n");
        jsondata = [];
        return;
    }

    try {
        const file = fs.readFileSync(datalocation, "utf8").trim();
        jsondata = file ? JSON.parse(file) : [];
        if (!Array.isArray(jsondata)) {
            jsondata = [];
        }
    } catch (e) {
        jsondata = [];
    }
}
check()

const set = (data) => {
    jsondata.push(data);
    try {
        writeJsonData();
    } catch (error) {
        console.error("Failed to write to database file:", error);
        return null;
    }
    return data.id
}

const get = (query) => {
    if (jsondata.length === 0) {
        return [];
    }

    if (query === "") {
        return jsondata;
    }

    if (query === "today") {
        console.log(jsondata.map(i => timeSince(new Date(Date.now() - parseInt(i.id, 36)))));
    }

    return jsondata;
}

// Helper to reduce repetition
const updateItemById = (id, updateFn) => {
    const itemIndex = jsondata.findIndex(item => item.id === id);
    if (itemIndex === -1) {
        console.log("Item with given ID not found.");
        return null;
    }
    updateFn(jsondata[itemIndex]);
    writeJsonData();
    return id;
}

const del = (id) => {
    return updateItemById(id, (item) => {
        item.deleted = true;
        item.lastupdated = Date.now().toString(36);
    });
}

const search = (query) => {
    if (jsondata.length === 0) {
        return []
    }

    const normalizedQuery = (query || []).map(str => String(str).toUpperCase());
    const result = [];

    jsondata.forEach((item) => {
        const titleTokens = String(item.title || "").toUpperCase().split(/(\s+)/).filter(e => e.trim().length > 0);
        const bodyTokens = String(item.body || "").toUpperCase().split(/(\s+)/).filter(e => e.trim().length > 0);
        const categoryTokens = Array.isArray(item.category) ? item.category.map(str => String(str).toUpperCase()) : [];
        const itemId = String(item.id || "").toUpperCase();

        const matchesToken = (token, term) => token.includes(term) || token.startsWith(term);

        const hasMatch = normalizedQuery.some((term) => {
            if (!term) return false;
            if (itemId === term) return true;
            if (titleTokens.some(token => matchesToken(token, term))) return true;
            if (bodyTokens.some(token => matchesToken(token, term))) return true;
            return categoryTokens.some(token => matchesToken(token, term));
        });

        if (hasMatch) {
            result.push(item);
        }
    });

    return [...new Set(result)]
}

const update = (uid, utitle, ubody, ucatarr) => {
    // console.log(id, log, pass, fav, deleted, query)
    let updatereturnid;
    if (jsondata.length > 0) {
        jsondata.map((i) => {
            if (i.id === uid) {
                updatereturnid = i.id
                if (utitle) {
                    i.title = utitle
                }
                if (ubody) {
                    i.body = ubody
                }
                if (ucatarr) {
                    i.category = ucatarr
                }
                i.lastupdated = Date.now().toString(36);
            }
        })
        writeJsonData();
        return updatereturnid;
    } else {
        return []
    }
}

const list = () => {
    let arr = []
    if (jsondata.length > 0) {
        jsondata.map((i) => {
            arr.push(i.id)
        })
        return arr;
    } else {
        return []
    }
}

const append = ({ appendid, appendtitle, appendbody, appendcategory }) => {
    let id = ''
    if (jsondata.length > 0) {
        jsondata.map((i) => {
            if (i.id === appendid) {
                i.title += appendtitle
                i.body += appendbody
                appendcategory.map((j) => {
                    i.category.push(j)
                })
                i.lastupdated = Date.now().toString(36);
                id = i.id
                writeJsonData();
            }
        })
        return id;
    }
    return [];
}

const mkhide = (id) => {
    return updateItemById(id, item => { item.hidden = true; });
}

const unhide = (id) => {
    return updateItemById(id, item => { item.hidden = false; });
}

const mkfav = (id) => {
    return updateItemById(id, item => { item.fav = true; });
}

const rmfav = (id) => {
    return updateItemById(id, item => { item.fav = false; });
}

const restore = (id) => {
    return updateItemById(id, item => { item.deleted = false; });
}

// const migrate = () => {
//     if (jsondata.length > 0) {
//         writeFile()
//     } else {
//         console.log("Data not found")
//     }
// }
const backup = () => {
    if (jsondata.length > 0) {
        const sourceFilePath = datalocation;
        const backupFolderPath = path.join(APP_DIR, 'backup');
        const backupFilePath = path.join(backupFolderPath, 'backup.json');
        if (!fs.existsSync(backupFolderPath)) {
            fs.mkdirSync(backupFolderPath);
        }
        fs.copyFileSync(sourceFilePath, backupFilePath);
        return "Backup successful"
    } else {
        console.log("Data not found")
    }
}

module.exports = {
    set,
    get,
    del,
    search,
    update,
    list,
    append,
    mkhide,
    unhide,
    mkfav,
    rmfav,
    restore,
    backup,
}
