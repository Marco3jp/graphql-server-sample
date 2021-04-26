import * as fs from "fs";

export enum tableName {
    reviews = "reviews",
    stores = "stores",
    users = "users",
    userPasswordHashes = "userPasswordHashes",
}

export function loadDatabase(tableName: tableName) {
    const file = fs.readFileSync(`database/${tableName}.json`, {encoding: "utf8"});
    return JSON.parse(file);
}

export function saveDatabase(tableName: tableName, data) {
    const fileBody = JSON.stringify(data);
    fs.writeFileSync(`database/${tableName}.json`, fileBody);
}
