import { LanguageService } from "../../languageService";
import { ResourcesProvider } from "./resourcesProvider";

(() => {
    LanguageService.initialize(new ResourcesProvider());
})();
