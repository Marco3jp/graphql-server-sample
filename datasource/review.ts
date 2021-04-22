import {DataSource, DataSourceConfig} from "apollo-datasource";
import {loadDatabase, saveDatabase, tableName} from "../utils";
import * as DataLoader from "dataloader";

type review = {
    id: string
    userId: string
    storeId: string
    reviewText: string
    isPublished: boolean
    createdAt: string
    publishedAt: string | null
    deletedAt: string | null
}

export class ReviewAPI extends DataSource {
    context: any

    constructor() {
        super()
    }

    initialize(config: DataSourceConfig<any>): void {
        this.context = config.context;
        this.context.reviews = loadDatabase(tableName.reviews);
    }

    get reviews() {
        return this.context.reviews
    }

    getReviewsByStoreIDs = new DataLoader((storeIds: string[]) => {
        return new Promise(resolve => {
            const result = [];
            storeIds.forEach(storeId => {
                result.push(this.context.reviews.filter(review => review.storeId === storeId));
            })
            resolve(result);
        })
    })

    getReviewsByStoreIDsFilteringPublishedOnly = new DataLoader((storeIds: string[]) => {
        return new Promise(resolve => {
            const result = [];
            storeIds.forEach(storeId => {
                result.push(this.context.reviews.filter(review => review.storeId === storeId && review.isPublished));
            })
            resolve(result);
        })
    })

    getReviewsByUserIDs = new DataLoader((userIds: string[]) =>{
        return new Promise(resolve => {
            const result = [];
            userIds.forEach(userId => {
                result.push(this.context.reviews.filter(review => review.userId === userId));
            })
            resolve(result);
        })
    });

    getReviewsByUserIDsFilteringPublishedOnly = new DataLoader((userIds: string[]) =>{
        return new Promise(resolve => {
            const result = [];
            userIds.forEach(userId => {
                result.push(this.context.reviews.filter(review => review.userId === userId && review.isPublished));
            })
            resolve(result);
        })
    });

    postReview(review) {
        this.context.reviews.push(review);
        saveDatabase(tableName.reviews, this.context.reviews);
    }
}
