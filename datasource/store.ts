import {DataSource, DataSourceConfig} from "apollo-datasource";
import {loadDatabase, tableName} from "../utils";

type store = {
    id: string
    name: string
    address: string
    createdAt: string
    deletedAt: string | null
}

export class StoreAPI extends DataSource {
    context: any

    constructor() {
        super()
    }

    initialize(config: DataSourceConfig<any>): void {
        this.context = config.context;
        this.context.stores = loadDatabase(tableName.stores);
    }

    get stores() {
        return this.context.stores
    }

    getStoreById(storeId: string) {
        return this.context.stores.find(store => store.id === storeId)
    }
}
