import { ScopeContext } from '../../scope';
import Scope from './scope';
import { Annotation } from './types/annotation';
import { PostPointAnnotations } from './types/post-point-annotations';
import { PostLineAnnotations } from './types/post-line-annotations';
import { PostArrowAnnotations } from './types/post-arrow-annotations';
import { PostCircleAnnotations } from './types/post-circle-annotations';
import { PostRectangleAnnotations } from './types/post-rectangle-annotations';
import { PostPolygonAnnotations } from './types/post-polygon-annotations';
import { PostPointAnnotation } from './types/post-point-annotation';
import { PostLineAnnotation } from './types/post-line-annotation';
import { PostArrowAnnotation } from './types/post-arrow-annotation';
import { PostCircleAnnotation } from './types/post-circle-annotation';
import { PostRectangleAnnotation } from './types/post-rectangle-annotation';
import { PostPolygonAnnotation } from './types/post-polygon-annotation';
import { AnnotationListResponse } from './types/annotation-list-response';
import { IdObject } from './types/id-object';
import { AnnotationList } from './types/annotation-list';
import { AnnotationQuery } from './types/annotation-query';
import { ClassListResponse } from './types/class-list-response';
import { Class } from './types/class';
import { PostClassList } from './types/post-class-list';
import { PostClass } from './types/post-class';
import { ClassQuery } from './types/class-query';
import { ClassList } from './types/class-list';

export interface PostAnnotationQueryParams {
  isRoi?: boolean;
  externalIds?: boolean;
}

export default class Annotations extends ScopeContext {
  protected context: Scope;
  protected data: undefined; //unused

  constructor(context: Scope) {
    super();
    this.context = context;
  }

  /**
   * Query Annotations
   */
  async query(
    data: AnnotationQuery,
    withClasses: boolean = true,
  ): Promise<AnnotationList> {
    return await this.context.rawQuery('/annotations/query', {
      method: 'PUT',
      query: {
        with_classes: withClasses,
      },
      body: data,
    });
  }

  /**
   * Get Annotation by ID
   */
  async get(id: string, withClasses: boolean = true): Promise<Annotation> {
    return await this.context.rawQuery(`/annotations/${id}`, {
      query: {
        with_classes: withClasses,
      },
    });
  }

  /**
   * Post multiple annotations as one. In reality the same endpoint as create(...)
   */
  async createMany(
    data:
      | PostPointAnnotations
      | PostLineAnnotations
      | PostArrowAnnotations
      | PostCircleAnnotations
      | PostRectangleAnnotations
      | PostPolygonAnnotations,
    options: PostAnnotationQueryParams = {},
  ): Promise<AnnotationListResponse> {
    //the same as create but for types its simpler to split
    return await this.context.rawQuery('/annotations', {
      method: 'POST',
      query: options,
      body: data,
    });
  }

  /**
   * Create an annotation.
   */
  async create(
    data:
      | PostPointAnnotation
      | PostLineAnnotation
      | PostArrowAnnotation
      | PostCircleAnnotation
      | PostRectangleAnnotation
      | PostPolygonAnnotation,
    options: PostAnnotationQueryParams = {},
  ): Promise<Annotation> {

    // respect external ID if set
    if (!options.externalIds && data.id) {
      options.externalIds = true;
    }

    return await this.context.rawQuery('/annotations', {
      method: 'POST',
      query: options,
      body: data,
    });
  }

  /**
   * Delete an annotation. Does not remove related classes.
   */
  async deleteById(id: string): Promise<IdObject> {
    return await this.context.rawQuery(`/annotations/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Delete an annotation with its classes if defined.
   */
  async delete(object: Annotation): Promise<IdObject> {
    if (!object.id) {
      throw 'Cannot delete annotation without ID property!';
    }
    const deleted = await this.deleteById(object.id);
    if (object.classes) {
      for (let cls of object.classes) {
        if (cls.id) await this.deleteClass(cls.id);
      }
    }
    return deleted;
  }

  /**
   * Update annotation: delete and re-create
   */
  async update(
    id: string,
    data:
      | PostPointAnnotation
      | PostLineAnnotation
      | PostArrowAnnotation
      | PostCircleAnnotation
      | PostRectangleAnnotation
      | PostPolygonAnnotation,
    options: PostAnnotationQueryParams = {},
  ): Promise<Annotation> {
    await this.deleteById(id);
    // create will respect existing ID
    data.id = id;
    return await this.create(data, options);
  }

  /**
   * Attach class to an existing annotation
   */
  async addClass(data: PostClass): Promise<Class> {
    return await this.context.rawQuery('/classes', {
      method: 'POST',
      body: data,
    });
  }

  /**
   * Attach classes to existing annotations
   */
  async addClassMany(data: PostClassList): Promise<ClassListResponse> {
    return await this.context.rawQuery('/classes', {
      method: 'POST',
      body: data,
    });
  }

  /**
   * Get class by its ID
   */
  async getClass(id: string): Promise<Class> {
    return await this.context.rawQuery(`/classes/${id}`);
  }

  /**
   * Delete class by its ID
   */
  async deleteClass(id: string): Promise<IdObject> {
    return await this.context.rawQuery(`/classes/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Query classes by properties
   */
  async queryClasses(data: ClassQuery): Promise<ClassList> {
    return await this.context.rawQuery('/classes/query', {
      method: 'PUT',
      body: data,
    });
  }
}
