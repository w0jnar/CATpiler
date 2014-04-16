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
			buildCST();
			putMessage("");
			putMessage("Now Displaying CST.");
			putMessage("The Jit library looks nice, though is not the fastest to respond the first time.");
			putMessage("So please wait, and complain to the JIT library writer if it is not fast enough.");
			putMessage("Also, I am not liable for strings over 11 characters not looking pretty.");
			init();
		}
	}
}