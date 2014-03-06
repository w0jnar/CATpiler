//
//symbolTable.js
//

function Symbol()
{
	this.id = "NONE";
	this.value = "undefined";
	this.type = "undefined";
	this.lineNumber = 0;
	this.position = 0;
	this.scope = 0;
	
	this.setValue = setValue;
	function setValue(value)
	{
		this.value = value;
		putMessage("---Symbol " + _SymbolTable[_SymbolTable.length - 1].id + " assigned value " + value);
	}
	
	this.setType = setType;
	function setType(type)
	{
		this.type = type;
		putMessage("---Symbol " + _SymbolTable[_SymbolTable.length - 1].id + " assigned type " + type);
	}
}

function createSymbol(id, token)
{
	currentSymbol = new Symbol();
	currentSymbol.id = id;
	currentSymbol.lineNumber = token.lineNumber;
	currentSymbol.position = token.position;
	currentSymbol.scope = _CurrentBlock[_CurrentBlock.length - 1]; //peeks at the last element, determining the current scope.
	_SymbolTable.push(currentSymbol);
	putMessage("---Symbol number " + _SymbolTotal++ + " created");
	putMessage("---Symbol Created of with id: " + id);
}

function symbolToString(symbol)
{
	var outString = "";
	outString += "id: " + symbol.id;
	outString += ", value: " + symbol.value;
	outString += ", type:" + symbol.type;
	
	return outString;
}