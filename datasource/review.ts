import {DataSource, DataSourceConfig} from "apollo-datasource";
import {loadDatabase, saveDatabase, tableName} from "../utils";

type review = {
    id: string
    userId: string
    storeId: string
    reviewText: string
}

export class ReviewAPI extends DataSource {
    context: {reviews: review[]}

    initialize(config: DataSourceConfig<any>): void {
        this.context.reviews = loadDatabase(tableName.reviews);
    }

    get reviews() {
        return this.context.reviews
    }

    getReviewsByStoreID(storeId: string) {
        return this.context.reviews.filter(review => review.storeId === storeId)
    }

    getReviewsByUserID(userId: string) {
        return this.context.reviews.filter(review => review.userId === userId)
    }

    postReview(review) {
        this.context.reviews.push(review);
        saveDatabase(tableName.reviews, this.context.reviews);
    }
}
