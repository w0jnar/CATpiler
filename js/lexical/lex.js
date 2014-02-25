//
//lex.js
//

function lex()
{
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
			putMessage("-Found " + currentCharacter().toString()); //.toString() mostly unnecessary, but you never know, aka, if something breaks, it will not be noticed (by the debugger)
		}
	}
}

function currentCharacter()
{
	currentSymbol = inputProgram[i];
	if(currentSymbol === "\n")
		return "newline";
	else if(currentSymbol === " ")
		return "space";
	else if(currentSymbol === "\t") //not even possible at this point, but you never know
		return "tab";
	else
		return currentSymbol;
}
