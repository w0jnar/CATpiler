//
//parse.js
//

function parse()
{
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
			escape();
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
	escape();
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
		putMessage(_CurrentDashes + "Closing Scope from line " + _CurrentBlock.pop() + " on line " + currentStatement.lineNumber + ", character " + currentStatement.position);
		currentScope();
	}
	else if(currentStatement.type === "end_of_file")
	{
		removeDash();
		putMessage("Ending program on line " + currentStatement.lineNumber + ", character " + currentStatement.position);
	}
	else
	{
		putMessage("~~~PARSE ERROR invalid statement on line " + currentToken.lineNumber + ", character " + currentToken.position);
		_ErrorCount++;
	}
	escape();
}

function parsePrint()
{
	var currentStatement = _TokenList[_Index++];
	currentPrint();
	if(currentStatement.type === "left_paren")
	{
		parseExpr();
		escape();
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
	escape();
	
}

function parseExpr()
{
	var currentStatement = _TokenList[_Index++];
	currentPrint();
	if(currentStatement.type.substr(0,6) === "digit(")
	{
		parseIntExpr();
	}
	else if(currentStatement.type.substr(0,7) === "string(")
	{
		parseStringExpr();
	}
	else if(currentStatement.type === "left_paren" || currentStatement.type === "true" || currentStatement.type === "false")
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
	escape();
}

function parseIntExpr() //we know we arrived from a digit
{
	var currentStatement = _TokenList[_Index++];
	currentPrint();
	if(currentStatement.type === "right_paren") //woot!
	{
		_CurrentDashes += "-";
		putMessage(_CurrentDashes + "Parsed Int expression on line " + currentStatement.lineNumber + ", character " + currentStatement.position);
		_Index--;
	}
	else if(currentStatement.type === "plus_op")
	{
		//_Index; //to get the next next character next time.
		parseExpr();
	}
	else if(currentStatement.type === "assignment_op")
	{
		currentStatement = _TokenList[_Index++];
		_SymbolTable[_SymbolTable.length - 1].setValue(currentStatement.value);
		_SymbolTable[_SymbolTable.length - 1].setType("int");
	}
	removeDash();
	escape();
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
	//alert(currentStatement.type);
	if((currentStatement.type === "true" || currentStatement.type === "false") && nextToken.type === "right_paren") //check that the next token is the closing paren to make sure the boolean expression is over, otherwise continue.
	{
		currentPrint();
		_CurrentDashes += "-";
		putMessage(_CurrentDashes + "Parsed Boolean expression on line " + currentStatement.lineNumber + ", character " + currentStatement.position);
		//_Index++;
	}
	else if(currentStatement.type === "true" || currentStatement.type === "false") //assignment
	{
		_SymbolTable[_SymbolTable.length - 1].setValue(currentStatement.value);
		_SymbolTable[_SymbolTable.length - 1].setType("boolean");
	}
	else if(currentStatement.type === "left_paren")
	{
		
		parseBooleanInternalExpr();
		
	}
	else
	{
		putMessage("~~~PARSE ERROR invalid Boolean expression on line " + currentStatement.lineNumber);
		_ErrorCount++;
	}
	removeDash();
	escape();
}

function parseBooleanInternalExpr() //for internal, multi token bool ops. Not a fan of this, but was truly not sure how to proceed on this.
{
	var currentStatement = _TokenList[_Index++];
	var nextToken = _TokenList[_Index];
	currentPrint();
	putMessage(_CurrentDashes + "Parsing token: " + nextToken.type + " on line " + nextToken.lineNumber + ", character " + nextToken.position);
	if((currentStatement.type === "true" || currentStatement.type === "false") && nextToken.type.substr(0, 6) === "boolop")
	{
		var nextTokenInStatement = _TokenList[_Index + 1];
		_CurrentDashes += "-";
		putMessage(_CurrentDashes + "Parsing token: " + nextTokenInStatement.type + " on line " + nextTokenInStatement.lineNumber + ", character " + nextTokenInStatement.position);
		_CurrentDashes += "-";
		var nextNextTokenInStatement = _TokenList[_Index + 2];
		putMessage(_CurrentDashes + "Parsing token: " + nextNextTokenInStatement.type + " on line " + nextNextTokenInStatement.lineNumber + ", character " + nextNextTokenInStatement.position);
		if((nextTokenInStatement.type === "true" || nextTokenInStatement.type === "false") && nextNextTokenInStatement.type === "right_paren")
		{
			_CurrentDashes += "-";
			putMessage(_CurrentDashes + "Parsed valid Boolean expression on line " + currentStatement.lineNumber);
			_Index += 3;
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
	var currentStatement = _TokenList[_Index];
	_CurrentDashes += "-";
	putMessage(_CurrentDashes + "Parsed ID expression on line " + currentStatement.lineNumber + ", character " + currentStatement.position);
	removeDash();
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

function escape() //does not work as intended. Pretty sure I know why, but not a huge priority at this time.
{
	if(_ErrorCount > 0)
	{
		return;
	}
}

function currentScope()
{
	
}