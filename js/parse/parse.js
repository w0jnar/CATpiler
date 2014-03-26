//
//parse.js
//

function parse()
{
	_WarningCount = 0;
	putMessage("~~~Starting Parse");
	if(_TokenList.length === 0) //check if we even have tokens.
	{
		putMessage("No Tokens found! Nothing to Parse!");
	}
	else
	{
		parseProgram();
	}
}

function parseProgram() //where most of the work begins/happens for parse.
{
	var currentToken = _TokenList[_Index++];
	putMessage("-Parsing token: " + currentToken.type + " on line " + currentToken.lineNumber + ", character " + currentToken.position);
	if(currentToken.type === "left_brace")
	{
		putMessage(_CurrentDashes + "Opening new scope on line " + currentToken.lineNumber + ", character " + currentToken.position);
		_CurrentBlock.push(currentToken.lineNumber);
		//_CurrentDashes += "-";
		while(_Index < _TokenList.length)
		{
			parseBlock();
		}
	}
	else
	{
		putMessage("~~~PARSE ERROR improper start of program on line " + currentToken.lineNumber + ", character " + currentToken.position);
		_ErrorCount++;
	}
	if(_ErrorCount > 0 || _WarningCount > 0)
		{
			putMessage("Error Count: " + _ErrorCount + ", Warning Count: " + _WarningCount);
			putMessage("Oh No! Errors Found! Check Code for details");
		}
		else
		{
			putMessage("No Parse Errors Found! Nice!");
		}
		
		putMessage("~~~Ending Parse");
}

function parseBlock()
{
	var currentStatement = _TokenList[_Index++];
	currentPrint();
	if(currentStatement.type === "print")
	{
		parsePrint();
	}
	else if(currentStatement.type.substr(0,7) === "var_id(")
	{
		parseAssignment();
	}
	else if(currentStatement.type === "int" || currentStatement.type === "string" || currentStatement.type === "boolean")
	{
		parseDecl();
	}
	else if(currentStatement.type === "while" || currentStatement.type === "if") //figured I would group them as they should have a similar structure.
	{
		parseWhileIf();
	}
	else if(currentStatement.type === "left_brace")
	{
		_CurrentBlock.push(currentToken.lineNumber);
		putMessage(_CurrentDashes + "Opening new scope");
		parseBlock();
	}
	else if(currentStatement.type === "right_brace")
	{
		removeDash();
		var scopeAboutToLeave = _CurrentBlock.pop();
		putMessage(_CurrentDashes + "Closing Scope from line " + scopeAboutToLeave + " on line " + currentStatement.lineNumber + ", character " + currentStatement.position);
		putMessage(currentScope(scopeAboutToLeave));
	}
	else if(currentStatement.type === "end_of_file")
	{
		if(_CurrentBlock.length > 0) //check if we have left all of the scopes.
		{
			putMessage("~~~PARSE ERROR End of file reached while still in scope");
			_ErrorCount++;
		}
		else
		{
			removeDash();
			putMessage("Ending program on line " + currentStatement.lineNumber + ", character " + currentStatement.position);
		}
	}
	else
	{
		putMessage("~~~PARSE ERROR invalid statement on line " + currentToken.lineNumber + ", character " + currentToken.position);
		_ErrorCount++;
	}
}

function parsePrint()
{
	var currentStatement = _TokenList[_Index++];
	currentPrint();
	if(currentStatement.type === "left_paren")
	{
		parseExpr();
		currentStatement = _TokenList[_Index++];
		if(currentStatement.type === "right_paren")
		{
			currentPrint();
			//_CurrentDashes += "-";
			putMessage("Parsed valid print statement on line " + currentStatement.lineNumber);
		}
		else
		{
			currentPrint();
			putMessage("~~~PARSE ERROR invalid print statement, missing closing parenthesis on line " + currentStatement.lineNumber);
			_ErrorCount++;
		}
	}
	else
	{
		putMessage("~~~PARSE ERROR invalid print statement, missing opening  parenthesis on line " + currentStatement.lineNumber);
		_ErrorCount++;
	}
	removeDash();
}

function parseExpr()
{
	var currentStatement = _TokenList[_Index++];
	//alert(currentStatement.type);
	currentPrint();
	if(currentStatement.type.substr(0,6) === "digit(")
	{
		parseIntExpr();
	}
	else if(currentStatement.type.substr(0,7) === "string(")
	{
		parseStringExpr();
	}
	else if(currentStatement.type === "left_paren" || currentStatement.type === "right_paren" || currentStatement.type === "true" || currentStatement.type === "false")
	{
		_Index--;
		parseBooleanExpr();
	}
	else if(currentStatement.type.substr(0,7) === "var_id(")
	{
		parseID();
	}
	else
	{
		putMessage("~~~PARSE ERROR invalid statement on line " + currentStatement.lineNumber + ", character " + currentStatement.position);
		_ErrorCount++;
	}
	removeDash();
}

function parseIntExpr() //we know we arrived from a digit
{
	var currentValue = _TokenList[--_Index]; //the number that brought us here.
	var previousStatement = _TokenList[--_Index]; //what the previous token was, checking for assignment.
	_Index++;
	var currentStatement = _TokenList[++_Index]; //the current statement.
	// alert(currentValue.type);
	// alert(previousStatement.type);
	// alert(currentStatement.type);
	// currentPrint();
	if(currentStatement.type === "right_paren")
	{
		_CurrentDashes += "-";
		putMessage(_CurrentDashes + "Parsed Int expression on line " + currentStatement.lineNumber + ", character " + currentStatement.position);
	}
	else if(currentStatement.type === "plus_op")
	{
		//_Index; //to get the next next character next time.
		_Index++;
		parseExpr();
	}
	else if(previousStatement.type === "assignment_op")
	{
		_SymbolTable[_SymbolTable.length - 1].setValue(currentValue.value);
		_SymbolTable[_SymbolTable.length - 1].setType("int");
	}
	else
	{
		putMessage("~~~PARSE ERROR invalid Int expression on line " + currentStatement.lineNumber);
		_ErrorCount++;
	}
	removeDash();
}

function parseStringExpr()
{
	var currentStatement = _TokenList[_Index];
	_CurrentDashes += "-";
	putMessage(_CurrentDashes + "Parsed Charlist expression on line " + currentStatement.lineNumber + ", character " + currentStatement.position);
	removeDash();
	var previousStatement = _TokenList[_Index - 1];
	if(previousStatement.type === "assignment_op")
	{
		_SymbolTable[_SymbolTable.length - 1].setValue(currentStatement.value);
		_SymbolTable[_SymbolTable.length - 1].setType("string");
	}
}

function parseBooleanExpr()
{
	var currentStatement = _TokenList[_Index++]; //decremented because we have already found the next character
	var nextToken = _TokenList[_Index];
	var nextFollowingToken = _TokenList[_Index + 1];
	//alert(currentStatement.type);
	//alert(currentStatement.type);
	if(currentStatement.type === "left_paren" && (nextToken.type === "true" || nextToken.type === "false") && nextFollowingToken.type === "right_paren") //check for in the middle of another statement
	{
		// alert("meow");
		currentPrint();
		_CurrentDashes += "-";
		putMessage(_CurrentDashes + "Parsed Boolean expression on line " + currentStatement.lineNumber + ", character " + currentStatement.position);
		//_Index++;
	}
	else if((currentStatement.type === "true" || nextToken.type === "false") && nextToken.type === "right_paren") //check that the next token is the closing paren to make sure the boolean expression is over, otherwise continue.
	{
		// alert("meow");
		currentPrint();
		_CurrentDashes += "-";
		putMessage(_CurrentDashes + "Parsed Boolean expression on line " + currentStatement.lineNumber + ", character " + currentStatement.position);
		//_Index++;
	}
	else if((currentStatement.type === "true" || currentStatement.type === "false") && _TokenList[_Index - 2].type === "assignment_op") //assignment
	{
		_SymbolTable[_SymbolTable.length - 1].setValue(currentStatement.value);
		_SymbolTable[_SymbolTable.length - 1].setType("boolean");
	}
	else if(currentStatement.type === "left_paren" && nextToken.type === "left_paren")
	{
		
		parseBooleanInternalExpr();
		
	}
	else if(currentStatement.type === "right_paren" || currentStatement.type === "true" || currentStatement.type === "false")
	{
		//alert("testmeow");
		//parseBooleanInternalExpr();
		
	}
	else if(currentStatement.type === "left_paren")
	{
		//_Index++;
		currentPrint();
		parseExpr();
		var currentStatement = _TokenList[_Index++]; 
		currentPrint();
		//alert(currentStatement.value);
		if(currentStatement.value === "==" || currentStatement.value === "!=")
		{
			//currentPrint();
			_Index++;
			parseExpr();
			var currentStatement = _TokenList[_Index++]; 
			if(currentStatement.type === "right_paren")
			{
				//alert("testmeow");
				//parseBooleanInternalExpr();
				
			}
		}
		else
		{
			putMessage("~~~PARSE ERROR invalid Boolean expression, missing operator on line " + currentStatement.lineNumber + ", character " + currentStatement.position);
			_ErrorCount++;
		}
		
	}
	else
	{
		putMessage("~~~PARSE ERROR invalid Boolean expression on line " + currentStatement.lineNumber);
		_ErrorCount++;
	}
	removeDash();
}

function parseBooleanInternalExpr() //for internal, multi token bool ops. Not a fan of this, but was truly not sure how to proceed on this.
{
	var currentStatement = _TokenList[_Index++];
	var nextToken = _TokenList[_Index];
	currentPrint();
	putMessage(_CurrentDashes + "Parsing token: " + nextToken.type + " on line " + nextToken.lineNumber + ", character " + nextToken.position);
	if(validBool(currentStatement.value))
	{
		_Index++;
		parseExpr();
		var currentStatement = _TokenList[_Index++];
		currentPrint();
		if(currentStatement.value === "==" || currentStatement.value === "!=")
		{
			parseExpr();
			currentStatement = _TokenList[_Index++];
			//alert(currentStatement.type);
			currentPrint();
			if(currentStatement.type === "right_paren")
			{
				parseBlock();
				_CurrentDashes += "-";
				putMessage(_CurrentDashes + "Parsed Boolean expression on line " + currentStatement.lineNumber + ", character " + currentStatement.position);
				removeDash();
			}
			else
			{
				putMessage("~~~PARSE ERROR invalid Boolean expression, missing right parenthesis on line " + currentStatement.lineNumber);
				_ErrorCount++;
			}
		}
		else
		{
			putMessage("~~~PARSE ERROR invalid Boolean expression, missing operator on line " + currentStatement.lineNumber + ", character " + currentStatement.position);
			_ErrorCount++;
		}
	}
	else
	{
		//currentPrint();
		putMessage("~~~PARSE ERROR invalid Boolean expression, missing closing parenthesis on line " + currentStatement.lineNumber);
		_ErrorCount++;
	}
}

function parseID()
{
	var currentStatement = _TokenList[--_Index];
	var id = currentStatement.type.charAt(7);
	if(_DeclarationFlag === true) //We arrive from a variable declaration.
	{
		_DeclarationFlag = false;
		_Index--;
	}
	createSymbol(id, currentStatement);
	_CurrentDashes += "-";
	//alert(currentStatement.type);
	putMessage(_CurrentDashes + "Parsed ID expression on line " + currentStatement.lineNumber + ", character " + currentStatement.position);
	removeDash();
	var previousStatement = _TokenList[_Index - 1];
	if(previousStatement.type === "assignment_op")
	{
		_SymbolTable[_SymbolTable.length - 1].setValue(currentStatement.value);
		_SymbolTable[_SymbolTable.length - 1].setType("id"); //Assuming this is wrong, but not sure when I want to go with this. I assume it would be fixed by the AST.
	}
	_Index++;
}

function parseAssignment()
{
	//alert("meow");
	var id = _TokenList[_Index - 1].type.charAt(7); //need to retrieve the previous token as it has the name of the id.
	var currentStatement = _TokenList[_Index - 1];
	//var id = currentStatement.type.substr(7,8);
	//alert(id);
	//currentPrint();
	if(currentStatement.type.substr(0,7) === "var_id(")
	{
		var nextToken = _TokenList[_Index++];
		currentPrint();
		if(nextToken.type === "assignment_op")
		{
			createSymbol(id, currentStatement);
			parseExpr();
		}
		else
		{
			putMessage("~~~PARSE ERROR invalid Assignment expression on line " + currentStatement.lineNumber);
			_ErrorCount++;
		}
	}
}

function parseDecl()
{
	var currentStatement = _TokenList[--_Index];
	currentPrint();
	_Index++;
	var nextToken = _TokenList[_Index];
	//alert(nextToken.type);
	if(/^[a-z]$/.test(nextToken.type.charAt(7)))
	{
		_Index++;
		_DeclarationFlag = true;
		parseID();
	}
	else
	{
		putMessage("~~~PARSE ERROR invalid Declaration expression on line " + currentStatement.lineNumber);
		_ErrorCount++;
	}
	_Index++;
}

function parseWhileIf()
{
	var currentStatement = _TokenList[_Index++];
	currentPrint();
	if(currentStatement.type === "left_paren")
	{
		parseBooleanExpr();
		currentStatement = _TokenList[_Index - 1];
		//alert(currentStatement.type);
		currentPrint();
		if(currentStatement.type === "right_paren")
		{
			parseBlock();
			_CurrentDashes += "-";
			putMessage(_CurrentDashes + "Parsed While/If statement on line " + currentStatement.lineNumber + ", character " + currentStatement.position);
			removeDash();
		}
		else
		{
			putMessage("~~~PARSE ERROR invalid While/If statement, missing right parenthesis on line " + currentStatement.lineNumber);
			_ErrorCount++;
		}
	}
	else
	{
		putMessage("~~~PARSE ERROR invalid While/If statement, missing left parenthesis on line " + currentStatement.lineNumber);
			_ErrorCount++;
	}
}
//
//parse utility functions
//
function currentPrint()
{
	_CurrentDashes += "-";
	var currentStatement = _TokenList[_Index - 1];
	putMessage(_CurrentDashes + "Parsing token: " + currentStatement.type + " on line " + currentStatement.lineNumber + ", character " + currentStatement.position);
}

function removeDash()
{
	_CurrentDashes = _CurrentDashes.substr(0, (_CurrentDashes - 1));
}

function validBool(value)
{
	var testChar = value.charAt(0);
	//alert(testChar);
	if(testChar === "+" || testChar === "=" || testChar === "!")
	{
		return false;
	}
	else
	{
		return true
	}
}

function currentScope(scope)
{
	var outString = "Final values from ids of this scope: ";
	for(var i = 0; i < _SymbolTable.length; i++)
	{
		if(_SymbolTable[i].scope === scope)
		{
			outString += symbolToString(_SymbolTable[i]) + " | ";
		}
	}
	
	if(outString.substr(outString.length - 3, outString.length + 1) === " | ")
	{
		outString = outString.substr(0, outString.length - 3);
	}
	else
	{
		var outString = "There were no ids in this scope.";
	}
	return outString;
}
