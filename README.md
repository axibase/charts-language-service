# Axibase charts language service

This package provides language services which can be used in both web and VSCode environment.

* IntelliSense ([CompletionProvider](src/completionProvider.ts))
* Syntax validation ([Validator](src/validator.ts))

Package contains general language logic. Access to the syntax resources (see below) should be provided by web-client | VSCode plugin realization.

### Language settings format

See files from [this project](https://github.com/axibase/axibase-charts-vscode/tree/master) as settings format examples:
- [descriptions.md](https://github.com/axibase/axibase-charts-vscode/blob/master/server/descriptions.md) (map of settings names and descriptions)
- [snippets.json](https://github.com/axibase/axibase-charts-vscode/tree/master/snippets/snippets.json) (code snippets in JSON representation, used by IntelliSense)
- [dictionary.json](https://github.com/axibase/axibase-charts-vscode/blob/master/server/dictionary.json) (array of settings)

### Project structure
[LanguageService](src/languageService.ts) is the entry point of the project. It provides access to `CompletionProvider` for axibase-charts syntax IntelliSense and `Validator` for checking document's contents according to syntax rules.

`LanguageService` **must be** initialized with `ResourcesProvider` instance. This must be done **before** accessing any of its features. After that _Validator_ and _CompletionProvider_ are accessible via `getCompletionProvider` and `getValidator` methods.

### ResourcesProvider instance
External realization of `ResourcesProvider` must extend [ResourcesProviderBase](src/resourcesProviderBase.ts) class from this package and implement three methods: _readSnippets_, _readSettings_ and _readDescriptions_.

### Access to resources inside the project
Also LanguageService provides access to settings resources inside this package. To get access to ResourcesProvider instance passed during LanguageService initialization use `LanguageService.getResourcesProvider()` method. See [example usage](#accessing-resources)

### Installation

```
npm i @axibase/charts-language-service
```

### Usage

#### LanguageService features: CompletionProvider and Validation
_index.js_
```
import { LanguageService } from "@axibase/charts-language-service";
import { ResourcesProvider } from "./resourcesProvider";

// initialize language service with ResourcesProvider instance
LanguageService.initialize(new ResourcesProvider());

// call language service features
LanguageService.getCompletionProvider(document, position);
LanguageService.getValidator(text);
```
_resourcesProvider.js_
```
import { ResourcesProviderBase } from "@axibase/charts-language-service";

export class ResourcesProvider extends ResourcesProviderBase {
    // readSnippets() implementation
    // readSettings() implementation
    // readDescriptions() implementation
}
```

#### Accessing resources via ResourcesProvider <a name="accessing-resources"></a>
You can get access to the ResourcesProvider instance in arbitrary place of your project:
```
const settingsMap = LanguageService.getResourcesProvider().settingsMap;
```