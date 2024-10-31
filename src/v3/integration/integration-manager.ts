import {AuthIntegration} from "src/v3/integration";
import {Constructor} from "src/v3/extensions/utils";

/**
 * Integration manager / dealer
 */
export default class IntegrationManager {

    private static items: Map<string, Constructor<AuthIntegration>> = new Map();

    constructor() {
       throw Error("Not instantiable.");
    }

    static register(name: string, cls: Constructor<AuthIntegration>): Constructor<AuthIntegration> {
        console.log("refistered", cls);
        this.items.set(name, cls);
        return cls;
    }

    static get(name: string): Constructor<AuthIntegration> | undefined {
        console.log("GET", name);
        return this.items.get(name);
    }
}
