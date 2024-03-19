import {AbstractAPI, RawAPI, RawOptions} from "./base";

export abstract class RationAIContext {
  protected abstract context: RationAIAPI;
  protected abstract data: any;
}

// BaseAPI implements AbstractAPI over /v[version]
export abstract class RationAIAPI extends AbstractAPI {

    protected abstract raw: RawAPI;

    /**
     * Change the User actor for the API. Note: the api will
     * reset it's whole state.
     * @param userId
     * @protected
     */
    abstract use(userId: string): Promise<void>;

    /**
     * Change the User actor for the API. Note: the api will
     * reset it's whole state.
     * @param token setup context from object
     */
    abstract from(token: string): Promise<void>;

    abstract reset(): void;

    abstract rawQuery(endpoint: string, options?: RawOptions): Promise<any>;
}




