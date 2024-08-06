/* tslint:disable */
/* eslint-disable */
import {PointAnnotation} from "./point-annotation";
import {LineAnnotation} from "./line-annotation";
import {ArrowAnnotation} from "./arrow-annotation";
import {CircleAnnotation} from "./circle-annotation";
import {RectangleAnnotation} from "./rectangle-annotation";
import {PolygonAnnotation} from "./polygon-annotation";

export type Annotation = PointAnnotation
    | LineAnnotation
    | ArrowAnnotation
    | CircleAnnotation
    | RectangleAnnotation
    | PolygonAnnotation
