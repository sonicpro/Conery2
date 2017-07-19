/*global ko, $ */

// custom binding for currency formatting (wrapper to text binding).
ko.bindingHandlers.currency = {
    update: function(element, valueAccessor) {
        // unwrap the amount (could be observable or not)
        var amount = parseFloat(ko.utils.unwrapObservable(valueAccessor())) || 0;

        // Could set the innerText/textContent directly or use $.text(),
        // but we will just let the real text binding handle it by passing it our formatted text.
        var newValueAccessor = function () {
            return "$" + amount.toFixed(2);
        };

        // Call real text binding.
        ko.bindingHandlers.text.update(element, newValueAccessor);
    }
};

// Wrapper to click binding. Call handler with object from data- attributes.
ko.bindingHandlers.clickWithData = {
    init: function(element, valueAccessor, allBindings, vm, context) {
        // Retrieve all the HTML5 data- attributes as a JavaScript object.
        var data = $(element).data(),
            // valueAccessor() call returns a vm function (Tekpub.Cart.addItem in our markup),
            // bind it to this as context and pass the data fetched from data- attributes
            // as an argument.
            boundHandler = valueAccessor().bind(this, data);

        delete data.bind; // remove the data-bind attribure's data pulled in in line 24.

        // call the real click binding.
        ko.applyBindingsToNode(element, { click: boundHandler });
    }
};

