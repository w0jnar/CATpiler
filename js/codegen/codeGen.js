//
//codeGen.js
//

function generateCode()
{
	putMessage("~~~Now Starting Code Generation from AST");
	jsonCleaning(_ASTjson);
	//alert(JSON.stringify(_ASTjson));
	_Index = 0;
	for(var i = 0; i < _ASTjson.children.length; i++)
	{
		generateFromNode(_ASTjson.children[i]);
	}
	var codeSize = _GeneratedCode.length;
	for(var i = 0; i <= (_ProgramSize - codeSize - _Heap.length); i++)
	{
		_GeneratedCode[_Index++] = "00";
	}
	_GeneratedCode = _GeneratedCode.concat(_Heap);
	//alert(_GeneratedCode.length);
	putMessage(_GeneratedCode.join(" "));
}

function generateFromNode(jsonNode)
{
	var currentNodeName = jsonNode.name;
	if(currentNodeName === "print") //it is print, therefore it only has one child, the thing to print
	{
		generatePrint(jsonNode.children[0]);
	}
}

function generatePrint(printChildNode)
{
	var expressionArray = expressionInfo(printChildNode);//alert(typeof printChildNode.name);
	if(expressionArray[0] === "digit")
	{
		_GeneratedCode[_Index++] = "A0";
		if(expressionArray[1].toString(16).length === 1)
		{
			_GeneratedCode[_Index++] = "0" + expressionArray[1].toString(16);
		}
		else
		{
			_GeneratedCode[_Index++] = expressionArray[1].toString(16);
		}
		_GeneratedCode[_Index++] = "A2";
		_GeneratedCode[_Index++] = "01";
		_GeneratedCode[_Index++] = "FF";
	}
}

function expressionInfo(expressionNode)
{
	var currentExpression = expressionNode.name;
	var returnArray = [];
	if(currentExpression.match(/\d/))
	{
		returnArray = ["digit", currentExpression];
	}
	return returnArray;
}

function jsonCleaning(json)
{
	json.name = nameCleaning(json.name);
	for(var i = 0; i < json.children.length; i++)
	{
		jsonCleaning(json.children[i]);
	}
}