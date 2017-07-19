/*global ko */

// Extension to replace an observable with a writeable computed that forces write to be numeric.
ko.observable.fn.asPositiveInteger = function(defaultForNonPositiveNumber) {
    var original = this,
        interceptor = ko.computed({
            read: original,
            write: function (newValue) {
                var parsed = parseInt(newValue, 10);
                // if value is bad or negative, then use default.
                if (isNaN(parsed) || parsed < 0) {
                    parsed = defaultForNonPositiveNumber;
                }
                // Write as it is defined in the extended computable.
                original(parsed);
            }
        });

    // Process the initial value.
    interceptor(original());

    // Return this new writeable computed to "stand in front of" our original observable.
    return interceptor;
};
