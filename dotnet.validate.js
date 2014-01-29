;// DotNet namespace
var DotNet = DotNet || {};
DotNet.Validate = DotNet.Validate || {};
(function ($, context) {
    // Properties
    context.Validation = context.Validation || {};
    context.Filtering = context.Filtering || {};
    context.Settings = context.Settings || {
        InvalidElementClass: "alert",
        InvalidImageHTML: '<i class="validator" style="display:none;" />',
        ValidationNamespaces: [".unos", ".tbl_unos", ".validation", ".datagrid"],
        ValidateEventNamespace: "validate",
        FilterEventNamespace: "filter",
        ElementsToValidate: ["input", "select", "textarea", "table"],
        ElementsToFilter: ["input"],
        ValidationKey: "data-validate",
        ValidateEvents: ["keyup", "keydown"],
        ValidateElementRange: function () {
            return $.map(context.Settings.ElementsToValidate, function (single) {
                return single + '[' + context.Settings.ValidationKey + ']';
            }).join(', ');
        },
        ValidateEventRange: function () {
            return $.map(context.Settings.ValidateEvents, function (single) {
                return single + "." + context.Settings.ValidateEventNamespace
            }).join(" ");
        },
        FilteringKey: "data-filter",
        FilterEvents: ["keyup", "input", "focus", "blur"],
        FilterElementRange: function () {
            return $.map(context.Settings.ElementsToFilter, function (single) {
                return single + '[' + context.Settings.FilteringKey + ']';
            }).join(', ');
        },
        FilterEventRange: function () {
            return $.map(context.Settings.FilterEvents, function (single) {
                return single + "." + context.Settings.FilterEventNamespace
            }).join(" ");
        }
    };
    
    // Default validation methods, probably don't need the element undefined check
    context.Validation.required = function (elem) {
        return (typeof elem == "undefined") || (elem.value.length > 0 && !elem.disabled);
    };

    context.Validation.checked = function (elem) {
        return (typeof elem == "undefined") || (elem.find("input:checked").length > 0);
    };

    context.Validation.length = function (elem) {
        var min = elem.attributes['data-min-length'].nodeValue;
        if (min == null || min == undefined)
        {
            min = 0;
        }

        var max = elem.attributes['data-max-length'].nodeValue;
        if (max == null || max == undefined) {
            max = 5000;
        }

        return RegExp("^.{" + min + "," + max + "}$", "g").test(elem.value);
    } 

    context.Validation.regex = function (elem) {
        var rx = elem.attributes['data-expression'].nodeValue;
        if (rx != undefined && rx != null && rx.length > 0) {
            return new RegExp(rx, "g").test(elem.value);
        }

        return true;
    }

    var check = function () {
        $(context.Settings.ValidateElementRange()).trigger('keyup.' + context.Settings.ValidateEventNamespace);
        return $('.' + context.Settings.InvalidElementClass).length == 0;
    };

    // Default filtering methods
    context.Filtering.numeric = function (elem) {
        var allow = elem.attributes['data-allow'].nodeValue;
        var str = elem.value;
        var re = "[^0-9";
        if (allow != undefined && allow != null && allow.length > 0) {
            re += allow;
        }

        var regex = RegExp(re + "]", "g");
        var newText = str.replace(regex, '');
        if (newText != elem.value) {
            elem.value = newText;
        }
    };

    // Validate handler
    $(document).on(context.Settings.ValidateEventRange(), context.Settings.ValidateElementRange(), function (event) {
        var element = $(this);
        var func = element.attr(context.Settings.ValidationKey).toLowerCase();
       
        if ((typeof context.Validation[func] != "undefined") && !element.is('input[type="submit"]') && !context.Validation[func].apply(this, element)) {
            element.addClass(context.Settings.InvalidElementClass);
        }
        else {
            element.removeClass(context.Settings.InvalidElementClass);
        }  
    });

    // Filter handler
    $(document).on(context.Settings.FilterEventRange(), context.Settings.FilterElementRange(), function (ev) {
        var element = $(this);
        var func = element.attr(context.Settings.FilteringKey).toLowerCase();

        if (typeof context.Filtering[func] != "undefined") {
            context.Filtering[func].apply(this, element);
        }
    });

    // Check handler
    $(document).on('click.' + context.Settings.ValidateEventNamespace, '[' + context.Settings.ValidationKey + '="check"]', function (ev) {
        var valid = check();
        if (!valid) {
            ev.preventDefault();
        }

        return valid;
    });

})(jQuery, DotNet.Validate);

/* Override/extend example */
/*
DotNet.Validate.Validation.checked = function (elem) {
    return (typeof elem == "undefined") || (elem.find("input:checked").length > 0);
};
*/