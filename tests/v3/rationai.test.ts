/** @jest-environment setup-polly-jest/jest-environment-node */
import { GlobalDataCreatorType } from "../../src/v3/rationai/types/global-data-creator-type";
import { GlobalItem } from "../../src/v3/rationai/types/global-item";
import { GlobalItemType } from "../../src/v3/rationai/types/global-item-type";
import { GlobalStorageQuery } from "../../src/v3/rationai/types/global-storage-query";
import {polly} from "../polly";
import {setupIntercept} from "../setup";
import {getRationAI} from "./setup";

describe('rationai api', () => {
    const pollyCtx = polly();
    beforeEach(() => setupIntercept(pollyCtx))

    it('create global item', async () => {

        const rationAI = await getRationAI();

        const newItem = {
          name: "test item",
          creator_id: rationAI.userId,
          creator_type: GlobalDataCreatorType.USER,
          data_type: "test_type",
          type: GlobalItemType.String,
          value: "test value"
        }

        const createdItem = await rationAI.globalStorage.create(newItem) as GlobalItem;

        const getItem = await rationAI.globalStorage.get(createdItem.id)
        expect(getItem).toEqual(createdItem)

        const updatedItem = await rationAI.globalStorage.update(createdItem.id, {
          ...getItem,
          value: "new value",
        })

        const newValue = await rationAI.globalStorage.getValue(createdItem.id);
        expect(newValue).toEqual("new value");

        const globalQuery: GlobalStorageQuery = {
          creators: [rationAI.userId],
          references: [null],
          types: [GlobalItemType.String],
          data_types: ["test_type"]
        }

        const queryResult = await rationAI.globalStorage.query(globalQuery);
        expect(queryResult.find((item) => item.id === createdItem.id)).toEqual(updatedItem)

        await rationAI.globalStorage.delete(createdItem.id)

        const queryResult2 = await rationAI.globalStorage.query(globalQuery);
        expect(queryResult2.find((item) => item.id === createdItem.id)).toBeUndefined()
    });
});
