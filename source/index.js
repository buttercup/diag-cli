#!/usr/bin/env node

const fs = require("fs");
const pify = require("pify");
const pw = require("pw");
const { Credentials, FileDatasource, Vault, createVaultFacade, init } = require("buttercup");
const { exportVaultToCSV } = require("@buttercup/exporter");
const { table } = require("table");
const chalk = require("chalk");
const jsonSize = require("json-size");

const writeFile = pify(fs.writeFile);

const [command, ...args] = process.argv.slice(2);

async function exportToCSV() {
    const [filename, target] = args;
    if (!filename) {
        throw new Error("Vault file must be provided");
    } else if (!target) {
        throw new Error("Target file must be provided");
    }
    process.stdout.write("Password: ");
    const password = await getPassword();
    const { vault } = await getVault(filename, password);
    const csv = await exportVaultToCSV(vault);
    await writeFile(target, csv);
    console.log(`Wrote: ${target}`);
}

function getPassword() {
    return new Promise(resolve => {
        pw(password => resolve(password));
    });
}

async function getVault(filename, password) {
    const fds = new FileDatasource(Credentials.fromDatasource({
        type: "file",
        path: filename
    }, password));
    const { Format, history } = await fds.load(Credentials.fromPassword(password));
    const vault = Vault.createFromHistory(history, Format);
    return { datasource: fds, vault };
}

async function inspect() {
    const [filename] = args;
    if (!filename) {
        throw new Error("Vault file must be provided");
    }
    process.stdout.write("Password: ");
    const password = await getPassword();
    const { vault } = await getVault(filename, password);
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
    } else if (command === "export") {
        return exportToCSV();
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
