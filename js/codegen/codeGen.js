//
//codeGen.js
//

function generateCode()
{
	putMessage("~~~Now Starting Code Generation from AST");
	jsonCleaning(_ASTjson);
	//alert(JSON.stringify(_ASTjson));
	_Index = 0;
	_CurrentScope = 0;
	for(var i = 0; i < _ASTjson.children.length; i++)
	{
		generateFromNode(_ASTjson.children[i]);
	}
	_GeneratedCode[_Index++] = "00";
	
	var currentTemp;
	var currentReplace;
	var currentTempString;
	for(var i = 0; i < _StaticData.length; i++)
	{
		_GeneratedCode[_Index++] = "00";
		currentTemp = _StaticData[i];
		currentTempString = currentTemp[_TempIndex];
		//alert((256).toString(16));
		//_Index
		currentReplace = hex2((_Index-1).toString(16));
		
		for(var j = 0; j < _GeneratedCode.length; j++)
		{
			if(_GeneratedCode[j] === currentTempString)
			{
				_GeneratedCode[j] = currentReplace[0];
				_GeneratedCode[j+1] = currentReplace[1];
			}
		}
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
	else if(currentNodeName === "varDecl")
	{
		generateVarDecl(jsonNode);
	}
	else if(currentNodeName === "assignment")
	{
		generateAssignment(jsonNode.children[0]); //equals sign node
	}
}

function generateVarDecl(varDeclNode)
{
	if(varDeclNode.children[0].name === "int")
	{
		createTemp(varDeclNode.children[1]);
		_GeneratedCode[_Index++] = "A9";
		_GeneratedCode[_Index++] = "00";
		_GeneratedCode[_Index++] = "8D";
		_GeneratedCode[_Index++] = _CurrentTemp;
		_GeneratedCode[_Index++] = "XX";
	}
}

function generateAssignment(equalNode)
{
	var currentTemp = getTemp(equalNode.children[0].name);
	var valueToStore = expressionInfo(equalNode.children[1])[1];
	if(valueToStore.length === 1)
	{
		valueToStore = 0 + valueToStore;
	}
	_GeneratedCode[_Index++] = "A9";
	_GeneratedCode[_Index++] = valueToStore;
	_GeneratedCode[_Index++] = "8D";
	_GeneratedCode[_Index++] = currentTemp[_TempIndex];
	_GeneratedCode[_Index++] = "XX";
}


function generatePrint(printChildNode)
{
	// var expressionArray = expressionInfo(printChildNode);//alert(typeof printChildNode.name);
	// if(expressionArray[0] === "int")
	// {
		// _GeneratedCode[_Index++] = "A0";
		// if(expressionArray[1].toString(16).length === 1)
		// {
			// _GeneratedCode[_Index++] = "0" + expressionArray[1].toString(16);
		// }
		// else
		// {
			// _GeneratedCode[_Index++] = expressionArray[1].toString(16);
		// }
		// _GeneratedCode[_Index++] = "A2";
		// _GeneratedCode[_Index++] = "01";
		// _GeneratedCode[_Index++] = "FF";
	// }
	if(isId(printChildNode.name))
	{
		var currentTemp = getTemp(printChildNode.name);
		_GeneratedCode[_Index++] = "AC";
		_GeneratedCode[_Index++] = currentTemp[_TempIndex];
		_GeneratedCode[_Index++] = "XX";
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
		returnArray = ["int", currentExpression];
	}
	else if(currentExpression.match(/\+/))
	{
		returnArray = checkIntExpr(expressionNode);
		//alert(checkIntExpr(expressionNode)[1]);
	}
	else if(currentExpression.match(/[a-z]/))
	{
		returnArray = checkId(expressionNode);
		//alert(returnArray[0]);
		//alert(returnArray[1]);
	}
	return returnArray;
}

function createTemp(node)
{
	var tempName;
	if(_CurrentTemp === 0)
	{
		_CurrentTemp = "T0";
	}
	else
	{
		_CurrentTemp = "T" + (parseInt(_currentTemp.slice(1, 2)) + 1).toString(16);
	}
	tempName = _CurrentTemp;
	var newTemp = [tempName, node.name, _CurrentScope, _Offset++];
	_StaticData.push(newTemp);
}

function getTemp(varName)
{
	var tempIndex;
	for(var i = 0; i < _StaticData.length; i++)
	{
		var currentTemp = _StaticData[i];
		if(currentTemp[_VarIndex] === varName && currentTemp[_ScopeIndex] === _CurrentScope)
		{
			tempIndex = i;
		}
	}
	return _StaticData[tempIndex];
}

function hex2(hexNum)
{
	//alert(typeof hexNum);
	var offset = 4 - hexNum.length;
	for(var i = 0; i < offset; i++)
	{
		hexNum = 0 + hexNum;
	}
	//alert(hexNum);
	hexNum = hexNum.toUpperCase();
	return [hexNum.slice(2,4), hexNum.slice(0,2)];
}

function jsonCleaning(json)
{
	json.name = nameCleaning(json.name);
	for(var i = 0; i < json.children.length; i++)
	{
		jsonCleaning(json.children[i]);
	}
}