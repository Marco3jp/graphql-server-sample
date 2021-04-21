import {DataSource, DataSourceConfig} from "apollo-datasource";
import {loadDatabase, tableName} from "../utils";

type user = {
    id: string,
    name:string
}

export class UserAPI extends DataSource {
    context: {users: user[]}

    initialize(config: DataSourceConfig<any>): void {
        this.context.users = loadDatabase(tableName.users);
    }

    get users() {
        return this.context.users
    }

    getUserById(userId: string) {
        return this.context.users.find(user => user.id === userId);
    }
}
