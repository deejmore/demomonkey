import tamper from './functions/tamper';
import Configuration from './models/Configuration'

(function(scope) {
    "use strict";

    var intervals = [];

    function enable(configuration) {
        return setInterval(function() {
            var text,
                texts = scope.document.evaluate('//body//text()[ normalize-space(.) != ""]', document, null, 6, null);
            for (var i = 0; (text = texts.snapshotItem(i)) !== null; i += 1) {
                //tamper(text, configuration, "data");
                configuration.apply(text, "data");
            }

            //tamper(scope.document, configuration, "title");
            configuration.apply(scope.document, "title");

        }, 100);
    }

    function runAll(configurations) {
        return configurations.reduce(function(result, rawConfig) {

            var configuration = new Configuration(rawConfig.content, null, rawConfig.enabled, rawConfig.values);

            if (configuration.isEnabledForUrl()) {
              console.log("Enabling configuration: ", rawConfig.name);
              result.push(enable(configuration));
            }

            return result;

        }, []);
    }

    console.log("DemoMonkey enabled. Tampering the content.")

    chrome.storage.local.get("configurations", function(storage) {
        intervals = runAll(storage.configurations);
    });

    chrome.storage.onChanged.addListener(function(changes, namespace) {
        if (namespace === "local") {
            // Currently we don't check the changes, we just reset everything
            console.log(changes);
            intervals.forEach(function(interval) {
                clearInterval(interval);
            });
            intervals = runAll(changes.configurations.newValue);
        }
    });

})(window);
