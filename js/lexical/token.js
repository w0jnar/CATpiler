//
//token.js
//

function Token()
{
	this.type = "NONE";
	this.value;
	this.position = 0;
	this.lineNumber = 0;
}

function createToken(token, type)
{
	currentToken = new Token();
	currentToken.type = type;
	currentToken.value = token;
	currentToken.position = _SymbolLineLocation;
	currentToken.lineNumber = _LineNumber;
	_TokenArray.push(currentToken);
	putMessage("---Token Number " + _TokenTotal++ + " created");
	putMessage("---Token Created of Type: " + type);
}