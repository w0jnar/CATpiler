//
//new_parse.js
//

function parse()
{
	_WarningCount = 0;
	putMessage("~~~Starting Parse");
	if(_TokenList.length === 0) //check if we even have tokens, which we should as even the smallest valid program has 3 tokens.
	{
		putMessage("No Tokens found! Nothing to Parse!");
		_ErrorCount++;
	}
	else
	{
		parseProgram();
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

function parseProgram()
{
	_CurrentToken = _TokenList[_Index++];
	_CheckSuccess = false;
	_CheckSuccess = parseBlock();
	if(_CheckSuccess)
	{
		_CheckSuccess = false;
		_CheckSuccess = parseEOF();
		if(_CheckSuccess)
		{
			putMessage("-Program parsing ended.");
		}
		else
		{
			putMessage("~~~PARSE ERROR program improperly ended on line " + _CurrentToken.lineNumber + ", character " + _CurrentToken.position);
			_ErrorCount++;
		}
	}
	else
	{
		putMessage("~~~PARSE ERROR program block improperly ended on line " + _CurrentToken.lineNumber + ", character " + _CurrentToken.position);
		_ErrorCount++;
	}
}

function parseBlock()
{
	_CheckSuccess = false;
	_CheckSuccess = match("left_brace");
	//alert(_CheckSuccess);
}

function match(tokenType)
{
	return _CurrentToken.type === tokenType;
}