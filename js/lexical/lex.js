//
//lex.js
//

function lex()
{
	document.getElementById("taOutput").scroll = 1;
	document.getElementById("taOutput").value = "";
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
			putMessage("-Found " + currentCharacter().toString());
		}
	}
}

function currentCharacter()
{
	var currentChar = inputProgram[i];
	if(currentChar === "\n")
		return "newline";
	else if(currentChar === " ") //not even possible at this point, but you never know
		return "space";
	else if(currentChar === "\t") //not even possible at this point, but you never know
		return "tab";
	else return currentChar;
}
