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
	
	var currentJump = "";
	putMessage("-Backpatching Jumps");
	for(var i = 0; i < _GeneratedCode.length; i++)
	{
		if(_GeneratedCode[i].slice(0,1) === "J")
		{
			for(var j = 0; j < _JumpTable.length; j++)
			{
				if(_GeneratedCode[i] === _JumpTable[j][0])
				{
					if(_JumpTable[j][1].toString(16).length === 1)
					{
						currentJump = "0" + _JumpTable[j][1].toString(16).toUpperCase();
					}
					else
					{
						currentJump = _JumpTable[j][1].toString(16).toUpperCase();
					}
					_GeneratedCode[i] = currentJump;
				}
			}
		}
	}
	
	var currentTemp;
	var currentReplace;
	var currentTempString;
	putMessage("-Backpatching Temps");
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
	else if(currentNodeName === "if")
	{
		generateIf(jsonNode); //entire node to pass all of the children.
	}
	else if(currentNodeName === "while")
	{
		generateWhile(jsonNode); //entire node to pass all of the children.
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
	var toStore = expressionInfo(equalNode.children[1]);
	var valueToStore = toStore[1];
	var typeToStore = toStore[0];
	//alert(valueToStore);
	if(valueToStore.match(/^\"/)) //if the value is from an id and is a string literal
	{
		valueToStore = allocateHeap(valueToStore)[1];
	}
	if(valueToStore.length === 1)
	{
		valueToStore = 0 + valueToStore;
	}
	if(valueToStore.slice(0,1) !== "T")
	{
		_GeneratedCode[_Index++] = "A9";
		_GeneratedCode[_Index++] = valueToStore;
		_GeneratedCode[_Index++] = "8D";
		_GeneratedCode[_Index++] = currentTemp[_TempIndex];
		_GeneratedCode[_Index++] = "XX";
	}
	else if(valueToStore.slice(0,1) === "T" && typeToStore !== "boolean")
	{
		_GeneratedCode[_Index++] = "AD";
		_GeneratedCode[_Index++] = valueToStore;
		_GeneratedCode[_Index++] = "XX";
		_GeneratedCode[_Index++] = "8D";
		_GeneratedCode[_Index++] = currentTemp[_TempIndex];
		_GeneratedCode[_Index++] = "XX";
	}
	else
	{
		var temp = new actualTemp(("S" + _ActualTempCount.toString()));
		_ActualTempCount++;
		createTemp(temp);
		_GeneratedCode[_Index++] = "A9";
		_GeneratedCode[_Index++] = "01"; //load variable with 01. If it is a match, jump, it is false, else true.
		_GeneratedCode[_Index++] = "8D";
		_GeneratedCode[_Index++] =  _CurrentTemp;
		_GeneratedCode[_Index++] = "XX";
		_GeneratedCode[_Index++] = "EC";
		_GeneratedCode[_Index++] =  _CurrentTemp;
		_GeneratedCode[_Index++] = "XX";
		_GeneratedCode[_Index++] = "D0";
		_GeneratedCode[_Index++] = "0C";
		_GeneratedCode[_Index++] = "A9";
		_GeneratedCode[_Index++] = _TruePointer;
		_GeneratedCode[_Index++] = "8D";
		_GeneratedCode[_Index++] = currentTemp[_TempIndex];
		_GeneratedCode[_Index++] = "XX";
		_GeneratedCode[_Index++] = "A2";
		_GeneratedCode[_Index++] = "00";
		_GeneratedCode[_Index++] = "EC";
		_GeneratedCode[_Index++] =  _CurrentTemp;
		_GeneratedCode[_Index++] = "XX";
		_GeneratedCode[_Index++] = "D0";
		_GeneratedCode[_Index++] = "05";
		_GeneratedCode[_Index++] = "A9";
		_GeneratedCode[_Index++] = _FalsePointer;
		_GeneratedCode[_Index++] = "8D";
		_GeneratedCode[_Index++] = currentTemp[_TempIndex];
		_GeneratedCode[_Index++] = "XX";
	}
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
	else if(isId(printChildNode.name) && (checkId(printChildNode)[0] === "string" || checkId(printChildNode)[0] === "boolean")) //string id
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
		if(expressionArray[1].slice(0,1) !== "T")
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
		}
		else
		{
			_GeneratedCode[_Index++] = "AC";
			_GeneratedCode[_Index++] = expressionArray[1];
			_GeneratedCode[_Index++] = "XX";
		}
		_GeneratedCode[_Index++] = "A2";
		_GeneratedCode[_Index++] = "01";
		_GeneratedCode[_Index++] = "FF";
		
	}
	else if(expressionArray[0] === "string" || expressionArray[0] === "boolean") //string constant
	{
		if(expressionArray[0] === "boolean" && expressionArray[1].slice(0,1) === "T")
		{
			var temp = new actualTemp(("S" + _ActualTempCount.toString()));
			_ActualTempCount++;
			createTemp(temp);
			_GeneratedCode[_Index++] = "A9";
			_GeneratedCode[_Index++] = "01"; //load variable with 01. If it is a match, jump, it is false, else true.
			_GeneratedCode[_Index++] = "8D";
			_GeneratedCode[_Index++] =  _CurrentTemp;
			_GeneratedCode[_Index++] = "XX";
			_GeneratedCode[_Index++] = "EC";
			_GeneratedCode[_Index++] =  _CurrentTemp;
			_GeneratedCode[_Index++] = "XX";
			_GeneratedCode[_Index++] = "D0";
			_GeneratedCode[_Index++] = "0C"; ///////
			_GeneratedCode[_Index++] = "A0";
			_GeneratedCode[_Index++] = _TruePointer;
			_GeneratedCode[_Index++] = "A2";
			_GeneratedCode[_Index++] = "02";
			_GeneratedCode[_Index++] = "FF";
			_GeneratedCode[_Index++] = "A2";
			_GeneratedCode[_Index++] = "00";
			_GeneratedCode[_Index++] = "EC";
			_GeneratedCode[_Index++] =  _CurrentTemp;
			_GeneratedCode[_Index++] = "XX";
			_GeneratedCode[_Index++] = "D0";
			_GeneratedCode[_Index++] = "05"; //
			_GeneratedCode[_Index++] = "A0";
			_GeneratedCode[_Index++] = _FalsePointer;
			_GeneratedCode[_Index++] = "A2";
			_GeneratedCode[_Index++] = "02";
			_GeneratedCode[_Index++] = "FF";
		}
		else
		{
			_GeneratedCode[_Index++] = "A0";
			_GeneratedCode[_Index++] = expressionArray[1];
			_GeneratedCode[_Index++] = "A2";
			_GeneratedCode[_Index++] = "02";
			_GeneratedCode[_Index++] = "FF";
		}
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

function generateIf(ifNode)
{
	putMessage("-Generating If Statement Code");
	var booleanExpression = generateBooleanExpr(ifNode.children[0]);
	
	var temp = new actualTemp(("S" + _ActualTempCount.toString()));
	_ActualTempCount++;
	createTemp(temp);
	_GeneratedCode[_Index++] = "A9";
	_GeneratedCode[_Index++] = "01";
	_GeneratedCode[_Index++] = "8D";
	_GeneratedCode[_Index++] = _CurrentTemp;
	_GeneratedCode[_Index++] = "XX";
	
	_GeneratedCode[_Index++] = "A2";
	if(booleanExpression[1] === _TruePointer)
	{
		_GeneratedCode[_Index++] = "01";
	}
	else
	{
		_GeneratedCode[_Index++] = "00";
	}
	_GeneratedCode[_Index++] = "EC";
	_GeneratedCode[_Index++] = _CurrentTemp;
	_GeneratedCode[_Index++] = "XX";
	_GeneratedCode[_Index++] = "D0";
	_GeneratedCode[_Index++] = ("J" + _CurrentJump.toString());
	var jumpName = ("J" + _CurrentJump.toString());
	_CurrentJump++;
	
	var currentIndex = _Index;
	
	generateBlock(ifNode.children[1]);
	
	currentIndex = _Index - currentIndex;
	//alert(currentIndex);
	_JumpTable.push([jumpName, currentIndex]);
}

function generateWhile(whileNode)
{
	putMessage("-Generating While Statement Code");
	var whileIndex = _Index;
	var booleanExpression = generateBooleanExpr(whileNode.children[0]);
	
	var temp = new actualTemp(("S" + _ActualTempCount.toString()));
	_ActualTempCount++;
	createTemp(temp);
	_GeneratedCode[_Index++] = "A9";
	_GeneratedCode[_Index++] = "01";
	_GeneratedCode[_Index++] = "8D";
	_GeneratedCode[_Index++] = _CurrentTemp;
	_GeneratedCode[_Index++] = "XX";
	
	_GeneratedCode[_Index++] = "A2";
	if(booleanExpression[1] === _TruePointer)
	{
		_GeneratedCode[_Index++] = "01";
	}
	else
	{
		_GeneratedCode[_Index++] = "00";
	}
	_GeneratedCode[_Index++] = "EC";
	_GeneratedCode[_Index++] = _CurrentTemp;
	_GeneratedCode[_Index++] = "XX";
	_GeneratedCode[_Index++] = "D0";
	_GeneratedCode[_Index++] = ("J" + _CurrentJump.toString());
	var jumpName = ("J" + _CurrentJump.toString());
	_CurrentJump++;
	
	var currentIndex = _Index;
	
	generateBlock(whileNode.children[1]);
	
	
	var whileTemp = new actualTemp(("S" + _ActualTempCount.toString()));
	_ActualTempCount++;
	createTemp(whileTemp);
	_GeneratedCode[_Index++] = "A9";
	_GeneratedCode[_Index++] = "01";
	_GeneratedCode[_Index++] = "8D";
	_GeneratedCode[_Index++] = _CurrentTemp;
	_GeneratedCode[_Index++] = "XX";
	
	_GeneratedCode[_Index++] = "A2";
	_GeneratedCode[_Index++] = "00";
	_GeneratedCode[_Index++] = "EC";
	_GeneratedCode[_Index++] = _CurrentTemp;
	_GeneratedCode[_Index++] = "XX";
	_GeneratedCode[_Index++] = "D0";
	_GeneratedCode[_Index++] = ("J" + _CurrentJump.toString());
	var whileJumpName = ("J" + _CurrentJump.toString());
	_CurrentJump++;
	//alert(whileIndex);
	//alert(_Index);
	whileIndex = (_ProgramSize - (_Index - whileIndex)) + 1;
	//alert(whileIndex);
	_JumpTable.push([whileJumpName, whileIndex]);
	
	
	
	currentIndex = _Index - currentIndex;
	_JumpTable.push([jumpName, currentIndex]);
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
	else if(currentExpression === "==" || currentExpression === "!=" || currentExpression === "false" || currentExpression === "true")
	{
		returnArray = generateBooleanExpr(expressionNode);
	}
	else if(currentExpression.match(/[a-z]/))
	{
		var currentTemp = getTemp(expressionNode.name, _CurrentScopeId);
		returnArray.push(checkId(expressionNode)[0]);
		returnArray.push(currentTemp[_TempIndex]);
		//alert(returnArray[0]);
		//alert(returnArray[1]);
	}
	return returnArray;
}

function generateIntExpr(plusNode)
{	
	var expressionArrayRight = expressionInfo(plusNode.children[1]);
	var valueToStore = expressionArrayRight[1];
	var expressionArray = expressionInfo(plusNode.children[0]);
	
	//add with carry right side
	if(valueToStore.slice(0,1) === "T")
	{
		var temp = new actualTemp(("S" + _ActualTempCount.toString()));
		_ActualTempCount++;
		createTemp(temp);
		//store the left side (always a digit in a temp)
		_GeneratedCode[_Index++] = "A9";
		if(expressionArray[1].toString(16).toUpperCase().length === 1)
		{
			_GeneratedCode[_Index++] = "0" + expressionArray[1].toString(16).toUpperCase();
		}
		else
		{
			_GeneratedCode[_Index++] = expressionArray[1].toString(16).toUpperCase();
		}
		_GeneratedCode[_Index++] = "6D";
		_GeneratedCode[_Index++] = valueToStore;
		_GeneratedCode[_Index++] = "XX";
		
		_GeneratedCode[_Index++] = "8D";
		_GeneratedCode[_Index++] = _CurrentTemp;
		_GeneratedCode[_Index++] = "XX";
		
		return ["digit", _CurrentTemp];
		
	}
	else //digit
	{
		return ["digit", (parseInt(valueToStore,16) + parseInt(expressionArray[1],16)).toString(16)];
	}
	
	
	
}

function generateBooleanExpr(boolExprNode)
{
	var currentNodeName = boolExprNode.name;
	_TruePointer = allocateHeap("\"true\"")[1];
	_FalsePointer = allocateHeap("\"false\"")[1];
	if(currentNodeName === "true" || currentNodeName === "false")
	{
		var boolString = "\"" + boolExprNode.name + "\"";
		var stringBoolean = allocateHeap(boolString);
		return stringBoolean;
	}
	else
	{
		var leftSide = (expressionInfo(boolExprNode.children[0])[1]).toString();
		var rightSide = (expressionInfo(boolExprNode.children[1])[1]).toString();
		var leftType = expressionInfo(boolExprNode.children[0])[0];
		var rightType = expressionInfo(boolExprNode.children[1])[0];
		if(leftSide.match(/^\"/)) //gets the memory location if static string for comparison
		{
			leftSide = allocateHeap(leftSide)[1].toString();
		}
		if(rightSide.match(/^\"/))
		{
			rightSide = allocateHeap(rightSide)[1].toString();
		}
		
		if(leftSide.slice(0,1) === "T" || rightSide.slice(0,1) === "T")
		{
			if(leftSide.length === 1)
			{
				leftSide = "0" + leftSide.toString();
			}
			if(rightSide.length === 1)
			{
				rightSide = "0" + rightSide.toString();
			}
			//left side to X reg
			if(leftSide.slice(0,1) === "T" && leftType === "boolean")
			{
				_GeneratedCode[_Index++] = "A2";
				_GeneratedCode[_Index++] = "01";
				_GeneratedCode[_Index++] = "EC";
				_GeneratedCode[_Index++] = leftSide;
				_GeneratedCode[_Index++] = "XX";
				_GeneratedCode[_Index++] = "D0";
				_GeneratedCode[_Index++] = "09";
				_GeneratedCode[_Index++] = "A2";
				_GeneratedCode[_Index++] = _FalsePointer;
				_GeneratedCode[_Index++] = "A2";
				_GeneratedCode[_Index++] = "00";
				_GeneratedCode[_Index++] = "EC";
				_GeneratedCode[_Index++] = leftSide;
				_GeneratedCode[_Index++] = "XX";
				_GeneratedCode[_Index++] = "D0";
				_GeneratedCode[_Index++] = "02";
				_GeneratedCode[_Index++] = "A2";
				_GeneratedCode[_Index++] = _TruePointer;
			}
			else if(leftSide.slice(0,1) === "T")
			{
				_GeneratedCode[_Index++] = "AE";
				_GeneratedCode[_Index++] = leftSide;
				_GeneratedCode[_Index++] = "XX";
			}
			else
			{
				_GeneratedCode[_Index++] = "A2";
				_GeneratedCode[_Index++] = leftSide;
			}
			
			//temp for right side
			var temp = new actualTemp(("S" + _ActualTempCount.toString()));
			_ActualTempCount++;
			createTemp(temp);
			//right side need to end up in memory
			if(rightSide.slice(0,1) === "T" && rightType === "boolean")
			{
				_GeneratedCode[_Index++] = "AD";
				_GeneratedCode[_Index++] = rightSide;
				_GeneratedCode[_Index++] = "XX";
				_GeneratedCode[_Index++] = "8D";
				_GeneratedCode[_Index++] = _CurrentTemp;
				_GeneratedCode[_Index++] = "XX";
				
				
				_GeneratedCode[_Index++] = "A2";
				_GeneratedCode[_Index++] = "01";
				_GeneratedCode[_Index++] = "EC";
				_GeneratedCode[_Index++] = rightSide;
				_GeneratedCode[_Index++] = "XX";
				_GeneratedCode[_Index++] = "D0";
				_GeneratedCode[_Index++] = "0C";
				_GeneratedCode[_Index++] = "A9";
				_GeneratedCode[_Index++] = _FalsePointer;
				_GeneratedCode[_Index++] = "8D";
				_GeneratedCode[_Index++] = _CurrentTemp;
				_GeneratedCode[_Index++] = "XX";
				_GeneratedCode[_Index++] = "A2";
				_GeneratedCode[_Index++] = "00";
				_GeneratedCode[_Index++] = "EC";
				_GeneratedCode[_Index++] = leftSide;
				_GeneratedCode[_Index++] = "XX";
				_GeneratedCode[_Index++] = "D0";
				_GeneratedCode[_Index++] = "05";
				_GeneratedCode[_Index++] = "A9";
				_GeneratedCode[_Index++] = _TruePointer;
				_GeneratedCode[_Index++] = "8D";
				_GeneratedCode[_Index++] = _CurrentTemp;
				_GeneratedCode[_Index++] = "XX";
				
				
				
			}
			else if(rightSide.slice(0,1) === "T")
			{
				_GeneratedCode[_Index++] = "AD";
				_GeneratedCode[_Index++] = rightSide;
				_GeneratedCode[_Index++] = "XX";
				_GeneratedCode[_Index++] = "8D";
				_GeneratedCode[_Index++] = _CurrentTemp;
				_GeneratedCode[_Index++] = "XX";
			}
			else
			{
				_GeneratedCode[_Index++] = "A9";
				_GeneratedCode[_Index++] = rightSide;
				_GeneratedCode[_Index++] = "8D";
				_GeneratedCode[_Index++] = _CurrentTemp;
				_GeneratedCode[_Index++] = "XX";
			}
			
			_GeneratedCode[_Index++] = "EC";
			_GeneratedCode[_Index++] = _CurrentTemp;
			_GeneratedCode[_Index++] = "XX";
			
			var temp2 = new actualTemp(("S" + _ActualTempCount.toString()));
			_ActualTempCount++;
			createTemp(temp2);
			if(currentNodeName === "==")
			{
				_GeneratedCode[_Index++] = "D0";
				_GeneratedCode[_Index++] = "0C"; //it will not jump if they are equal
				_GeneratedCode[_Index++] = "A2";
				_GeneratedCode[_Index++] = "01";
				_GeneratedCode[_Index++] = "A9";
				_GeneratedCode[_Index++] = "00";
				_GeneratedCode[_Index++] = "8D";
				_GeneratedCode[_Index++] = _CurrentTemp;
				_GeneratedCode[_Index++] = "XX";
				_GeneratedCode[_Index++] = "EC";
				_GeneratedCode[_Index++] = _CurrentTemp;
				_GeneratedCode[_Index++] = "XX";
				_GeneratedCode[_Index++] = "D0";
				_GeneratedCode[_Index++] = "07"; //
				_GeneratedCode[_Index++] = "A2";
				_GeneratedCode[_Index++] = "00";
				_GeneratedCode[_Index++] = "A9";
				_GeneratedCode[_Index++] = "01";
				_GeneratedCode[_Index++] = "8D";
				_GeneratedCode[_Index++] = _CurrentTemp;
				_GeneratedCode[_Index++] = "XX";
				
			}
			else
			{
				_GeneratedCode[_Index++] = "D0";
				_GeneratedCode[_Index++] = "0C"; //
				_GeneratedCode[_Index++] = "A2";
				_GeneratedCode[_Index++] = "00";
				_GeneratedCode[_Index++] = "A9";
				_GeneratedCode[_Index++] = "01";
				_GeneratedCode[_Index++] = "8D";
				_GeneratedCode[_Index++] = _CurrentTemp;
				_GeneratedCode[_Index++] = "XX";
				_GeneratedCode[_Index++] = "EC";
				_GeneratedCode[_Index++] = _CurrentTemp;
				_GeneratedCode[_Index++] = "XX";
				_GeneratedCode[_Index++] = "D0";
				_GeneratedCode[_Index++] = "07"; //
				_GeneratedCode[_Index++] = "A2";
				_GeneratedCode[_Index++] = "01";
				_GeneratedCode[_Index++] = "A9";
				_GeneratedCode[_Index++] = "00";
				_GeneratedCode[_Index++] = "8D";
				_GeneratedCode[_Index++] = _CurrentTemp;
				_GeneratedCode[_Index++] = "XX";
			}
			return ["boolean", _CurrentTemp];
		}
		else //static as there are no variables involved
		{
			if(leftSide === rightSide && currentNodeName === "==")
			{
				return ["boolean", _TruePointer];
			}
			else if(leftSide !== rightSide && currentNodeName === "==")
			{
				return ["boolean", _FalsePointer];
			}
			else if(leftSide === rightSide && currentNodeName === "!=")
			{
				return ["boolean", _FalsePointer];
			}
			else if(leftSide !== rightSide && currentNodeName === "!=")
			{
				return ["boolean", _TruePointer];
			}
		}
	}
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