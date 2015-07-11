dotnet.validate
===============

Simple frontend validation library, originally intended for use with ASP.NET WebForms.
Supports:
 - Unobtrusive (no javascript knowledge required, but recommended)
 - Validation groups
 - User extensible and configurable

Usage:

1. Include the dotnet.validate.js script somewhere on the page: 
	`<script src="js/dotnet.validate.js" type="text/javascript"></script>`

2. Annotate the elements you want to validate with a data-validate="validation.function" tag:  
	`<asp:TextBox ID="txbRequired" data-validate="required" data-filter="numeric" data-allow=",. " Width="8em" MaxLength="8" runat="server"></asp:TextBox>`

3. Annotate the element you want to initiate the validation process (usually a button that submits the form) with a data-validate="check" tag:
	`<asp:Button ID="btnSubmit" runat="server" OnClick="btnSubmit_Click" data-validate="check" Text="Submit" class="btn"></asp:Button>`

4. Profit!

PS: To extend the existing, preconfigured validation options include your new extension script after dotnet.validate.js:
`
/* Override/extend example */
 DotNet.Validate.Validation.testValidation = function (elem) {
 return (typeof elem == "undefined") || (elem.val() == "test");
 };
 `

Usage: data-validate="test-validation"
It also automatically converts dash separated names to camelCase function names.
