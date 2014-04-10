//
//lex.js
//

function lex()
{
	
	reset(); //reset the entire process. I thought it would work well here as Lex will always occur first and I am still not sure how I feel about the index.html situation.
	inputProgram = document.getElementById("taUserInput").value;
	
	if(inputProgram.length === 0)
	{
		putMessage("~~~Error, Program Not Found");
		_ErrorCount++;
	}
	else
	{
		putMessage("~~~Starting Lexical Analysis");
		for(i = 0; i < inputProgram.length; i++)
		{
			currentChar = currentCharacter();
			_CharacterGet = false;
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
				else if((currentChar.match(/[a-z]/)) && (!letterMatch.test(nextCharacter()))) //var ids
				{
					createToken(currentChar, "var_id");
				}
				else if(currentChar.match(/[\(\)\{\}]/)) //brace characters
				{
					braceHandle(currentChar);
				}
				else if((currentChar.match(/[a-z]/)) && (nextCharacter().match(/[a-z]/))) //keywords
				{
					keywordMatch(currentChar);
				}
				else if((currentChar === "\"")/* && (isLetter(nextCharacter()) || nextCharacter() === " ")*/) //strings
				{
					stringMatch(currentChar);
				}
				else if(currentChar === "=") //equals
				{
					equalSignCheck();
				}
				else if(currentChar === "!" && nextCharacter() === "=") //int ops
				{
					notEqualCheck();
				}
				else if(currentChar === "+") //int ops
				{
					createToken(currentChar, "plus_op");
				}
				else if(currentChar === _EOF)
				{
					createToken(currentChar, "end_of_file");
					_EOFCount++;
					if(nextCharacter() !== undefined) //was considering ignoring whitespace, but at the same time, it wwould still be ignored.
					{
						putMessage("~~~WARNING code after end of file on line " + _LineNumber + ", character " + _SymbolLineLocation + " will be ignored");
						_WarningCount++;
					}
					break;
				}
				else
				{
					putMessage("~~~SYNTAX ERROR invalid character on line " + _LineNumber + ", character " + _SymbolLineLocation);
					_ErrorCount++;
				}
			}
			_CharacterGet = true;
		}
		if(_EOFCount === 0)
		{
			putMessage("~~~WARNING end of file reached before finding EOF marker on line " + _LineNumber + ", character " + _SymbolLineLocation);
			putMessage("~~~WARNING appending EOF");
			createToken("$", "end_of_file");
			_WarningCount++;
		}
		
		if(_ErrorCount > 0 || _WarningCount > 0)
		{
			putMessage("Error Count: " + _ErrorCount + ", Warning Count: " + _WarningCount);
			putMessage("Oh No! Errors Found! Check Code for details");
		}
		else
		{
			putMessage("No Lexical Errors Found! Nice!");
		}
		
		putMessage("~~~Ending Lexical Analysis");
	}
}

function currentCharacter() //returns the current character we are on.
{
	if(i < inputProgram.length)
	{
		if(_CharacterGet === true)
		{
			_SymbolLineLocation++;
		}
		currentSymbol = inputProgram[i];
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

function nextCharacter() //next character...
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
		createToken(currentChar, ("right_paren"));
	}
	else if(currentChar.match(/[\{]/))
	{
		createToken(currentChar, ("left_brace"));
	}
	else if(currentChar.match(/[\}]/))
	{
		createToken(currentChar, ("right_brace"));
	}
}

function keywordMatch(currentCharacter) //matches a current character(s) to the next set to see if it is a keyword.
{
	var nextSpace = findNextNonLetter();
	var currentWord = inputProgram.substr(i, nextSpace).replace(/\s/g, '');
	//alert(currentWord);
	putMessage("-Word Found: " + currentWord);
	putMessage("-Checking if Keyword");
	if(currentWord === "int")
	{
		createToken(currentWord, "int");
	}
	else if(currentWord === "string")
	{
		createToken(currentWord, "string");
	}
	else if(currentWord === "boolean")
	{
		createToken(currentWord, "boolean");
	}
	else if(currentWord === "print")
	{
		createToken(currentWord, "print");
	}
	else if(currentWord === "if")
	{
		createToken(currentWord, "if");
	}
	else if(currentWord === "while")
	{
		createToken(currentWord, "while");
	}
	else if(currentWord === "false")
	{
		createToken(currentWord, "false");
	}
	else if(currentWord === "true")
	{
		createToken(currentWord, "true");
	}
	else
	{
		putMessage("~~~SYNTAX ERROR invalid word found on line " + _LineNumber + ", character " + _SymbolLineLocation);
		_ErrorCount++;
	}
	//createToken(currentWord, "string...");
	_SymbolLineLocation += nextSpace - 2;
	i = i + nextSpace - 1; //modifies i to move past the rest of the string.
}

function findNextNonLetter() //finds the dividing space for accurate string manipulation. Now obsolete because wrong check.
{
	var index = i;
	while((letterMatch.test(inputProgram[index]) && index < inputProgram.length))
	{
		putMessage("---" + inputProgram[index] + " Found, checking next symbol");
		index++;
		//alert("MEOW");
	}
	return index - i;
}

function stringMatch(currentCharacter) //matches a current character(s) to find a string.
{
	var stringEnd = findStringEnd();
	//alert(stringEnd);
	var currentWord = inputProgram.toString().substr((i + 1), stringEnd);
	//alert(currentWord);
	//alert(stringMatchRegEx.test(currentWord));
	if(stringMatchRegEx.test(currentWord) || stringEnd === 0)
	{
		createToken(currentWord, "string");
	}
	else
	{
		putMessage("~~~SYNTAX ERROR Improper symbol found in string on line " + _LineNumber + ", character " + _SymbolLineLocation);
		_ErrorCount++;
	}
	_SymbolLineLocation += stringEnd + 1;
	i = i + stringEnd + 1;
}

function findStringEnd() //find where a string ends by looking for the next quote.
{
	var index = i;
	while(inputProgram[index + 1] !== "\"" && index < inputProgram.length)
	{
		if(wsMatch.test(inputProgram[index + 1]))
		{
			putMessage("---whitespace Found, checking next symbol");
		}
		else
		{
			putMessage("---" + inputProgram[index + 1] + " Found, checking next symbol");
		}
		//alert(inputProgram[index]);
		index++;
	}
	if((index + 1) > inputProgram.length)
	{
		putMessage("~~~SYNTAX ERROR string end not found before end of file on line " + _LineNumber + ", character " + _SymbolLineLocation);
		_ErrorCount++;
	}
	return index - i;
}

function isLetter(character) //checks if a character is a letter. RegEx were not agreeing with outputs from functions, making this necessary.
{
	var test = character.match(/[a-z]/); //removed uppercase support as it did not seem right with 6502a.
	//alert(test);
	return (test !== null);
}

function equalSignCheck() //check what an equal sign means.
{
	putMessage("--\"=\" Found, checking next character");
	//var nextSpace = findNextSpace();
	//var currentWord = inputProgram.substr(i, nextSpace);
	var nextSymbol = nextCharacter();
	if(nextSymbol === "=")
	{
		createToken("==", "boolop_equal");
	}
	else
	{
		createToken(currentChar, "assignment_op");
	}
	//i = i + nextSpace - 1; //to offset the next character.
}

function notEqualCheck() //check if ! means not equal or not.
{
	putMessage("--\"!\" Found, checking next character");
	var nextSpace = findNextSpace();
	var currentWord = inputProgram.substr(i, nextSpace);
	if(currentWord === "!=")
	{
		createToken("!=", "boolop_not_equal");
	}
	else
	{
		putMessage("~~~SYNTAX ERROR invalid character combination starting with \"!\" on line " + _LineNumber + ", character " + _SymbolLineLocation);
		_ErrorCount++;
	}
	i = i + nextSpace - 1; //to offset the next character.
}

//obsolete

function findNextSpace() //finds the dividing space for accurate string manipulation. Now obsolete because wrong check.
{
	var index = i;
	while((!wsMatch.test(inputProgram[index]) && index < inputProgram.length))
	{
		index++;
		//alert("MEOW");
	}
	return index - i;
}
