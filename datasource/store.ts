import {DataSource, DataSourceConfig} from "apollo-datasource";
import {loadDatabase, saveDatabase, tableName} from "../utils";

export class StoreAPI extends DataSource {
    context

    initialize(config: DataSourceConfig<any>): void {
        this.context.store = loadDatabase(tableName.stores);
    }

    get stores() {
        return this.context.stores
    }

    getStoreById(storeId: string) {
        return this.context.stores.find(store => store.id === storeId)
    }
}
