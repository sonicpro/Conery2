/*global ko, localStorage */

var Tekpub = Tekpub || {};
Tekpub.CartItem = function (options, callback) {

    var cartItem = {};
    var qty = (options.quantity || 1);
    cartItem.price = options.price || 0.00;

    // "asPositiveInteger" is a writable computable defined in "extensions.js" file.
    cartItem.quantity = ko.observable(qty).asPositiveInteger(1);

    cartItem.sku = options.sku || "";
    cartItem.description = options.description || "";

    cartItem.priceInPennies = function () {
        return cartItem.price * 100;
    };

    cartItem.subtotal = ko.computed(function () {
        return cartItem.price * cartItem.quantity();
    });

    cartItem.discount = ko.computed(function () {
        return cartItem.quantity() >= 5 ? cartItem.subtotal() * 0.2 : 0.0;
    });

    cartItem.lineTotal = ko.computed(function () {
        return cartItem.subtotal() - cartItem.discount();
    });

    // add "itemQuantityCheck" Tekpub.Cart function as a subscriber to quantity().
    // Notice that if "callback" constructor parameter is supplied, we do not call
    // it immediately, we just attach it as a "quantity()" subscription callback.
    if (callback) {
        cartItem.quantity.subscribe(callback.bind(null, cartItem));
    }

    return cartItem;
};

Tekpub.Cart = function () {
    var self = this;
    var stored = JSON.parse(localStorage.getItem("tekpubCart")) || [];
    self.items = ko.observableArray();

    // This function is a subscription callback for CartItem.quantity().
    // "item" parameter here is a CartItem instance rather the new quantity() value -
    // see how this function call is implemented in Tekpub.CartItem() function.
    self.itemQuantityCheck = function (item) {
        if (item && item.quantity() === 0) {
            self.items.remove(item);
        }
    };
    // Send the items that we load from storage through the CartItem constructor.
    self.items(ko.utils.arrayMap(stored, function (item) {
        return Tekpub.CartItem(item, self.itemQuantityCheck);
    }));

    // This bunction is bound to the button's "click",
    // "item" is populated from the button's "data-..." attributes.
    // See bingingHandlers.js.
    self.addItem = function (item) {
        var existing = self.find(item.sku);
        var items = self.items();

        if (existing) {
            existing.quantity(existing.quantity() + parseInt(item.quantity || 1, 10));
        } else {
            existing = Tekpub.CartItem(item, self.itemQuantitCheck);
            self.items.push(existing);
        }
        return existing;
    };

    self.rowCount = function () {
        return self.items().length;
    };

    self.remove = function (sku) {
        self.items.remove(function (item) {
            return item.sku == sku;
        });
    };

    self.removeClicked = function (item) {
        self.remove(item.sku);
    };

    self.itemCount = function () {
        var itemCount = 0;
        ko.utils.arrayForEach(self.items(), function (item) {
            itemCount += item.quantity();
        });
        return itemCount;
    };

    self.total = function () {
        var sum = 0;
        ko.utils.arrayForEach(self.items(), function (item) {
            sum += item.lineTotal();
        });
        return sum;
    };

    self.empty = function () {
        self.items([]);
    };

    self.find = function (sku) {
        return ko.utils.arrayFirst(self.items(), function (item) {
            return item.sku === sku;
        });
    };

    // Dirty tracking. The supplied function is fired anytime any
    // of the observables wrapped in self.items changes.
    // "throttle" extender with the "1" value provided supresses any
    // repeated supplied function calls for 1 millisecond.
    // This extender can be used with any ko.observable(), not only ko.computed().
    ko.computed(function () {
        // console.log("COMPUTED CALLED");
        localStorage.setItem("tekpubCart", ko.toJSON(self.items));
    }).extend({
        throttle: 1
    });

    self.hasItems = ko.computed(function () {
        return self.rowCount() > 0;
    });

    self.isNumber = function (n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };
};
