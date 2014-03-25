//
//compiler.js
//

function compile() //figured editing this was easier/cleaner than going back and forth with putting code in a button.
{
	lex();
	if(_ErrorCount === 0 && false)
	{
		parse();
	}
}