import { ScopeContext } from "../../scope";
import Scopes from "./scopes";
import {PointAnnotation} from "./types/point-annotation";
import {LineAnnotation} from "./types/line-annotation";
import {ArrowAnnotation} from "./types/arrow-annotation";
import {CircleAnnotation} from "./types/circle-annotation";
import {RectangleAnnotation} from "./types/rectangle-annotation";
import {PolygonAnnotation} from "./types/polygon-annotation";
import {PostPointAnnotations} from "./types/post-point-annotations";
import {PostLineAnnotations} from "./types/post-line-annotations";
import {PostArrowAnnotations} from "./types/post-arrow-annotations";
import {PostCircleAnnotations} from "./types/post-circle-annotations";
import {PostRectangleAnnotations} from "./types/post-rectangle-annotations";
import {PostPolygonAnnotations} from "./types/post-polygon-annotations";
import {PostPointAnnotation} from "./types/post-point-annotation";
import {PostLineAnnotation} from "./types/post-line-annotation";
import {PostArrowAnnotation} from "./types/post-arrow-annotation";
import {PostCircleAnnotation} from "./types/post-circle-annotation";
import {PostRectangleAnnotation} from "./types/post-rectangle-annotation";
import {PostPolygonAnnotation} from "./types/post-polygon-annotation";
import {AnnotationListResponse} from "./types/annotation-list-response";
import {IdObject} from "./types/id-object";

export interface PostAnnotationQueryParams {
    isRoi?: boolean;
    externalIds?: boolean;
}

export default class Annotations extends ScopeContext {
    protected context: Scopes;
    protected data: undefined; //unused

    constructor(context: Scopes) {
        super();
        this.context = context;
    }

    /**
     * Post multiple annotations as one. Inreality the same endpoint as create(...)
     */
    async upload(data: PostPointAnnotations | PostLineAnnotations | PostArrowAnnotations | PostCircleAnnotations | PostRectangleAnnotations | PostPolygonAnnotations,
                 options: PostAnnotationQueryParams = {}
    ): Promise<AnnotationListResponse> {
        //the same as create but for types its simpler to split
        return await this.context.rawQuery('/annotations', {
            method: "POST",
            query: options,
            body: this.data
        });
    }

    /**
     * Create an annotation.
     */
    async create(data: PostPointAnnotation | PostLineAnnotation | PostArrowAnnotation | PostCircleAnnotation | PostRectangleAnnotation | PostPolygonAnnotation,
                 options: PostAnnotationQueryParams = {}
    ): Promise<(PointAnnotation | LineAnnotation | ArrowAnnotation | CircleAnnotation | RectangleAnnotation | PolygonAnnotation)> {
        return await this.context.rawQuery('/annotations', {
            method: "POST",
            query: options,
            body: this.data
        });
    }

    async delete(id: string): Promise<IdObject> {
        return await this.context.rawQuery(`/annotations/${id}`, {
            method: "DELETE"
        });
    }

    async update(
        id: string,
        data: PostPointAnnotation | PostLineAnnotation | PostArrowAnnotation | PostCircleAnnotation | PostRectangleAnnotation | PostPolygonAnnotation,
        options: PostAnnotationQueryParams = {},
    ): Promise<(PointAnnotation | LineAnnotation | ArrowAnnotation | CircleAnnotation | RectangleAnnotation | PolygonAnnotation)> {
        await this.delete(id);

        // update might carry id but user forgot to set external IDs to true
        if (!options.externalIds && data.id) {
            options.externalIds = true;
        }
        return await this.create(data, options);
    }
}
