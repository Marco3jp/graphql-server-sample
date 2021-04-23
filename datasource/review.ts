import {DataSource, DataSourceConfig} from "apollo-datasource";
import {loadDatabase, saveDatabase, tableName} from "../utils";
import * as DataLoader from "dataloader";

type review = {
    id: string
    userId: string
    storeId: string
    reviewText: string
    isPublished?: boolean
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

    getReviewsByStoreIDs = new DataLoader((args: { storeId: string, isPublished: boolean }[]) => {
        return new Promise(resolve => {
            const result = [];
            args.forEach(arg => {
                result.push(
                    this.context.reviews
                        .filter(review => review.storeId === arg.storeId && (!arg.isPublished || review.publishedAt))
                        .map(filteredReview => {
                            return {
                                isPublished: filteredReview.publishedAt !== null,
                                ...filteredReview
                            }
                        }));
            })
            resolve(result);
        })
    })

    getReviewsByUserIDs = new DataLoader((args: { userId: string, isPublished: boolean }[]) => {
        return new Promise(resolve => {
            const result = [];
            args.forEach(arg => {
                result.push(
                    this.context.reviews
                        .filter(review => review.userId === arg.userId && (!arg.isPublished || review.publishedAt))
                        .map(filteredReview => {
                            return {
                                isPublished: filteredReview.publishedAt !== null,
                                ...filteredReview
                            }
                        }));
            })
            resolve(result);
        })
    });

    postReview(review) {
        this.context.reviews.push(review);
        saveDatabase(tableName.reviews, this.context.reviews);
    }
}
