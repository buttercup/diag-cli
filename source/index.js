#!/usr/bin/env node

const pw = require("pw");
const { Credentials, FileDatasource, Vault, createVaultFacade, init } = require("buttercup");
const { table } = require("table");
const chalk = require("chalk");
const jsonSize = require("json-size");

const [command, ...args] = process.argv.slice(2);

function getPassword() {
    return new Promise(resolve => {
        pw(password => resolve(password));
    });
}

async function inspect() {
    const [filename] = args;
    if (!filename) {
        throw new Error("Vault file must be provided");
    }
    process.stdout.write("Password: ");
    const password = await getPassword();
    const fds = new FileDatasource(Credentials.fromDatasource({
        type: "file",
        path: filename
    }, password));
    const { Format, history } = await fds.load(Credentials.fromPassword(password));
    const vault = Vault.createFromHistory(history, Format);
    const vaultFacade = createVaultFacade(vault);
    // Form report data
    const data = [];
    data.push([chalk.bold("Aspect"), chalk.bold("Value")]);
    data.push(["Groups", vaultFacade.groups.length]);
    data.push(["Entries", vaultFacade.entries.length]);
    data.push(["Vault Size (memory, bytes)", jsonSize(vaultFacade)]);
    console.log(table(data));
}

async function run() {
    if (command === "inspect") {
        return inspect();
    } else {
        throw new Error(`Unknown command: ${command}`);
    }
}

(async function() {
    init();
    try {
        await run();
    } catch (err) {
        console.error(err);
        process.exit(100);
    }
})();
