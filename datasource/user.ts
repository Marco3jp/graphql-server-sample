import {DataSource, DataSourceConfig} from "apollo-datasource";
import {loadDatabase, tableName} from "../utils";

export class UserAPI extends DataSource {
    context

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
