import { ScopeContext } from "../../scope";
import Scopes from "./scopes";
import { DataCreatorType } from "./types/data-creator-type";
import { PostPrimitive } from "./types/post-primitive";
import { Primitive } from "./types/primitive";
import { PrimitiveList } from "./types/primitive-list";
import { PrimitiveQuery } from "./types/primitive-query";
import { PrimitiveReferenceType } from "./types/primitive-reference-type";
import { PrimitiveType } from "./types/primitive-type";
import { UniqueReferences } from "./types/unique-references";

export default class Primitives extends ScopeContext {
    protected context: Scopes;
    protected data: Primitive[];

    constructor(context: Scopes) {
        super();
        this.context = context;
    }

    async query(query: PrimitiveQuery): Promise<Primitive[]> {
        const data: PrimitiveList = await this.context.rawQuery(`/primitives/query`, {
            method: "PUT",
            body: query,
        });

        return data.items
    }

    async queryUniqueReferences(query: PrimitiveQuery): Promise<UniqueReferences> {
        const data: UniqueReferences = await this.context.rawQuery(`/primitives/query/unique-references`, {
            method: "PUT",
            body: query,
        });

        return data
    }

    async createRaw(primitive: PostPrimitive): Promise<Primitive> {
        const createdPrimitive: Primitive = await this.context.rawQuery(`/primitives`, {
            method: "POST",
            body: primitive,
        });

        return createdPrimitive;
    }

    async create(value: any, name: string, description?: string, reference_id?: string, reference_type?: PrimitiveReferenceType): Promise<Primitive> {
        let primitiveType;
        if (typeof value === "number") {
            if (Number.isInteger(value)) {
                primitiveType = "integer";
            } else {
                primitiveType = "float";
            }
        } else if (typeof value === "boolean") {
            primitiveType = "bool";
        } else {
            primitiveType = "string";
            value = JSON.stringify(value);
        }

        const newPrimitive: PostPrimitive = {
            name: name,
            description: description,
            creator_id: this.context.scopeContext.scope_id,
            creator_type: DataCreatorType.Scope,
            reference_id: reference_id,
            reference_type: reference_type,
            type: primitiveType,
            value: value
        }

        return await this.createRaw(newPrimitive);
    }

    async getRaw(id: string): Promise<Primitive> {
        console.log(`GET RAW ${id}`)
        const primitive: Primitive = await this.context.rawQuery(`/primitives/${id}`);
        return primitive
    }

    async get(id: string): Promise<any> {
        console.log(`GET ${id}`)
        const primitive = await this.getRaw(id)
        if (primitive.type === "string") {
            return JSON.parse(primitive.value as string);
        }
        return primitive.value
    }

    async delete(id: string): Promise<void> {
        console.log(`DELETE ${id}`)
        await this.context.rawQuery(`/primitives/${id}`, {
            method: "DELETE",
        });
    }
}
