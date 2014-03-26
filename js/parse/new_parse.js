//
//new_parse.js
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

