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

    getReviewById = new DataLoader((reviewIds: string[]) => {
        return new Promise(resolve => {
            const result = [];
            reviewIds.forEach(reviewId => {
                result.push(this.context.reviews.find(review => {
                    return review.id === reviewId && review.deletedAt === null
                }));
            })
            resolve(result);
        })
    })

    getReviewsByStoreIDs = new DataLoader((args: { storeId: string, isPublished: boolean }[]) => {
        return new Promise(resolve => {
            const result = [];
            args.forEach(arg => {
                result.push(
                    this.context.reviews
                        .filter(review => {
                            return review.storeId === arg.storeId
                                && (!arg.isPublished || review.publishedAt)
                                && review.deletedAt === null
                        })
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
                        .filter(review => {
                            return review.userId === arg.userId
                                && (!arg.isPublished || review.publishedAt)
                                && review.deletedAt === null
                        })
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

    deleteReview(reviewId) {
        const target = this.context.reviews.find(review => review.id === reviewId);
        let msg = '';
        if (target) {
            target.deletedAt = Math.round(Date.now() / 1000);
            msg = 'Success review deleting'
        } else {
            msg = 'There is not target review'
        }

        saveDatabase(tableName.reviews, this.context.reviews);

        return msg;
    }
}
