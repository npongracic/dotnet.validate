dotnet.validate
===============

Simple frontend validation library, originally intended for use with ASP.NET WebForms.
Supports:
 - Unobtrusive (no javascript knowledge required, but recommended)
 - Validation groups (validate only certain elements in a group, supports multiple validation groups)
 - User extensible and configurable

Usage:

- Include the dotnet.validate.js script somewhere on the page: 
```html
<script src="js/dotnet.validate.js" type="text/javascript"></script>
```

- Annotate the elements you want to validate with a data-validate="validation.function" tag:  
```html
<asp:TextBox ID="txbRequired" data-validate="required" data-filter="numeric" data-allow=",. " Width="8em" MaxLength="8" runat="server"></asp:TextBox>
```

- Annotate the element you want to initiate the validation process (usually a button that submits the form) with a data-validate="check" tag:
```html
<asp:Button ID="btnSubmit" runat="server" OnClick="btnSubmit_Click" data-validate="check" Text="Submit" class="btn"></asp:Button>
```

- Profit!

extend with custom validation
===============
To extend the existing, preconfigured validation options, include your new extension script someplace after dotnet.validate.js:
```javascript
/* Override/extend example */
DotNet.Validate.Validation.testValidation = function (elem) {
 return (typeof elem == "undefined") || (elem.val() == "test");
};
 ```

Usage: 
```html
<input type="text" data-validate="test-validation" />
 ```
(It also automatically converts dash separated names to camelCase function names)
