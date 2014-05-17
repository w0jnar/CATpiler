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
	_CurrentScopeId = 0;
	for(var i = 0; i < _ASTjson.children.length; i++)
	{
		generateFromNode(_ASTjson.children[i]);
	}
	_GeneratedCode[_Index++] = "00";
	
	var currentTemp;
	var currentReplace;
	var currentTempString;
	putMessage("-Backpatching");
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
	
	putMessage("-Checking if code is valid");
	if((_GeneratedCode.length + _Heap.length) <= (_ProgramSize + 1))
	{
		putMessage("Code is valid!");
		putMessage("-Filling space with \"00\" as needed");
		var codeSize = _GeneratedCode.length;
		for(var i = 0; i <= (_ProgramSize - codeSize - _Heap.length); i++)
		{
			_GeneratedCode[_Index++] = "00";
		}
		putMessage("-Joining Heap to Code");
		_GeneratedCode = _GeneratedCode.concat(_Heap);
		//alert(_GeneratedCode.length);
		putMessage("~~~Ending Code Generation");
		putMessage("-Output code:");
		//putMessage(_GeneratedCode.join(" "));
		for(var i = 0; i < _GeneratedCode.length; i+=16)
		{
			putMessage(_GeneratedCode[i] + " " + _GeneratedCode[i + 1] + " " 
											   + _GeneratedCode[i + 2] + " " 
											   + _GeneratedCode[i + 3] + " " 
											   + _GeneratedCode[i + 4] + " "
											   + _GeneratedCode[i + 5] + " " 
											   + _GeneratedCode[i + 6] + " " 
											   + _GeneratedCode[i + 7] + "   "
											   + _GeneratedCode[i + 8] + " " 
											   + _GeneratedCode[i + 9] + " " 
											   + _GeneratedCode[i + 10] + " " 
											   + _GeneratedCode[i + 11] + " "
											   + _GeneratedCode[i + 12] + " " 
											   + _GeneratedCode[i + 13] + " " 
											   + _GeneratedCode[i + 14] + " "
											   + _GeneratedCode[i + 15]);
		}
		window.prompt("Output code (can also be copied from output):", _GeneratedCode.join(" "));
	}
	else
	{
		putMessage("~~~CODE GENERATION ERROR too much code for supported operation");
	}
}

function generateFromNode(jsonNode)
{
	var currentNodeName = jsonNode.name;
	if(currentNodeName === "print") //it is print, therefore it only has one child, the thing to print.
	{
		generatePrint(jsonNode.children[0]);
	}
	else if(currentNodeName === "varDecl")
	{
		generateVarDecl(jsonNode);
	}
	else if(currentNodeName === "assignment")
	{
		generateAssignment(jsonNode.children[0]); //equals sign node.
	}
	else if(currentNodeName === "stmtBlock")
	{
		generateBlock(jsonNode); //entire node to pass all of the children.
	}
}

function generateVarDecl(varDeclNode)
{
	putMessage("-Generating Variable Declaration Code");
	createTemp(varDeclNode.children[1]);
	_GeneratedCode[_Index++] = "A9";
	_GeneratedCode[_Index++] = "00";
	_GeneratedCode[_Index++] = "8D";
	_GeneratedCode[_Index++] = _CurrentTemp;
	_GeneratedCode[_Index++] = "XX";
}

function generateAssignment(equalNode)
{
	putMessage("-Generating Assignment Code");
	var currentTemp = getTemp(equalNode.children[0].name, _CurrentScopeId);
	var valueToStore = expressionInfo(equalNode.children[1])[1];
	if(valueToStore.match(/^\"/)) //if the value is from an id and is a string literal
	{
		valueToStore = allocateHeap(valueToStore)[1];
	}
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
	putMessage("-Generating Print Code");
	var expressionArray = expressionInfo(printChildNode);//alert(typeof printChildNode.name);
	//alert(expressionArray[0]);
	if(isId(printChildNode.name) && checkId(printChildNode)[0] === "int")
	{
		var currentTemp = getTemp(printChildNode.name, _CurrentScopeId);
		_GeneratedCode[_Index++] = "AC";
		_GeneratedCode[_Index++] = currentTemp[_TempIndex];
		_GeneratedCode[_Index++] = "XX";
		_GeneratedCode[_Index++] = "A2";
		_GeneratedCode[_Index++] = "01";
		_GeneratedCode[_Index++] = "FF";
	}
	else if(isId(printChildNode.name) && checkId(printChildNode)[0] === "string") //string id
	{
		var currentTemp = getTemp(printChildNode.name, _CurrentScopeId);
		_GeneratedCode[_Index++] = "AC";
		_GeneratedCode[_Index++] = currentTemp[_TempIndex];
		_GeneratedCode[_Index++] = "XX";
		_GeneratedCode[_Index++] = "A2";
		_GeneratedCode[_Index++] = "02";
		_GeneratedCode[_Index++] = "FF";
	}
	else if(expressionArray[0] === "digit") //digit constant
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
	else if(expressionArray[0] === "string") //string constant
	{
		_GeneratedCode[_Index++] = "A0";
		_GeneratedCode[_Index++] = expressionArray[1];
		_GeneratedCode[_Index++] = "A2";
		_GeneratedCode[_Index++] = "02";
		_GeneratedCode[_Index++] = "FF";
	}
	//alert(checkId(printChildNode)[0] === "string");
}

function generateBlock(blockNode)
{
	_CurrentScope++;
	_LastScopeIdStack.push(_CurrentScopeId);
	_CurrentScopeId = _CurrentScope;
	for(var i = 0; i < blockNode.children.length; i++)
	{
		generateFromNode(blockNode.children[i]);
	}
	_CurrentScopeId = _LastScopeIdStack.pop(_CurrentScopeId);
}

function expressionInfo(expressionNode)
{
	var currentExpression = expressionNode.name;
	var returnArray = [];
	if(currentExpression.match(/\d/))
	{
		returnArray = ["digit", currentExpression];
	}
	else if(currentExpression.match(/\+/))
	{
		returnArray = generateIntExpr(expressionNode);
	}
	else if(currentExpression.match(/^\"/))
	{
		returnArray = allocateHeap(currentExpression);
	}
	else if(currentExpression.match(/[a-z]/))
	{
		returnArray = checkId(expressionNode);
		//alert(returnArray[0]);
		//alert(returnArray[1]);
	}
	return returnArray;
}

function generateIntExpr(plusNode)
{
	//create a new temp to store the right side
	var temp = new actualTemp(_TempNames.toString());
	_TempNames++;
	createTemp(temp);
	var tempToStoreAcc = getTemp(temp.name, _CurrentScopeId);
	//store left side recursively in memory.
	var expressionArrayRight = expressionInfo(plusNode.children[1]);
	var valueToStore = expressionArrayRight[1];
	//alert(valueToStore);
	var expressionArray = expressionInfo(plusNode.children[0]);
	//alert(expressionArray[1]);
	return ["digit", (parseInt(valueToStore,16) + parseInt(expressionArray[1],16)).toString(16)];
	
	
	
}

function createTemp(node)
{
	putMessage("-Creating Temporary Variable " + node.name);
	var tempName;
	if(_CurrentTemp === 0)
	{
		_CurrentTemp = "T0";
	}
	else
	{
		_CurrentTemp = "T" + (parseInt(_CurrentTemp.slice(1, 2)) + 1).toString(16);
	}
	tempName = _CurrentTemp;
	var newTemp = [tempName, node.name, _CurrentScopeId, _Offset++];
	_StaticData.push(newTemp);
}

function allocateHeap(string)
{
	
	var stringWithoutQuotes = string.slice(1, string.length);
	stringWithoutQuotes = stringWithoutQuotes.slice(0, stringWithoutQuotes.length - 1);
	//alert(stringWithoutQuotes);
	var heapCheck = existInHeap(stringWithoutQuotes);
	if(!heapCheck[0]) //if it does not exist in the heap
	{
		putMessage("-Allocating Heap Space for String " + string);
		_Heap.unshift("00");
		var stringArray = [];
		for(var i = 0; i < stringWithoutQuotes.length; i++)
		{
			stringArray.push(stringWithoutQuotes.slice(i,i+1).charCodeAt(0).toString(16).toUpperCase());
		}
		_Heap = stringArray.concat(_Heap);
		//_HeapPointer++;
		_HeapPointer = _HeapPointer - stringWithoutQuotes.length;
		var returnArray = ["string", _HeapPointer.toString(16).toUpperCase()];
		_HeapPointer--;
		return returnArray;
	}
	else
	{
		return ["string", heapCheck[1].toString(16).toUpperCase()];
	}
}

function existInHeap(stringToFind)
{
	var pointer;
	var offset;
	var stringCharAsHex = stringToFind.slice(0,1).charCodeAt(0).toString(16).toUpperCase();
	for(var i = 0; i < _Heap.length; i++)
	{
		//alert(stringCharAsHex);
		//alert(_Heap[i]);
		if(stringCharAsHex === _Heap[i])
		{
			pointer = _Heap.length - i;
			//alert(pointer);
			var booleanCheck = false;
			for(var j = 0; j < stringToFind.length; j++)
			{
				stringCharAsHex = stringToFind.slice(j,j+1).charCodeAt(0).toString(16).toUpperCase();
				//alert(stringCharAsHex);
				//alert(_Heap[i + j]);
				if(stringCharAsHex === _Heap[i + j])
				{
					booleanCheck = true;
				}
				else
				{
					booleanCheck = false;
					break;
				}
			}
			if(booleanCheck)
			{
				var checkNull = _Heap[i + stringToFind.length];
				//alert(checkNull);
				if(checkNull === "00")
				{
					return [true, (_ProgramSize - pointer + 1)];
				}
			}
			else //string was not found, now we must reach the next null to check the next string
			{
				offset = i;
				while(_Heap[offset] !== "00")
				{
					offset++;
				}
			}

			i += offset; //if we reach this point, it was not a match
		}
	}
	return [false, "00"];
}
function getTemp(varName, scope)
{
	var tempIndex = -1;
	for(var i = 0; i < _StaticData.length; i++)
	{
		var currentTemp = _StaticData[i];
		if(currentTemp[_VarIndex] === varName && currentTemp[_ScopeIndex] === scope)
		{
			tempIndex = i;
		}
	}
	if(tempIndex === -1) // if it is not in the current scope, it still has to exist (at least in the parent scope or higher).
	{
		var tempArray = currentScopeChain(varName);
		//alert(tempArray[0]);
		//alert(tempArray[1]);
		var parentTempArray = getTemp(varName, tempArray[0]);
		// alert(parentTempArray[0]);
		// alert(parentTempArray[1]);
		// alert(parentTempArray[2]);
		// alert(parentTempArray[3]);
		
		// //store acc in memory
		// var temp = new actualTemp(" ");
		// createTemp(temp);
		// var tempToStoreAcc = getTemp(temp.name, _CurrentScopeId);
		// _GeneratedCode[_Index++] = "8D";
		// _GeneratedCode[_Index++] = tempToStoreAcc[_TempIndex];
		// _GeneratedCode[_Index++] = "XX";
		
		// //load the current value of the id from the parent scope in the acc
		// _GeneratedCode[_Index++] = "AD";
		// _GeneratedCode[_Index++] = parentTempArray[_TempIndex];
		// _GeneratedCode[_Index++] = "XX";
		
		// //store the acc at the new location for the current scope
		// var tempOfId = new actualTemp(varName);
		// createTemp(tempOfId);
		// var newTempOfId = getTemp(tempOfId.name, _CurrentScopeId);
		// _GeneratedCode[_Index++] = "8D";
		// _GeneratedCode[_Index++] = newTempOfId[_TempIndex];
		// _GeneratedCode[_Index++] = "XX";
		
		// //restore the accumulator
		// _GeneratedCode[_Index++] = "AD";
		// _GeneratedCode[_Index++] = tempToStoreAcc[_TempIndex];
		// _GeneratedCode[_Index++] = "XX";
		for(var i = 0; i < _StaticData.length; i++)
		{
			var currentTemp = _StaticData[i];
			if(currentTemp[_VarIndex] === varName && currentTemp[_ScopeIndex] === tempArray[0])
			{
				tempIndex = i;
			}
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

function actualTemp(name)
{
	this.name = name;
}