//
//lex.js
//

function lex()
{
	
	reset();
	inputProgram = document.getElementById("taUserInput").value;
	
	if(inputProgram.length === 0)
	{
		putMessage("Error, Program Not Found");
	}
	else
	{
		putMessage("Starting Lexical Analysis");
		for(i = 0; i < inputProgram.length; i++)
		{
			putMessage("Lexing Character");
			putMessage("-Found: " + currentCharacter().toString()); //.toString() mostly unnecessary, but you never know, aka, if something breaks, it will not be noticed (by the debugger).
			currentChar = currentCharacter();
			
			if(!isNaN(parseInt(currentChar)))
			{
				createToken(currentChar, "digit");
			}
			else if(currentChar === "space")
			{
				createToken(currentChar, "space");
			}
			else if((currentChar.match(/[a-z]/)) && ((nextCharacter() === " ") || (nextCharacter() === "\n")) && _NotMidParse)
			{
				createToken(currentChar, ("var_id(" + currentChar + ")"));
			}
		}
		putMessage("Ending Lexical Analysis");
		if(_ErrorCount > 0)
		{
			putMessage("Oh No! Errors Found! Check Code for details");
			_ErrorCount = 0;
		}
		else
		{
			putMessage("No Errors Found! Nice!");
		}
	}
}

function currentCharacter()
{
	if(i < inputProgram.length)
	{
		currentSymbol = inputProgram[i];
		_SymbolLineLocation++;
		if(currentSymbol === "\n")
		{
			_SymbolLineLocation = 0;
			_LineNumber++;
			return "newline";
		}
		else if(currentSymbol === " ")
			return "space";
		else if(currentSymbol === "\t") //not even possible at this point, but you never know
			return "tab";
		else
			return currentSymbol;
	}
}

function nextCharacter()
{
	if((i + 1) < inputProgram.length)
	{
		nextSymbol = inputProgram[i + 1];
		return nextSymbol;
	}
}

