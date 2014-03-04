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
			currentChar = currentCharacter();
			if(currentChar === "space" || currentChar === "newline" || currentChar === "tab") //space
			{
				
			}
			else
			{
				putMessage("Lexing Character");
				putMessage("-Found: " + currentChar.toString()); //.toString() mostly unnecessary, but you never know, aka, if something breaks, it will not be noticed (by the debugger).
				//alert(isLetter(nextCharacter()));
				if(currentChar.match(/\d/)) //digits
				{
					createToken(currentChar, "digit");
				}
				else if((currentChar.match(/[a-z]/)) && (!nextCharacter().match(/[a-z]/))) //var ids
				{
					createToken(currentChar, ("var_id(" + currentChar + ")"));
				}
				else if(currentChar.match(/[\(\)\{\}]/)) //brace characters
				{
					braceHandle(currentChar);
				}
				else if((currentChar.match(/[a-z]/)) && (nextCharacter().match(/[a-z]/))) //keywords
				{
					keywordMatch(currentChar);
				}
				else if((currentChar === "\"") && (isLetter(nextCharacter()))) //strings
				{
					stringMatch(currentChar);
				}
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

function braceHandle(character) //handles brace characters
{
	if(currentChar.match(/[\(]/))
	{
		createToken(currentChar, ("left_paren"));
	}
	else if(currentChar.match(/[\)]/))
	{
		createToken(currentChar, ("right_paran"));
	}
	else if(currentChar.match(/[\{]/))
	{
		createToken(currentChar, ("left_brace"));
	}
	else if(currentChar.match(/[\{]/))
	{
		createToken(currentChar, ("right_brace"));
	}
}

function keywordMatch(currentCharacter) //matches a current character(s) to the next set to see if it is a keyword
{
	var nextSpace = findNextSpace();
	var currentWord = inputProgram.substr(i, nextSpace);
	//alert(currentWord);
	createToken(currentWord, "string...");
	i = i + nextSpace - 1;
}

function findNextSpace()
{
	var index = i;
	while(inputProgram[index] !== " ")
	{
		index++;
	}
	return index - i;
}

function stringMatch(currentCharacter) //matches a current character(s) to find a string
{
	var stringEnd = findStringEnd();
	var currentWord = inputProgram.toString().substr((i + 1), stringEnd);
	//alert(currentWord);
	createToken(currentWord, ("string(\"" + currentWord + "\")"));
	i = i + stringEnd;
}

function findStringEnd()
{
	var index = i;
	while(inputProgram[index + 1] !== "\"" && index < inputProgram.length)
	{
		index++;
	}
	if((index + 1) > inputProgram.length)
	{
		putMessage("--ERROR string end not found before end of file on line " + _LineNumber + " character " + _SymbolLineLocation);
		_ErrorCount++;
	}
	return index - i;
}

function isLetter(character)
{
	var test = character.match(/[a-z]/);
	//alert(test);
	return (test !== null);
}
