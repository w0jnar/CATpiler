//
//token.js
//

function Token()
{
	this.type = "NONE";
	this.value;
	this.lineNumber = 0;
	this.position = 0;
}

function createToken(token, type)
{
	currentToken = new Token();
	currentToken.type = type;
	currentToken.value = token;
	currentToken.lineNumber = _LineNumber;
	currentToken.position = _SymbolLineLocation;
	_TokenList.push(currentToken);
	putMessage("---Token number " + _TokenTotal++ + " created");
	if(type === "digit" || type === "var_id")
	{
		putMessage("---Token Created of Type: " + type + ", value " + token);
	}
	else if(type === "string")
	{
		putMessage("---Token Created of Type: " + type + ", value \"" + token + "\"");
	}
	else
	{
		putMessage("---Token Created of Type: " + type);
	}
}

function tokenToString(token)
{
	var outString = "";
	outString += "type: " + token.type;
	outString += "\nvalue: " + token.value;
	outString += "\nline number: " + token.lineNumber;
	outString += "\nposition: " + token.position;
	alert(outString);
}