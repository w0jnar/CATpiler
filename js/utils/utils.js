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
	_TokenArray = [];
	_TokenTotal = 1;
}