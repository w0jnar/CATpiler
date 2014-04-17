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
	
	_CSTjson ={};
	_ASTjson ={};
	_NonTokenNodeCount = 0;
	clearDiv("infovis");
	clearDiv("infovisAST");
	
	_SymbolTable = [];
	_CurrentScope = 0;
}

function clearDiv(divID)
{
	document.getElementById(divID).innerHTML = "";
}