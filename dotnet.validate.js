;// DotNet namespace
var DotNet = DotNet || {};

DotNet.Validate = DotNet.Validate || {};
(function ($, context) {

  var zadnjaPorukaGreske = 'Please fill in the required fields!';

  // Properties
  context.Validation = context.Validation || {};
  context.Filtering = context.Filtering || {};
  context.Engine = context.Engine || {};

  context.Settings = context.Settings || {
    InvalidElementClass: "alert",
    InvalidImageClass: 'validator',
    InvalidImageHTML: '<i class="validator" style="display:none;" />',
    ValidationNamespaces: [".unos", ".tbl_unos", ".validation", ".datagrid"],
    ValidateEventNamespace: "validate",
    FilterEventNamespace: "filter",
    ElementsToValidate: ["input", "select", "textarea", "table","span"],
    ElementsToFilter: ["input"],
    ValidationKey: "data-validate",
    ValidationGroupKey: "data-validation-group",
    ValidateEvents: ["keyup", "keydown", "blur"],
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
    ValidateAlertRange: function () {
      return $.map(context.Settings.ValidationNamespaces, function (single) {
        return single + " ." + context.Settings.InvalidElementClass
      }).join(", ");
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
    /**
     * @return {string}
     */
    ExcludeRange: function () {
      return context.Settings.ElementsToExclude.join(", ");
    },
    DateValidMin: 1900,
    DateValidMax: 2100
  };

  // This is the validation engine
  context.Engine.validate = function (element) {
    var parent = element.parent();
    var validator = parent.find('.' + context.Settings.InvalidImageClass);

    var func = ToCamelCase(element.attr(context.Settings.ValidationKey));
    var validationFunctions = func.split(" ");

    for (var i = 0; i < validationFunctions.length; i++) {
      if ((typeof context.Validation[validationFunctions[i]] != "undefined") && !element.is('input[type="submit"]') && !context.Validation[validationFunctions[i]].call(this, element)) {
        element.addClass(context.Settings.InvalidElementClass);

        var poruka = element.attr("data-validate-message");
        if (poruka != undefined && poruka != null)
        {
          zadnjaPorukaGreske = poruka;
        }

        if (!parent.children("i").hasClass("validator")) {
          parent.append(context.Settings.InvalidImageHTML);
        }
        parent.css('white-space', 'nowrap');
        validator = parent.find('.' + context.Settings.InvalidImageClass);
        validator.css('display', 'inline-block');
        break;
      }
      else {
        element.removeClass(context.Settings.InvalidElementClass);
        validator.hide();
      }
    }
  };

  // Default validation methods
  context.Validation.required = function (elem) {
    if ($(elem).is('span')) {
      return true;
    } else {
      return (typeof elem == "undefined") || (elem.val().length > 0 && !elem.disabled);
    }
  };

  context.Validation.checked = function (elem) {
    return (typeof elem == "undefined") || (elem.find("input:checked").length > 0);
  };

  context.Validation.percentage = function (elem) {
    $(elem).attr('data-filter', 'numeric');
    $(elem).attr('data-allow', '-,.');

    var reg = new RegExp("^[+-]?\\d+(\\,\\d{1,2})?$");
    var reg2 = new RegExp("^[+-]?\\d+(\\.\\d{1,2})?$");
    var val = $(elem).val();

    if (val.length > 0 && (reg.test(val) || reg2.test(val))) {

      var split = val.split(',');

      if (parseInt(split[0]) > 100) return false;

      if (parseInt(split[1]) > 0 && parseInt(split[0]) == 100) return false;

    } else {
      return false;
    }

    return true;

  };

  context.Validation.length = function (elem) {
    var length = $(elem).val().length;
    var min = $(elem).attr('data-min-length');
    if (min == null || min == undefined) {
      min = 0;
    }

    var max = $(elem).attr('data-max-length');
    if (max == null || max == undefined) {
      max = 5000;
    }

    return !!(length > min && length < max);
  };

  context.Validation.regex = function (elem) {
    var el = $(elem);
    var rx = el.attr('data-expression');
    if ((typeof rx != "undefined") && rx != null && rx.length > 0) {
      return new RegExp(rx, "g").test(el.val());
    }

    return true;
  };

  context.Validation.checkedList = function (elem) {
    var cb_grupa = $(elem).attr('data-validate-checked-group');
    if (cb_grupa != null && cb_grupa != undefined && cb_grupa.length > 0) {
      var checkBoxevi = $('span[data-validate-checked-group="' + cb_grupa + '"] input').not(":disabled, :hidden");
      if (checkBoxevi == undefined || checkBoxevi == null || checkBoxevi.length == 0) {
        checkBoxevi = $('table[data-validate-checked-group="' + cb_grupa + '"] input').not(":disabled, :hidden");
      }

      if (checkBoxevi != undefined && checkBoxevi != null && checkBoxevi.length > 0) return checkBoxevi.is(':checked');
    }
  };

  context.Validation.checkedlist = function (elem) { return context.Validation.checkedList(elem); };

  context.Validation.mutuallyExclusive = function (elem) {
    var cb_grupa = $(elem).attr('data-validate-cb-group');
    var group_elements = $('span[data-validate="mutuallyExclusive"][data-validate-cb-group="' + cb_grupa + '"] input').not(":disabled, :hidden");
    var odabrani = $(elem); 
    var brojac = 0; 

    if (group_elements != undefined) {
      group_elements.each(function (index) {
        if ($(this).is(':checked')) brojac++;
      });
    }

    return brojac <= 1;
  };

  context.Validation.mutuallyexclusive = function (elem) { return context.Validation.mutuallyExclusive(elem); };

  context.Validation.onlyOneOfGroupAllowed = function (elem) {
    var brojElemenataSaVrijednosti = 0;
    var imeGrupe = $(elem).attr('data-validate-ogr-group');
    var elementiGrupe = $('input[data-validate="only-one-of-group-allowed"][data-validate-ogr-group="' + imeGrupe + '"]');
    if (elementiGrupe != null && elementiGrupe != undefined && elementiGrupe.length > 0) {
      $.each(elementiGrupe, function () {
        if ($(this).val()) {
          brojElemenataSaVrijednosti++;
        }
      });
    }

    return brojElemenataSaVrijednosti <= 1;
  };

  context.Validation.onlyoneofgroupallowed = function (elem) { return context.Validation.onlyOneOfGroupAllowed(elem); };

  context.Validation.oneOfGroupRequired = function (elem) {
    var brojElemenataSaVrijednosti = 0;
    var imeGrupe = $(elem).attr('data-validate-ogr-group');
    var elementiGrupe = $('input[data-validate="one-of-group-required"][data-validate-ogr-group="' + imeGrupe + '"]');
    if (elementiGrupe != null && elementiGrupe != undefined && elementiGrupe.length > 0) {
      $.each(elementiGrupe, function () {
        if ($(this).val()) {
          brojElemenataSaVrijednosti++;
        }
      });
    }

    return brojElemenataSaVrijednosti >= 1;
  };

  context.Validation.oneofgrouprequired = function (elem) { return context.Validation.oneOfGroupRequired(elem); };

  context.Validation.filledElement = function (elem) {
    var ispravan = true;
    var imeGrupe = $(elem).attr('data-validate-filledtext-group');
    if (imeGrupe != undefined && imeGrupe != null && imeGrupe.length > 0) {
      var elementiGrupe = $('input:text[data-validate-filledtext-group="' + imeGrupe + '"]');
      if (elementiGrupe != undefined && elementiGrupe != null && elementiGrupe.length > 0) {
        $.each(elementiGrupe, function () {
          if ($(this).val() == "") ispravan = false;
        });
      }
    }

    return ispravan;
  };

  context.Validation.filledelement = function (elem) { return context.Validation.filledElement(elem); };

  context.Validation.time = function (elem) {
    $(elem).attr("data-allow", ":");
    return !!timeCheck($(elem).val());
  };

  context.Validation.date = function (elem) {
    var el = $(elem);
    var ispravan = false;
    var value = el.val();
    var obavezan = el.attr("data-is-required") == "true";

    if (!obavezan) {
      ispravan = dateCheck(value);
    } else {
      if (value == "__.__.____" || value.length == 0)
      {
        ispravan = false;
      }
      else
      {
        ispravan = dateCheck(value);
      }
    }

    var buduci = el.attr('data-date-in-future');
    var prosli = el.attr('data-date-in-past');
    //var period = $(elem).attr('data-date-range');

    var trenutniDatum = new Date();
    trenutniDatum.setHours(0, 0, 0, 0);
    var uneseniDatum = new Date(value.substring(6, 10), value.substring(3, 5), value.substring(0, 2), 0, 0, 0, 0);
    //var uneseniDatum = Date.parse(value);
    //uneseniDatum.setHours(0, 0, 0, 0);

    if (buduci !== null && buduci !== undefined) {
      //if (buduci == "true" && trenutniDatum >= uneseniDatum) ispravan = true;
      if (buduci == "false" && uneseniDatum > trenutniDatum) ispravan = false;
    }

    if (prosli !== null && prosli !== undefined) {
      //if (prosli == "true" && trenutniDatum <= uneseniDatum) ispravan = false;
      if (prosli == "false" && uneseniDatum < trenutniDatum) ispravan = false;
    }

    try {
      var compareMethod = ">";
      var compareType = el.attr('data-compare-type');
      if (compareType != null && compareType != undefined && compareType.length > 0) {
        compareMethod = compareType;
      }

      var target = el.attr('data-compare-target');
      if (target != null && target != undefined && target.length > 0) {
        var targetElement = $("[name$=" + target + "]");
        var targetRequired = el.attr('data-compare-target-required');
        if (targetRequired != null && targetRequired != undefined && targetRequired.length > 0 && targetRequired == "true") {
          if (value.length > 0 && value != "__.__.____") {
            if (targetElement.val().length == 0 || targetElement.val() == "__.__.____") {
              ispravan = false;
            }
          }
        }

        if (ispravan) {
          var targetDate = targetElement.val().split('.');
          var elementDate = value.split('.');

          // Ovo je inače zlo ali treba nam malo zla
          if (!eval("new Date(" + targetDate[2] + "," + targetDate[1] + "," + targetDate[0] + ") " + compareMethod +
            " new Date(" + elementDate[2] + "," + elementDate[1] + "," + elementDate[0] + ")")) {
            ispravan = false;
          }
        }
      }
    }
    catch (exc) { }

    return ispravan;
  };

  context.Validation.fixedNumber = function (elem) {
    var ispravan = false;
    var obvezno = $(elem).attr('data-is-required');
    $(elem).attr('data-filter', 'numeric');

    var minCijeli = $(elem).attr('data-min-whole');
    if (minCijeli == undefined || minCijeli == null) minCijeli = 1;

    var maxCijeli = $(elem).attr('data-max-whole');
    if (maxCijeli == undefined || maxCijeli == null) maxCijeli = 25;

    try {
      var reg = new RegExp("^[0-9]{" + minCijeli + "," + maxCijeli + "}?$");

      if (reg.test($(elem).val())) {
        ispravan = true;
      }

      if ($(elem).val().length == 0) {
        ispravan = true;
      }

      if (obvezno !== null && obvezno !== undefined) {
        if (obvezno == "true" && $(elem).val().length == 0) ispravan = false;
      }
    } catch (e) { }

    return ispravan;
  };

  context.Validation.decimal = function (elem) {
    var value = $(elem).val();
    var obvezno = $(elem).attr('data-is-required');
    var ispravno = false;

    if ($(elem).attr('data-filter') === undefined || $(elem).attr('data-filter') === null) $(elem).attr('data-filter', 'numeric');

    if ($(elem).attr('data-allow') === undefined || $(elem).attr('data-allow') === null) $(elem).attr('data-allow', ',.-');

    if ($(elem).attr('data-align') === undefined || $(elem).attr('data-align') === null) $(elem).css('text-align', 'right');

    var min_cijeli = $(elem).attr("data-min-whole");
    if (min_cijeli === undefined || min_cijeli === null) {
      min_cijeli = 1;
    }

    var max_cijeli = $(elem).attr("data-max-whole");
    if (max_cijeli === undefined || max_cijeli === null) {
      max_cijeli = 25;
    }

    var min_decimalni = $(elem).attr("data-min-decimal");
    if (min_decimalni === undefined || min_decimalni === null) {
      min_decimalni = 0;
    }

    var max_decimalni = $(elem).attr("data-max-decimal");
    if (max_decimalni === undefined || max_decimalni === null) {
      max_decimalni = 2;
    }

    var brBezTocaka = value.replace(/\.+/g, '');

    try {
      var reg1 = new RegExp("^[+-]?[0-9]{" + min_cijeli + "," + max_cijeli + "}(\\,[0-9]{" + min_decimalni + "," + max_decimalni + "})?$");

      ispravno = !!reg1.test(brBezTocaka);
    }
    catch (exc) { }

    if (ispravno) {
      var reg = new RegExp("^[+-]?[0-9]{1,3}(?:\.?[0-9]{3})*(?:\,[0-9]{" + min_decimalni + "," + max_decimalni + "})?$");
      ispravno = !!reg.test(value);
    }

    if (value.length == 0) {
      ispravno = true;
    }

    if (obvezno !== undefined && obvezno !== null) {
      if (obvezno == "true" && value.length == 0) {
        ispravno = false;
      }
    }

    return ispravno;
  };

  context.Validation.currency = function (elem) { return context.Validation.decimal(elem); };

  context.Validation.selected = function (elem) {
    var ok = false;
    var vna = $(elem).attr('data-value-not-allowed');
    var ina = $(elem).attr('data-index-not-allowed');
    var va = $(elem).attr('data-value-allowed');
    var val = $(elem).val();

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

    //Check if selected value is equal to allowed value
    if ((typeof va != "undefined") && va != null && va.length > 0) {
      if (val == va) {
        ok = true;
      }
    }

    return ok;
  };

  context.Validation.domain = function (elem) {
    var ok = true;
    var valid = $(elem).find(":selected").attr('data-valid');

    // Check if valid =0
    if ((typeof valid != "undefined") && valid != null && valid.length > 0) {
      if (valid == "0") {
        ok = false;
      }
    }

    return ok;
  };

  context.Engine.check = function (elem) {
    zadnjaPorukaGreske = 'Popunite obavezna polja!';
    var el = $(elem);
    var elementsRange = context.Settings.ValidateElementRange();
    var excludeRange = context.Settings.ExcludeRange();
    var alertRange = context.Settings.ValidateAlertRange();

    $('.' + context.Settings.InvalidImageClass).hide();
    $(elementsRange).not(excludeRange).removeClass(context.Settings.InvalidElementClass);

    var validationGroups = el.attr(context.Settings.ValidationGroupKey);
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
    return $(alertRange).length == 0;
  };

  // Default filtering methods
  context.Filtering.numeric = function (elem) {
    var allow = $(elem).attr('data-allow');
    var str = $(elem).val();
    var re = "[^0-9";
    if (allow != undefined && allow != null && allow.length > 0) {
      re += allow;
    }

    var regex = new RegExp(re + "]", "g");
    var newText = str.replace(regex, '');
    if (newText != $(elem).val()) {
      $(elem).val(newText);
    }
  };

  // Default filtering methods
  context.Filtering.alpha = function (elem) {
    var str = $(elem).val();
    var re = "[0-9]";

    var regex = new RegExp(re, "g");
    var newText = str.replace(regex, '');

    if (newText != $(elem).val()) {
      $(elem).val(newText);
    }
  };

  context.Filtering.time = function (elem) {
    var allow = $(elem).attr('data-allow');
    var str = $(elem).val();
    var re = "[^0-9:";
    if (allow != undefined && allow != null && allow.length > 0) {
      re += allow;
    }

    var regex = new RegExp(re + "]", "g");
    var newText = str.replace(regex, '');
    if (newText != $(elem).val()) {
      $(elem).val(newText);
    }
  };


  // Validate handler
  $(document).on(context.Settings.ValidateEventRange(), context.Settings.ValidateElementRange(), function (event) {
    var element = $(this);
    context.Engine.validate(element);
  });

  // Ovo mora biti za checkboxe i radiobuttonliste, no ne za ostale elemente
  $(document).on("click.validate " + context.Settings.ValidateEventRange(),
    $.map(['span', 'table'], function (single) { return single + '[' + context.Settings.ValidationKey + ']'; }).join(', '),
    function (event) {
      var element = $(this);
      var cb_group_name = $(this).attr('data-validate-checked-group');

      if (cb_group_name != undefined && cb_group_name != null && cb_group_name.length > 0) {
        element = $('.content span[data-validate-checked-group="' + cb_group_name + '"]');
        if (element == undefined || element == null || element.length == 0) {
          element = $('.content table[data-validate-checked-group="' + cb_group_name + '"]');
        }
      }

      context.Engine.validate(element);
    }
  );

  // Filter handler
  $(document).on(context.Settings.FilterEventRange(), context.Settings.FilterElementRange(), function (ev) { 
    var element = $(this);
    var func = element.attr(context.Settings.FilteringKey).toLowerCase();

    if (typeof context.Filtering[func] != "undefined") {
      context.Filtering[func].call(this, element);
    }
  });

  // Check handler
  $(document).on('click.' + context.Settings.ValidateEventNamespace, '[' + context.Settings.ValidationKey + '="check"]', function (ev) {
    var valid = context.Engine.check(this);
    if (!valid) {
      ev.preventDefault();
      $("." + context.Settings.InvalidElementClass).first().focus();

      // Do something else, like show a popup
    }
    
    return valid;
  });
  
  /**
   * @return {string}
   */
  function ToCamelCase(input) {
    if (input.indexOf('-') != -1 || input.indexOf('.') != -1 || input.indexOf('(') != -1 || input.indexOf(')') != -1) {
      return input.toLowerCase().replace(/-(.)/g, function (match, group1) {
        return group1.toUpperCase();
      });
    } else {
      return input;
    }
  }

  function timeCheck(timeString) {
    var pos1 = timeString.indexOf(':');
    var strSati = timeString.substring(0, pos1);
    var strMinute = timeString.substring(pos1 + 1, timeString.length);
    if (strSati.charAt(0) == "0" && strSati.length > 1) strSati = strSati.substring(1);
    if (strMinute.charAt(0) == "0" && strMinute.length > 1) strMinute = strMinute.substring(1);

    var Minute = parseInt(strMinute);
    var Sati = parseInt(strSati);
    if (pos1 == -1) return false;
    if (strMinute.length < 1 || Minute < 0 || Minute > 59) return false;
    return !(strSati.length < 1 || Sati < 0 || Sati > 23);    
  }

  function DaysArray(n) {
    for (var i = 1; i <= n; i++) {
      this[i] = 31;
      if (i == 4 || i == 6 || i == 9 || i == 11) { this[i] = 30 }
      if (i == 2) { this[i] = 29 }
    }
    return this
  }

  function provjeriVeljacu(godina) {
    return (((godina % 4 == 0) && ((!(godina % 100 == 0)) || (godina % 400 == 0))) ? 29 : 28);
  }

  function stripCharsInBag(s, bag) {
    var i;
    var returnString = "";
    // Search through string's characters one by one.
    // If character is not in bag, append to returnString.
    for (i = 0; i < s.length; i++) {
      var c = s.charAt(i);
      if (bag.indexOf(c) == -1) returnString += c;
    }
    return returnString;
  }

  function isInteger(s) {
    var i;
    for (i = 0; i < s.length; i++) {
      // Check that current character is number.
      var c = s.charAt(i);
      if (((c < "0") || (c > "9"))) return false;
    }
    // All characters are numbers.
    return true;
  }

  function dateCheck(datumString) {
    if (datumString == "__.__.____" || datumString.length == 0)
    {
      return true;
    }

    var daniUMjesecu = new DaysArray(12);
    var pos1 = datumString.indexOf('.');
    var pos2 = datumString.indexOf('.', pos1 + 1);

    var strDan = datumString.substring(0, pos1);
    var strMjesec = datumString.substring(pos1 + 1, pos2);
    var strGodina = datumString.substring(pos2 + 1, datumString.length);

    var Dan = parseInt(strDan, 10);
    var Mjesec = parseInt(strMjesec, 10);
    var Godina = parseInt(strGodina, 10);

    if (pos1 < 0 || pos2 < 0) return false;
    if (strMjesec.length < 1 || Mjesec < 1 || Mjesec > 12) return false;
    if (strDan.length < 1 || Dan < 1 || (Mjesec == 2 && Dan > provjeriVeljacu(Godina)) || Dan > daniUMjesecu[Mjesec]) return false;
    if (strGodina.length != 4 || Godina == 0 || Godina < context.Settings.DateValidMin || Godina > context.Settings.DateValidMax) return false;

    return !(datumString.indexOf('.', pos2 + 1) != -1 || isInteger(stripCharsInBag(datumString, '.')) == false);

    
  }

  function addCommas(nStr) {
    nStr += '';
    var x = nStr.split(',');

    //x = x.replace(/^0+/, '');
  
    var x1;
    if (x[0].length > 0 && x[0] != "0") {
      x1 = x[0].replace(/^0+/, '');
    }
    else {
      x1 = x[0];
    }
  
    var x2 = x.length > 1 ? ',' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + '.' + '$2');
    }
  
    var rezultat;
    rezultat = x1 + x2;
    if (x.length == 1) {
      rezultat = rezultat + ',00';
    }
    else if (x[1].length == 1) {
      rezultat = rezultat + '0';
    }
    else if (x[1].length > 2) {
      var vishak = x[1].length - 2;
      rezultat.slice(rezultat.length - vishak, rezultat.length);
    }

    return rezultat;
  }

  //FORMAT//
  $(document).on('blur.customFormat', 'input[custom-format], textarea[custom-format], input[data-custom-format], textarea[data-custom-format]', function (ev) { 
    var elem = $(this);
    var tip = elem.attr('custom-format').toLowerCase();
    if (tip == null || tip == undefined || tip.length == 0) {
      tip = elem.attr('data-custom-format').toLowerCase();
    }

    switch (tip) {
      case "currency":
      case "iznos":
        var str = elem.val();

        if (str != "") {
          str = str.replace(/\./g, '');
          var noviText = addCommas(str);
          if (noviText != elem.val()) {
            elem.val(noviText);
          }
        }
        break;
    }
  });


})(jQuery, DotNet.Validate);


/* Override/extend example */
/*
 DotNet.Validate.Validation.test = function (elem) {
 return (typeof elem == "undefined") || (elem.val() == "test");
 };
 */
