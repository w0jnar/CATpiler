//
//compiler.js
//

function compile() //figured editing this was easier/cleaner than going back and forth with putting code in a button.
{
	lex();
	if(_ErrorCount === 0)
	{
		putMessage("");
		parse();
		if(_ErrorCount === 0)
		{
			putMessage("");
			//buildCST();
			//putMessage("");
			putMessage("\nNow Displaying CST. Please wait 10 seconds before attempting to click on the nodes.");
			putMessage("The Jit library looks nice, though is not the fastest to respond the first time.");
			init();
		}
	}
}