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
        ValidationGroupKey: "data-validation-group",
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
        },
        ElementsToExclude: ["[disabled]", ":hidden"],
        ExcludeRange: function () {
            return context.Settings.ElementsToExclude.join(", ");
        }
    };
    
    // Default validation methods
    context.Validation.required = function (elem) {
        return (typeof elem == "undefined") || (elem.value.length > 0 && !elem.disabled);
    };

    context.Validation.checked = function (elem) {
        return (typeof elem == "undefined") || (elem.find("input:checked").length > 0);
    };

    context.Validation.length = function (elem) {
        var min = elem.getAttribute('data-min-length');
        if (min == null || min == undefined)
        {
            min = 0;
        }

        var max = elem.getAttribute('data-max-length');
        if (max == null || max == undefined) {
            max = 5000;
        }

        return RegExp("^.{" + min + "," + max + "}$", "g").test(elem.value);
    }

    context.Validation.regex = function (elem) {
        var rx = elem.getAttribute('data-expression');
        if ((typeof rx != "undefined") && rx != null && rx.length > 0) {
            return new RegExp(rx, "g").test(elem.value);
        }

        return true;
    }

    context.Validation.selected = function (elem) {
        var ok = false;
        var vna = elem.getAttribute('data-value-not-allowed');
        var ina = elem.getAttribute('data-index-not-allowed');
        var va = elem.getAttribute('data-value-allowed');
        var val = elem.value;

        // Check selectedValue
        if ((typeof vna != "undefined") && vna != null && vna.length > 0) {
            if (val != vna) {
                ok = true;
            }
        }

        // Check selectedIndex
        if ((typeof ina != "undefined") && ina != null && ina.length > 0) {
            var ind = elem[0].selectedIndex;
            if ((typeof ind != "undefined") && ind != ina) {
                ok = true;
            }
        }

        if ((typeof va != "undefined") && va != null && va.length > 0) {
            if (val == va) {
               ok = true;
            }
        }

        return ok;
    }

    var check = function (elem) {
        var elementsRange = context.Settings.ValidateElementRange();
        var excludeRange = context.Settings.ExcludeRange();

        $(elementsRange).not(excludeRange).removeClass(context.Settings.InvalidElementClass);

        var validationGroups = elem.getAttribute(context.Settings.ValidationGroupKey);
        if (validationGroups != undefined && validationGroups != null && validationGroups.length > 0) {
            var validationGroupRange = '';
            validationGroups = validationGroups.split(' ');
            var len = validationGroups.length;
            for (var i = 0; i < len; i++) {
                validationGroupRange += $.map(context.Settings.ElementsToValidate, function (single) {
                    return single + '[' + context.Settings.ValidationGroupKey + '="' + validationGroups[i] + '"]';
                }).join(', ');

                if (i < (len - 1)) {
                    validationGroupRange += ", ";
                }
            }

            elementsRange = validationGroupRange;
            $(elementsRange).not(excludeRange).removeClass(context.Settings.InvalidElementClass);
        }

        $(elementsRange).not(excludeRange).trigger('keyup.' + context.Settings.ValidateEventNamespace);
        return $('.' + context.Settings.InvalidElementClass).length == 0;
    };

    // Default filtering methods
    context.Filtering.numeric = function (elem) {
        var allow = elem.getAttribute('data-allow');
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
        var valid = check(this);
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