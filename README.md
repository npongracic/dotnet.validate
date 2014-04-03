dotnet.validate
===============

Simple frontend validation library, originally intended for use with ASP.NET WebForms

Usage:

1. Include the dotnet.validate.js script somewhere on the page: 
	`<script src="js/netibis.validate.js" type="text/javascript"></script>`

2. Annotate the elements you want to validate with a data-validate="validation.function" tag:  
	`<asp:TextBox ID="txbRequired" data-validate="required" data-filter="numeric" data-allow=",. " Width="8em" MaxLength="8" runat="server"></asp:TextBox>`

3. Annotate the element you want to initiate the validation process (usually a button that submits the form) with a data-validate="check" tag:
	`<asp:Button ID="btnSubmit" runat="server" OnClick="btnSubmit_Click" data-validate="check" Text="Submit" class="btn"></asp:Button>`

4. That should do the trick!