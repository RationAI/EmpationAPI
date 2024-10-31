import {RootAPI} from "../root";

export interface DefaultIntegrationOptions {
    implementation?: string
    _context?: RootAPI
}

/**
 * Integration class provides external information about users and their rights,
 * and relevant related external information
 */
export default class DefaultIntegration<T extends DefaultIntegrationOptions> {

    protected context: RootAPI;
    protected props: T;

    constructor(props: T) {
        if (props._context === undefined) {
            throw Error("Private property not configured.");
        }
        this.context = props._context;
        this.props = props;
    }

    /**
     * Maps local id parts to the specific name (see extensions)
     * @param specKey see extension on case hierarchy keys / specs
     * @param value
     */
    async translatePathSpec(specKey: string, value: string): Promise<string> {
        return value;
    }
}

