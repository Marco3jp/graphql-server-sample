import {DataSource, DataSourceConfig} from "apollo-datasource";
import {loadDatabase, tableName} from "../utils";

type user = {
    id: string
    name:string
    createdAt: string
    deletedAt: string | null
}

export class UserAPI extends DataSource {
    context: any

    constructor() {
        super()
    }

    initialize(config: DataSourceConfig<any>): void {
        this.context = config.context;
        this.context.users = loadDatabase(tableName.users);
        this.context.userPasswordHashes = loadDatabase(tableName.userPasswordHashes);
    }

    get users() {
        return this.context.users
    }

    getUserById(userId: string) {
        return this.context.users.find(user => user.id === userId);
    }

    getUserPasswordHashByUserId(userId: string) {
        return this.context.userPasswordHashes.find(userPasswordHash => userPasswordHash.userId === userId)?.hashed_password;
    }
}
