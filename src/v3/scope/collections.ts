import { ScopeContext } from "../../scope";
import Scopes from "./scopes";
import { Collection } from "./types/collection";
import { ItemQuery } from "./types/item-query";
import { ItemQueryList } from "./types/item-query-list";

export default class Collections extends ScopeContext {
    protected context: Scopes;
    protected data: Collection | null = null;

    constructor(context: Scopes) {
        super();
        this.context = context;
    }

    async get(collectionId: string): Promise<Collection> {
        const collection: Collection = await this.context.rawQuery(`/collections/${collectionId}`);

        return collection;
    }

    async create(collection: Collection): Promise<Collection> {
        const createdCollection: Collection = await this.context.rawQuery(`/collections`, {
            method: "POST",
            body: collection,
      });

      return createdCollection;
    }

    async delete(collectionId: string): Promise<void> {
        await this.context.rawQuery(`/collections/${collectionId}`, {
            method: "DELETE",
        });
    }

    async queryItems(collectionId: string, query: ItemQuery): Promise<ItemQueryList> {
        const queryResult: ItemQueryList = await this.context.rawQuery(`/collections/${collectionId}/items/query`, {
            method: "PUT",
            body: query,
        })

        return queryResult;
    }

    async createItems(collectionId: string, items: any): Promise<void> {
        await this.context.rawQuery(`/collections/${collectionId}/items`, {
            method: "POST",
            body: {
                ...items,
            }
        })
    }

    async deleteItem(collectionId: string, itemId: string): Promise<void> {
        await this.context.rawQuery(`/collections/${collectionId}/items/${itemId}`, {
            method: "DELETE",
        });
    }
}
