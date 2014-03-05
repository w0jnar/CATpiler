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
	if(currentToken.type === "{")
	{
		putMessage(_CurrentDashes + "Opening new scope");
		_CurrentBlock.push(currentToken.lineNumber);
		_CurrentDashes += "-";
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
	_CurrentDashes += "-";
	putMessage(_CurrentDashes + "Parsing token: " + currentStatement.type + " on line " + currentStatement.lineNumber + ", character " + currentStatement.position);
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
	else if(currentStatement.type === "{")
	{
		_CurrentBlock.push(currentToken.lineNumber);
		putMessage(_CurrentDashes + "Opening new scope");
		parseBlock();
	}
	else if(currentStatement.type === "}")
	{
		_CurrentDashes = _CurrentDashes.substr(0, (_CurrentDashes - 2));
		putMessage(_CurrentDashes + "Closing Scope from line " + _CurrentBlock.pop() + " on line " + currentStatement.lineNumber + ", character " + currentStatement.position);
	}
}