import { ScopeContext } from "../../scope";
import Scopes from "./scopes";
import { ContinuousPixelmap } from "./types/continuous-pixelmap";
import { DiscretePixelmap } from "./types/discrete-pixelmap";
import { IdObject } from "./types/id-object";
import { Job } from "./types/job";
import { NominalPixelmap } from "./types/nominal-pixelmap";
import { PixelmapList } from "./types/pixelmap-list";
import { PixelmapQuery } from "./types/pixelmap-query";

type Pixelmap = ContinuousPixelmap | DiscretePixelmap | NominalPixelmap;

export default class Pixelmaps extends ScopeContext {
    protected context: Scopes;
    protected data: Pixelmap | null = null;

    constructor(context: Scopes) {
        super();
        this.context = context;
    }

    async get(pixelmapId: string): Promise<Pixelmap> {
        return await this.context.rawQuery(`/pixelmaps/${pixelmapId}`) as Pixelmap;
    }

    async post(pixelmaps: Pixelmaps): Promise<ContinuousPixelmap | DiscretePixelmap | NominalPixelmap | PixelmapList> {
        return await this.context.rawQuery(`/pixelmaps`, {
            method: "POST",
            body: pixelmaps,
        });
    }

    async delete(pixelmapId: string): Promise<IdObject> {
        return await this.context.rawQuery(`/pixelmaps/${pixelmapId}`, {
            method: "DELETE",
        }) as IdObject;
    }

    async query(query: PixelmapQuery): Promise<Pixelmap[]> {
        const queryResult = await this.context.rawQuery(`/pixelmaps/query`, {
            method: "PUT",
            body: query,
        }) as PixelmapList;
        return queryResult.items;
    }

    async getTile(pixelmapId: string, level: number, tileX: number, tileY: number): Promise<Blob> {
        const tile = await this.context.rawQuery(`/pixelmaps/${pixelmapId}/level/${level}/position/${tileX}/${tileY}/data`, {
            responseType: "blob",
        });
        return tile;
    }

    async uploadTile(pixelmapId: string, level: number, tileX: number, tileY: number, tile: Blob): Promise<string> {
        const result = await this.context.rawQuery(`/pixelmaps/${pixelmapId}/level/${level}/position/${tileX}/${tileY}/data`, {
            method: "PUT",
            body: tile,
        });
        return result;
    }

    async deleteTile(pixelmapId: string, level: number, tileX: number, tileY: number): Promise<string> {
        const result = await this.context.rawQuery(`/pixelmaps/${pixelmapId}/level/${level}/position/${tileX}/${tileY}/data`, {
            method: "DELETE",
        });
        return result;
    }

    async bulkGetTile(pixelmapId: string, level: number, startX: number, startY: number, endX: number, endY: number): Promise<Blob> {
        const tiles = await this.context.rawQuery(`/pixelmaps/${pixelmapId}/level/${level}/position/start/${startX}/${startY}/end/${endX}/${endY}/data`, {
            responseType: "blob",
        });
        return tiles;
    }

    async bulkUploadTile(pixelmapId: string, level: number, startX: number, startY: number, endX: number, endY: number, tiles: Blob): Promise<string> {
        const result = await this.context.rawQuery(`/pixelmaps/${pixelmapId}/level/${level}/position/start/${startX}/${startY}/end/${endX}/${endY}/data`, {
            method: "PUT",
            body: tiles,
        });
        return result;
    }
}
