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
	_CheckSuccess = parseBlock();
	if(_CheckSuccess)
	{
		newTokenSetup();
		_CheckSuccess = match("end_of_file");
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
	newTokenSetup();
	_CheckSuccess = match("left_brace");
	if(_CheckSuccess)
		{
			putMessage("-Parsing Block");
			_CheckSuccess = false;
			_CheckSuccess = parseStatementList();
			if(_CheckSuccess)
			{
				//newTokenSetup();
				_CheckSuccess = match("right_brace");
				if(_CheckSuccess)
				{
					putMessage("-Finished Parsing Block");
					return true;
					
				}
				else
				{
					putMessage("~~~PARSE ERROR program block improperly ended on line " + _CurrentToken.lineNumber + ", character " + _CurrentToken.position);
					_ErrorCount++;
					return false;
				}
			}
			else
			{
				putMessage("~~~PARSE ERROR program block improperly ended on line " + _CurrentToken.lineNumber + ", character " + _CurrentToken.position);
				_ErrorCount++;
				return false;
			}
		}
		else
		{
			putMessage("~~~PARSE ERROR program improperly ended on line " + _CurrentToken.lineNumber + ", character " + _CurrentToken.position);
			_ErrorCount++;
			return false;
		}
	//alert(_CheckSuccess);
}

function parseStatementList()
{
	newTokenSetup();
	while(!match("right_brace"))
	{
		_CheckSuccess = parseStatement();
		if(_CheckSuccess)
		{
			newTokenSetup();
		}
		else
		{
			putMessage("~~~PARSE ERROR statement improperly parsed on line " + _CurrentToken.lineNumber + ", character " + _CurrentToken.position);
			_ErrorCount++;
		}
	}
}

function match(tokenType)
{
	return _CurrentToken.type === tokenType;
}

function checkTokensRemaining()
{
	return _Index < _TokenList.length;
}

function newTokenSetup() //gets the new token, adds it to the output, and resets _CheckSuccess, as all of those occur in order in most of the parse functions.
{
	if(checkTokensRemaining)
	{
		_CurrentToken = _TokenList[_Index++]; 
		putMessage("-Parsing token: " + _CurrentToken.type + " on line " + _CurrentToken.lineNumber + ", character " + _CurrentToken.position);
		_CheckSuccess = false;
	}
	else
	{
		putMessage("~~~PARSE ERROR ran out of tokens when a token was needed");
		_ErrorCount++;
	}
}
