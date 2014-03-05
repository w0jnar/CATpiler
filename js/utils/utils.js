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
}