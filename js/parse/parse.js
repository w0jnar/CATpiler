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
	else if(currentStatement.type === "var_id")
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
		removeDashes();
		putMessage(_CurrentDashes + "Closing Scope from line " + _CurrentBlock.pop() + " on line " + currentStatement.lineNumber + ", character " + currentStatement.position);
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
			_CurrentDashes += "-";
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
		parseBooleanExpr();
	}
	else if(currentStatement.type === "var_id")
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
	var currentStatement = _TokenList[_Index++]; //do not increment in case it is the matching paren.
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
	removeDash();
	escape();
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

function escape()
{
	if(_ErrorCount > 0)
	{
		return;
	}
}