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
		putMessage(_CurrentDashes + "Opening new scope");
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
	}
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
		_CurrentDashes = _CurrentDashes.substr(0, (_CurrentDashes - 2));
		putMessage(_CurrentDashes + "Closing Scope from line " + _CurrentBlock.pop() + " on line " + currentStatement.lineNumber + ", character " + currentStatement.position);
	}
	else if(currentStatement.type === "end_of_file")
	{
		_CurrentDashes = _CurrentDashes.substr(0, (_CurrentDashes - 1));
		putMessage("Ending program on line " + currentStatement.lineNumber + ", character " + currentStatement.position);
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
		currentPrint();
		if(currentStatement.type === "right_paren")
		{
			putMessage(_CurrentDashes + "valid print statement on line " + currentStatement.lineNumber);
		}
		else
		{
			putMessage("~~~PARSE ERROR invalid print statement, missing closing parenthesis on line " + currentStatement.lineNumber);
			_ErrorCount++;
		}
	}
	else
	{
		putMessage("~~~PARSE ERROR invalid print statement, missing opening  parenthesis on line " + currentStatement.lineNumber);
		_ErrorCount++;
	}
	_CurrentDashes = _CurrentDashes.substr(0, (_CurrentDashes - 1));
}

function parseExpr()
{
	var currentStatement = _TokenList[_Index++];
	currentPrint();
	_CurrentDashes = _CurrentDashes.substr(0, (_CurrentDashes - 1));
}

function currentPrint()
{
	_CurrentDashes += "-";
	var currentStatement = _TokenList[_Index - 1];
	putMessage(_CurrentDashes + "Parsing token: " + currentStatement.type + " on line " + currentStatement.lineNumber + ", character " + currentStatement.position);
}