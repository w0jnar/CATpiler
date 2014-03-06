//
//utils.js
//

function putMessage(msg)
{
	document.getElementById("taOutput").value += msg + "\n";
}

function reset()
{
	document.getElementById("taOutput").value = "";
	_SymbolLineLocation = 0;
	_LineNumber = 1;
	_ErrorCount = 0;
	_WarningCount = 0;
	_TokenList = [];
	_TokenTotal = 1;
	_EOFCount = 0;
	_Index = 0;
	_CurrentBlock = [];
	_SymbolTable = [];
	_SymbolTotal = 1;
}