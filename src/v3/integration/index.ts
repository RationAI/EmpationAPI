import DefaultIntegration, {DefaultIntegrationOptions} from "./default";
import LSAAIIntegration from "./lsaai";
import IntegrationManager from "./integration-manager";

IntegrationManager.register("default", DefaultIntegration);
IntegrationManager.register("lsaai", LSAAIIntegration);
export type AuthIntegration = DefaultIntegration<DefaultIntegrationOptions>;
export {IntegrationManager};
