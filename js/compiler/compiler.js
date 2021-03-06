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
			putMessage("");  //CST generation and displaying
			buildCST();
			// putMessage("");
			// putMessage("Now Displaying CST.");
			// putMessage("The Jit library looks nice, though is not the fastest to respond the first time.");
			// putMessage("So please wait, and complain to the JIT library writer if it is not fast enough.");
			// init('infovis', _CSTjson);
			
			putMessage("");  //AST generation and displaying
			buildAST();
			// putMessage("");
			// putMessage("Now Displaying AST.");
			// putMessage("The Jit library looks nice, though is not the fastest to respond the first time.");
			// putMessage("So please wait, and complain to the JIT library writer if it is not fast enough.");
			// init('infovisAST', _ASTjson);
			
			putMessage("");
			generateSymbolTable();
			if(_ErrorCount === 0)
			{
				putMessage("");
				putMessage("Now Displaying CST.");
				init('infovis', _CSTjson);
				putMessage("");
				putMessage("Now Displaying AST.");
				init('infovisAST', _ASTjson);
				putMessage("");
				putMessage("Note for both CST and AST display:");
				putMessage("Depending on how large the program is, the Tree may seem unresponsive");
				putMessage("Also, I recommend dragging on the labels");
				putMessage("");
				generateCode();
			}
		}
	}
}