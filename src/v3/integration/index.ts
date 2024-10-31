import DefaultIntegration, {DefaultIntegrationOptions} from "src/v3/integration/default";
import LSAAIIntegration from "src/v3/integration/lsaai";
import IntegrationManager from "src/v3/integration/integration-manager";

IntegrationManager.register("default", DefaultIntegration);
IntegrationManager.register("lsaai", LSAAIIntegration);
export type AuthIntegration = DefaultIntegration<DefaultIntegrationOptions>;
export {IntegrationManager};
