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
		//putMessage("~~~PARSE ERROR program block improperly ended on line " + _CurrentToken.lineNumber + ", character " + _CurrentToken.position);
		//_ErrorCount++;
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
	_CheckSuccess = true; //work around in cases where a block is empty, so {}.
	while(!match("right_brace"))
	{
		//alert(_Index);
		_CheckSuccess = parseStatement();
		//alert(_CheckSuccess);
		if(_CheckSuccess)
		{
			newTokenSetup();
			_CheckSuccess = true; //work around, as otherwise, if everything went well, it would always return false.
		}
		else
		{
			putMessage("~~~PARSE ERROR statement improperly parsed on line " + _CurrentToken.lineNumber + ", character " + _CurrentToken.position);
			_ErrorCount++;
			break;
		}
	}
	
	if(_CheckSuccess) //temporarily here.
	{
		return true;
	}
	else
	{
		return false; //thought about putting some kind of error message, but felt I already was about this, not sure yet.
	}	
}

function parseStatement()
{
	putMessage("-Beginning Parse of a Statement");
	if(match("print"))
	{
		_CheckSuccess = parsePrintStatement();
	}
	else if(match("var_id"))
	{
		_CheckSuccess = parseAssignmentStatement();
	}
	else if(matchType())
	{
		_CheckSuccess = parseVarDecl();
	}
	else if(match("while"))
	{
		_CheckSuccess = parseWhileStatement();
	}
	else if(match("if"))
	{
		_CheckSuccess = parseIfStatement();
	}
	else if(match("left_brace"))
	{
		_Index--; //to offset the incrementing that occurs to get here, as parseBlock() looks for the left brace again... which also means the text must be corrected... will fix after it is known to work.
		_CheckSuccess = parseBlock();
	}
	return _CheckSuccess;
}

function parsePrintStatement()
{
	newTokenSetup();
	if(match("left_paren")) //left token of print statement
	{
		_CheckSuccess = parseExpr();
		if(_CheckSuccess)
		{
			newTokenSetup(); //check for the right token after parsing expr
			if(match("right_paren"))
			{
				putMessage("-Valid Print Statement Parsed");
				return true;
			}
			else
			{
				putMessage("~~~PARSE ERROR invalid print statement, right parenthesis expected, but not found " + _CurrentToken.lineNumber + ", character " + _CurrentToken.position);
				_ErrorCount++;
				return false;
			}
		}
		else
		{
			putMessage("~~~PARSE ERROR invalid print statement, expression not parsed properly " + _CurrentToken.lineNumber + ", character " + _CurrentToken.position);
			_ErrorCount++;
			return false;
		}
	}
	else
	{
		putMessage("~~~PARSE ERROR invalid print statement, left parenthesis not found at line " + _CurrentToken.lineNumber + ", character " + _CurrentToken.position);
		_ErrorCount++;
		return false;
	}
}

function parseAssignmentStatement()
{
	var tokenToAssignTo = _CurrentToken;
	newTokenSetup();
	if(match("assignment_op"))
	{
		_CheckSuccess = parseExpr();
		if(_CheckSuccess)
		{
			putMessage("-Valid Assignment Statement parsed");
			return true;
		}
		else
		{
			putMessage("~~~PARSE ERROR invalid assignment statement, invalid expression " + _CurrentToken.lineNumber + ", character " + _CurrentToken.position);
			_ErrorCount++;
			return false;
		}
	}
	else
	{
		putMessage("~~~PARSE ERROR invalid assignment statement, assignment operator missing on line " + _CurrentToken.lineNumber + ", character " + _CurrentToken.position);
		_ErrorCount++;
		return false;
	}
}

function parseVarDecl() // we arrive here already knowing a type
{
	newTokenSetup();
	if(match("var_id"))
	{
		putMessage("-Valid Variable Declaration Statement parsed");
		return true;
	}
	else
	{
		putMessage("~~~PARSE ERROR invalid variable declaration statement, invalid variable token on line " + _CurrentToken.lineNumber + ", character " + _CurrentToken.position);
		_ErrorCount++;
		return false;
	}
}

function parseWhileStatement()
{
	newTokenSetup();
	_CheckSuccess = parseBooleanExpr();
	if(_CheckSuccess)
	{
		_CheckSuccess = parseBlock();
		if(_CheckSuccess)
		{
			putMessage("-Valid While Statement parsed");
			return true;
		}
		else
		{
			putMessage("~~~PARSE ERROR invalid while statement, invalid block on line " + _CurrentToken.lineNumber + ", character " + _CurrentToken.position);
			_ErrorCount++;
			return false;
		}
	}
	else
	{
		putMessage("~~~PARSE ERROR invalid while statement, invalid boolean expression on line " + _CurrentToken.lineNumber + ", character " + _CurrentToken.position);
		_ErrorCount++;
		return false;
	}
}

function parseIfStatement()
{
	newTokenSetup();
	_CheckSuccess = parseBooleanExpr();
	if(_CheckSuccess)
	{
		_CheckSuccess = parseBlock();
		if(_CheckSuccess)
		{
			putMessage("-Valid If Statement parsed");
			return true;
		}
		else
		{
			putMessage("~~~PARSE ERROR invalid if statement, invalid block on line " + _CurrentToken.lineNumber + ", character " + _CurrentToken.position);
			_ErrorCount++;
			return false;
		}
	}
	else
	{
		putMessage("~~~PARSE ERROR invalid if statement, invalid boolean expression on line " + _CurrentToken.lineNumber + ", character " + _CurrentToken.position);
		_ErrorCount++;
		return false;
	}
}

function parseExpr()
{
	newTokenSetup();
	if(match("digit"))
	{
		_CheckSuccess = parseIntExpr();
	}
	else if(match("string"))
	{
		_CheckSuccess = parseStringExpr();
	}
	
	else if(match("var_id"))
	{
		_CheckSuccess = parseId();
	}
	else if(match("left_paren") || match("false") || match("true"))
	{
		_CheckSuccess = parseBooleanExpr();
	}
	else
	{
		putMessage("~~~PARSE ERROR invalid expression on line " + _CurrentToken.lineNumber + ", character " + _CurrentToken.position);
		_ErrorCount++;
		return false;
	}
	return _CheckSuccess;
}

function parseIntExpr() //bit messier than I would have like but mainly to fix issue with printing the same token twice
{
	_CurrentToken = _TokenList[_Index]; //do not increment in case we only had a digit for this statement
	_CheckSuccess = false; //most likely unnecessary, but just in case, weird edge case
	if(match("plus_op")) // means this is more than just an digit, otherwise, assume it is just a digit, and move back up the recursion
	{
		putMessage("-Parsing token: " + _CurrentToken.type + " on line " + _CurrentToken.lineNumber + ", character " + _CurrentToken.position);
		_Index++;
		_CheckSuccess = parseExpr();
		return _CheckSuccess; // should have finished the intExpr here, so, just send the result up. This seems wrong, so we shall see.
	}
	else // just a digit, which is valid and should simply move up.
	{
		//_Index = _Index - 1; // to offset the call to newTokenSetup(), as it will be on the next statement's first token, and the ++ that happens to _Index when calling it.
		return true;
	}
}

function parseStringExpr() //string is already defined... so if we reach this point, we have said string... therefore just return true, for now, until the actual statement outputting comes in
{
	return match("string"); //could just return true, thought this would make more sense as a placeholder
}

function parseBooleanExpr()
{
	//newTokenSetup(); //should be either a left paren, true or false
	if(match("left_paren"))
	{
		_CheckSuccess = parseExpr();
		if(_CheckSuccess)
		{
			newTokenSetup();
			if(match("boolop_equal") || match("boolop_not_equal"))
			{
				//newTokenSetup();
				_CheckSuccess = parseExpr();
				if(_CheckSuccess)
				{
					newTokenSetup();
					_CheckSuccess = match("right_paren");
					if(_CheckSuccess)
					{
						putMessage("-Valid Boolean Expression parsed");
						return true;
					}
					else
					{
						putMessage("~~~PARSE ERROR invalid boolean expression, right parenthesis not found on line " + _CurrentToken.lineNumber + ", character " + _CurrentToken.position);
						_ErrorCount++;
						return false;
					}
				}
				else
				{
					putMessage("~~~PARSE ERROR invalid boolean expression, invalid token on line " + _CurrentToken.lineNumber + ", character " + _CurrentToken.position);
					_ErrorCount++;
					return false;
				}
			}
			else
			{
				putMessage("~~~PARSE ERROR invalid boolean expression, invalid boolean operator on line " + _CurrentToken.lineNumber + ", character " + _CurrentToken.position);
				_ErrorCount++;
				return false;
			}
		}
		else
		{
			putMessage("~~~PARSE ERROR invalid boolean expression, invalid token on line " + _CurrentToken.lineNumber + ", character " + _CurrentToken.position);
			_ErrorCount++;
			return false;
		}
	}
	else if(match("true") || match("false"))
	{
		//putMessage("-Valid Boolean Expression parsed");
		return true;
	}
	else
	{
		putMessage("~~~PARSE ERROR invalid boolean expression, invalid token on line " + _CurrentToken.lineNumber + ", character " + _CurrentToken.position);
		_ErrorCount++;
		return false;
	}
}

function parseId() //same as string
{
	return match("var_id");
}

function match(tokenType)
{
	return _CurrentToken.type === tokenType;
}

function matchType()
{
	return ((_CurrentToken.type === "int") || (_CurrentToken.type === "string") || (_CurrentToken.type === "boolean"));
}

function checkTokensRemaining()
{
	return _Index <= _TokenList.length;
}

function newTokenSetup() //gets the new token, adds it to the output, and resets _CheckSuccess, as all of those occur in order in most of the parse functions.
{
	if(checkTokensRemaining())
	{
		_CurrentToken = _TokenList[_Index++]; 
		putMessage("-Parsing token: " + _CurrentToken.type + " on line " + _CurrentToken.lineNumber + ", character " + _CurrentToken.position);
		_CheckSuccess = false;
		//tokenToString(_CurrentToken);
	}
	else
	{
		putMessage("~~~PARSE ERROR ran out of tokens when a token was needed");
		_ErrorCount++;
	}
}
