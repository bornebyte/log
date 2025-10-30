#!/usr/bin/env node
const os = require("node:os")
const fs = require("node:fs")
const path = require("node:path")
const colors = require('ansi-colors');
const CryptoJS = require("crypto-js");
const EventEmitter = require('events');
const event = new EventEmitter();
// const { exec } = require('child_process'); // Unused, can be removed
const { exec } = require('child_process');
const axios = require('axios');

event.on('create-config-file', () => {
    let configinitdata = `
    {
        "userinfo": {
            "username": null,
            "password": "U2FsdGVkX183RPF/Sut7qIfE8znoijXKlQnxzxW4LuM="
        },
        "permissions": {
            "create": true,
            "read": true,
            "update": false,
            "del": false,
            "mkfav": false,
            "unfav": false,
            "mkhide": false,
            "unhide": false
        },
        "fileinfo": {
            "database_file": "data",
            "database_folder": "data",
            "database_file_extension": "json"
        },
        "dbpath": null,
        "admin":{
            "password": "U2FsdGVkX183RPF/Sut7qIfE8znoijXKlQnxzxW4LuM="
        },
        "left":{
            "targetdays": []
        },
        "chat":{
            "serverport": 5000,
            "serverurl" : "https://chatserver.shubham1888.repl.co"
        }
    }
    `
    fs.writeFileSync("./config.json", configinitdata)
    console.log(colors.green("Configuration file 'config.json' created. Please run 'log init' or 'node index.js init' to set it up."));
});


let config = {}
const configPath = path.join(__dirname, 'config.json');

if (!fs.existsSync(configPath)) {
    event.emit('create-config-file');
    process.exit(0); // Exit after creating config, user needs to init
}
config = require(configPath);

let db;
try {
    db = require("./db");
} catch (error) { }

// const argv = process.argv.slice(2);
const argv = process.argv;

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

const printdata = (data) => {
    if (data) {
        data.map((i) => {
            if (!i.deleted) {
                console.log(colors.gray(`[ID]       # ${i.id}`), i.fav ? colors.yellow(' ★') : '')
                console.log(colors.blue(`[Username] # ${i.username}`))
                if (i.hidden) {
                    console.log(colors.red(`[Title]    # Hidden`))
                    console.log(colors.red(`[Body]     # Hidden`))
                }
                else {
                    console.log(colors.green(`[Title]    # ${i.title}`))
                    if (i.type === "" || i.type === "plain") {
                        console.log(colors.yellow(`[Body]     # ${i.body}`))
                    }
                    else if (i.type === "list") {
                        let index = 1;
                        i.listdata.forEach(item => {
                            console.log(colors.yellow(`${index} # ${item}`))
                            index++
                        });
                    }
                    else {
                        console.log(colors.yellow(`[Body]     # ${i.body}`))
                    }
                }
                console.log(colors.cyan(`[Date]     # [${timeSince(new Date(Date.now() - parseInt(i.id, 36)))}] ${new Date(parseInt(i.id, 36)).toString()}`))
                console.log(dash)
            }
        })
    } else {
        console.log([])
    }
}

const showHiddenData = (data) => {
    if (data) {
        data.map((i) => {
            if (!i.deleted) {
                if (i.hidden) {
                    console.log(colors.gray(`[ID]       # ${i.id}`))
                    console.log(colors.blue(`[Username] # ${i.username}`))
                    console.log(colors.green(`[Title]    # ${i.title}`))
                    if (i.type === "" || i.type === "plain") {
                        console.log(colors.red(`[Body]     # ${i.body}`))
                    }
                    else if (i.type === "list") {
                        let index = 1;
                        i.listdata.forEach(item => {
                            console.log(colors.red(`${index} # ${item}`))
                            index++
                        });
                    }
                    else {
                        console.log(colors.red(`[Body]     # ${i.body}`))
                    }
                    console.log(colors.cyan(`[Date]     # [${timeSince(new Date(Date.now() - parseInt(i.id, 36)))}] ${new Date(parseInt(i.id, 36)).toString()}`))
                    console.log(dash)
                }
            }
        })
    } else {
        console.log([])
    }
}

const showFavData = (data) => {
    if (data) {
        data.map((i) => {
            if (!i.deleted) {
                if (i.fav) {
                    console.log(colors.gray(`[ID]       # ${i.id}`))
                    console.log(colors.blue(`[Username] # ${i.username}`))
                    console.log(colors.green(`[Title]    # ${i.title}`))
                    if (i.type === "" || i.type === "plain") {
                        console.log(colors.yellow(`[Body]     # ${i.body}`))
                    }
                    else if (i.type === "list") {
                        let index = 1;
                        i.listdata.forEach(item => {
                            console.log(colors.yellow(`${index} # ${item}`))
                            index++
                        });
                    }
                    else {
                        console.log(colors.yellow(`[Body]     # ${i.body}`))
                    }
                    console.log(colors.cyan(`[Date]     # [${timeSince(new Date(Date.now() - parseInt(i.id, 36)))}] ${new Date(parseInt(i.id, 36)).toString()}`))
                    console.log(dash)
                }
            }
        })
    } else {
        console.log([])
    }
}

// In a real application, this should come from environment variables or a secure store.
// e.g., const CRYPTO_SECRET_KEY = process.env.LOG_CRYPTO_KEY || "default-unsafe-key";
// For this review, we'll keep it but acknowledge it's a security risk.
const CRYPTO_SECRET_KEY = "mycryptopass" 

const encpass = pass => CryptoJS.AES.encrypt(pass, CRYPTO_SECRET_KEY).toString()

const decpass = pass => CryptoJS.AES.decrypt(pass, CRYPTO_SECRET_KEY).toString(CryptoJS.enc.Utf8)

const auth = pass => decpass(config.userinfo.password) === pass;

const authadmin = pass => decpass(config.admin.password) === pass;

const dash = colors.red("--------------------------------------------------------")

// remove extra spaces using regular expression
// const trimmedStr = str.replace(/\s+/g, ' ').trim();

const main = async () => {
    if (argv[2] === "l") {
        if (config.permissions.create === false) {
            console.log(colors.red("Permission denied"))
            process.exit(1)
        }
        let title = require('prompt-sync')()(colors.yellow('Title : '))
        let typeofdata = require('prompt-sync')()(colors.yellow('Type : '))
        let body = ""
        let items = []
        if (typeofdata === "" || typeofdata === "plane") {
            body = require('prompt-sync')()(colors.yellow('Body : '))
        }
        else if (typeofdata === "list") {
            let item = ""
            let index = 1
            do {
                item = require('prompt-sync')()(colors.yellow(`${index}: `))
                items.push(item)
                index++
            } while (item !== null);
            items.pop()
        }
        else {
            console.log(colors.red("Invalid type"))
        }
        let category = require('prompt-sync')()(colors.yellow('Category : '))
        // let tag = require('prompt-sync')()('Tag : ')
        let hidden = require('prompt-sync')()(colors.red('Hidden (True/False) : '))
        category = category.split(/(\s+)/).filter(function (e) { return e.trim().length > 0; });
        if (hidden === "false" || hidden === "f" || hidden === "F" || hidden === "" || hidden === "FALSE" || hidden === "False") {
            hidden = false;
        } else {
            hidden = true
        }
        let data = {
            id: Date.now().toString(36),
            username: config.userinfo.username,
            title: title,
            body: body,
            category: category,
            fav: false,
            deleted: false,
            hidden: hidden,
            lastupdated: Date.now().toString(36),
            type: typeofdata,
            listdata: items,
            synced: false
        }
        const res = db.set(data)
        console.log(res)
    }
    else if (argv[2] === "g") {
        if (config.permissions.read === false) {
            console.log(colors.red("Permission denied"))
            process.exit(1)
        }
        let items = require('prompt-sync')()(colors.yellow('Get : '))
        let data = db.get(items)
        printdata(data)
    }
    else if (argv[2] === "d") {
        if (config.permissions.del === false) {
            console.log(colors.red("Permission denied"))
            process.exit(1)
        }
        let delid = require('prompt-sync')()(colors.green('Delete ID : '))
        let data = db.del(delid)
        console.log(data)
    }
    else if (argv[2] === "s") {
        if (config.permissions.read === false) {
            console.log(colors.red("Permission denied"))
            process.exit(1)
        }
        let inputdata = require('prompt-sync')()('Search : ')
        let query = inputdata.split(/(\s+)/).filter(function (e) { return e.trim().length > 0; });
        let data = db.search(query)
        printdata(data)
    }
    else if (argv[2] === "list") {
        if (config.permissions.read === false) {
            console.log(colors.red("Permission denied"))
            process.exit(1)
        }
        let data = db.list()
        console.log(data)
        console.log(data.length)
    }
    else if (argv[2] === "u") {
        if (config.permissions.update === false) {
            console.log(colors.red("Permission denied"))
            process.exit(1)
        }
        console.log(colors.red("[ID] [LOG] [Pass] [FAV] [DELETE] "))
        let uid = require('prompt-sync')()('ID : ')
        let utitle = require('prompt-sync')()('Title : ')
        let ubody = require('prompt-sync')()('Body : ')
        let ucat = require('prompt-sync')()('Category : ')
        ucatarr = ucat.split(/(\s+)/).filter(function (e) { return e.trim().length > 0; });
        let data = db.update(uid, utitle, ubody, ucatarr)
        console.log(data)
    }
    else if (argv[2] === "a") {
        if (config.permissions.create === false) {
            console.log(colors.red("Permission denied"))
            process.exit(1)
        }
        let appendid = require('prompt-sync')()('ID : ')
        let appendtitle = require('prompt-sync')()('Title : ')
        let appendbody = require('prompt-sync')()('Body : ')
        let appendcategory = require('prompt-sync')()('Category : ')
        appendcategory = appendcategory.split(/(\s+)/).filter(function (e) { return e.trim().length > 0; });
        let data = db.append({ appendid, appendtitle, appendbody, appendcategory })
        console.log(data)
    }
    else if (argv[2] === "chpass") {
        let pass = require('prompt-sync')().hide(colors.red("New Pass : "))
        // if (pass) {
        config.userinfo.password = encpass(pass)
        fs.writeFileSync("./config.json", JSON.stringify(config))
        console.log(colors.green("password changed successfully"))
        // } else {
        //     console.log(colors.red("password unchanged"))
        // }
    }
    else if (argv[2] === "chuser") {
        let newusername = require('prompt-sync')()(colors.red("New Username: "))
        if (newusername) {
            config.userinfo.username = newusername
            fs.writeFileSync("./config.json", JSON.stringify(config))
            console.log(colors.green("Username changed successfully"))
        } else {
            console.log(colors.red("password unchanged"))
        }
    }
    else if (argv[2] === "v") {
        console.log(require("./package.json").version)
    }
    else if (argv[2] === "init") {
        // The config file should already exist at this point.
        config.userinfo.username = require('prompt-sync')()(colors.yellow('Username : '))
        if (config.userinfo.username === '') {
            config.userinfo.username = null
        }
        config.path = __dirname
        fs.writeFileSync("./config.json", JSON.stringify(config))
        fs.mkdirSync("backup", { recursive: true })
        console.log(colors.yellow("Log initailized successfully"))
    }
    else if (argv[2] === "reset") {
        fs.unlink('./config.json', (err) => {
            if (err) {
                console.error(err)
                return
            }
        });
        console.log(colors.green("Reset all data successfully"))
    } else if (argv[2] === "show") {
        if (argv[3] === "hidden") {
            let res = db.get()
            showHiddenData(res)
        }
        else if (argv[3] === "fav") {
            let res = db.get()
            showFavData(res)
        }
        else if (argv[3] === "per") {
            console.log(config.permissions)
        }
        else {
            console.log("show hidden | fav | permissions")
        }
    }
    else if ((argv[2] === "whoami") || (argv[2] === "profile")) {
        console.log(config.userinfo.username)
    }
    else if (argv[2] === "restore") {
        id = require('prompt-sync')()(colors.green('ID : '))
        if (id) {
            let res = db.restore(id)
            console.log(res)
        } else {
            console.log("Id required")
        }
    }
    else if (argv[2] === "hide") {
        id = require('prompt-sync')()(colors.green('ID : '))
        if (id) {
            let res = db.mkhide(id)
            console.log(res)
        } else {
            console.log("Id required")
        }
    }
    else if (argv[2] === "unhide") {
        id = require('prompt-sync')()(colors.green('ID : '))
        if (id) {
            let res = db.unhide(id)
            console.log(res)
        } else {
            console.log("Id required")
        }
    }
    else if (argv[2] === "mkfav") {
        id = require('prompt-sync')()(colors.green('ID : '))
        if (id) {
            let res = db.mkfav(id)
            console.log(res)
        } else {
            console.log("Id required")
        }
    }
    else if (argv[2] === "rmfav") {
        id = require('prompt-sync')()(colors.green('ID : '))
        if (id) {
            let res = db.rmfav(id)
            console.log(res)
        } else {
            console.log("Id required")
        }
    }
    else if (argv[2] === "left") {
        const today = new Date();

        // set end of day as new Date object with current year, month, and day at 23:59:59
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

        // calculate difference between now and end of day in milliseconds
        const timeLeftMs = endOfDay.getTime() - today.getTime();

        // convert milliseconds to hours, minutes, and seconds
        const hoursLeft = Math.floor(timeLeftMs / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
        const secondsLeft = Math.floor((timeLeftMs % (1000 * 60)) / 1000);
        // output remaining time
        console.log(colors.red(`Time left until end of day: ${hoursLeft} hours, ${minutesLeft} minutes, ${secondsLeft} seconds.`));
        //
        config.left.targetdays.map((i) => {
            const targetDate = new Date(i.year, i.mon, i.day); // 2 for March (0-based index)
            const diffTime = targetDate - today;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
            console.log(colors.red(`ID : ${i.id}`));
            console.log(colors.red(`Left : ${diffDays} days ${diffHours} hours ${diffMinutes} minutes left until ${i.mon} ${i.day}st, ${i.year}`));
            console.log(colors.red(`Description : ${i.desc}++`));
            console.log(dash)
        })
    }
    else if (argv[2] === "backup") {
        if (argv[3] === "-o") {
            console.log("log backup under construction")
        } else {
            let res = db.backup()
            console.log(res)
        }
    }
    else if (argv[2] === "chadmin") {
        let pass = require('prompt-sync')().hide(colors.red('Password for admin : '))
        if (authadmin(pass)) {
            let newpass = require('prompt-sync')().hide(colors.green('New password for admin : '))
            config.admin.password = encpass(newpass)
            fs.writeFileSync("./config.json", JSON.stringify(config))
            console.log(colors.yellow("Updated password for admin successfully"))
        } else {
            console.log(colors.red("Invalid credentials"))
        }
    }
    else if (argv[2] === "chper") {
        let pass = require('prompt-sync')().hide(colors.red('Password for admin : '))
        if (authadmin(pass)) {
            let pervalues = "create | read | update | del | mkfav | unfav | hide | unhide"
            console.log(colors.blue(pervalues))
            let pf = require('prompt-sync')()(colors.green('Permission for : '))
            let val = require('prompt-sync')()(colors.green('T/F : '))
            val = val.toUpperCase()
            if (val === "T") {
                val = true
            } else if (val === "F") {
                val = false
            } else {
                console.log(colors.red("Invalid input"))
                process.exit()
            }
            switch (pf) {
                case "create":
                    config.permissions.create = val
                    break;
                case "read":
                    config.permissions.read = val
                    break;
                case "update":
                    break;
                case "del":
                    config.permissions.del = val
                    break;
                case "mkfav":
                    config.permissions.mkfav = val
                    break;
                case "unfav":
                    config.permissions.unfav = val
                    break;
                case "hide":
                    config.permissions.mkhide = val
                    break;
                case "unhide":
                    config.permissions.unhide = val
                    break;
                default:
                    break;
            }
            fs.writeFileSync("./config.json", JSON.stringify(config))
            console.log(colors.yellow("Updated permission"))
        } else {
            console.log(colors.red("Invalid credentials"))
        }
    }
    else if (argv[2] === "path") {
        console.log(colors.yellowBright(config.path))
    }
    else if (argv[2] === "enc") {
        let encdata = require('prompt-sync')()(colors.red('Encrypt : '))
        console.log(encpass(encdata))
    }
    else if (argv[2] === "dec") {
        let dncdata = require('prompt-sync')()(colors.red('Decrypt : '))
        console.log(decpass(dncdata))
    }
    // else if (argv[2] === "chat") {
    //     try {
    //         console.log(colors.yellow("Initializing..."))
    //         const readline = require('readline');
    //         const io = require('socket.io-client');
    //         const socket = io(config.chat.serverurl);
    //         const rl = readline.createInterface({
    //             input: process.stdin,
    //             output: process.stdout,
    //         });
    //         socket.emit('set-user', config.userinfo.username)
    //         socket.on('chat message', data => console.log(`${data.id}: ${data.msg}`));
    //         rl.on('line', input => socket.emit('chat message', input));
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }
    else if (argv[2] === "export") {
        let data = db.get("")
        let res = []
        data.map(async (i) => {
            res.push(await axios.post('https://api.shubham1888.repl.co/api/log/items', i))
        })
        console.log(res.data)
    }
    else if (argv[2] === "import") {
        let res
        res = await axios.get('https://api.shubham1888.repl.co/api/log/items')
        console.log(res.data)
    }
    else {
        console.log("Bad command!")
    }
}

const login = () => {
    let pass = require('prompt-sync')().hide(colors.red('Password : '))
    if (pass === null) { process.exit() }
    if (auth(pass)) {
        console.log(colors.yellow(`Login as ${config.userinfo.username}`))
        main()
    } else {
        console.log(colors.red(`Login failed`))
        login()
    }
}

if (argv[2] !== "init" && argv[2] !== "v") {
    login()
} else {
    main()
}
