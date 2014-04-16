//
//cstBuilder.js
//

function buildCST()
{
	putMessage("Now building Concrete Syntax Tree");
	_Index = 0;
	//tokenToNode();
	//_CSTjson = JSON.parse(tokenToNode());
	// _CSTjson = tokenToNode();
	// _CurrentToken = _TokenList[_Index++];
	// _CSTjson = addChild(_CSTjson);
	// _CSTjson = JSON.parse(_CSTjson);
	putMessage("--Building Program Node");
	var programJSONstring = parseToNode("Program", parseProgramTree())
	_CSTjson = JSON.parse(programJSONstring);
}

function parseProgramTree()
{
	putMessage("--Building Block Node");
	var blockJSONString = parseToNode("Block", parseBlockTree()); //parses the total block of the tree.
	putMessage("--Building End of File Node");
	var eofNode = tokenToNode(); //at this point, should be finished with the entire program other than the end of file token.
	var programsChildrenString = blockJSONString + ", " + eofNode;
	return programsChildrenString;
}

function parseBlockTree()
{
	putMessage("--Building Left Bracket Node");
	var leftBracketNode = tokenToNode();
	var statementListJSONString = parseToNode("StatementList", parseStatementListTree()); //parses the total block of the tree.
	putMessage("--Building Right Bracket Node");
	var rightBracketNode = tokenToNode();
	var blocksChildrenString = leftBracketNode + ", " + statementListJSONString + ", " + rightBracketNode;
	return blocksChildrenString;
}

function parseStatementListTree()
{
	putMessage("--Building StatementList Node");
	_CurrentToken = _TokenList[_Index];
	//tokenToString(_CurrentToken);
	var statementListChildrenString = "";
	if(!match("right_brace")) //check if we are at the right brace yet, otherwise, we are at a statement.
	{
		var statementNode = parseToNode("Statement", parseStatementTree());
		var statementListNode = parseToNode("StatementList", parseStatementListTree());
		statementListChildrenString = statementNode + ", " + statementListNode;
	}
	else
	{
		statementListChildrenString = parseToNode(String.fromCharCode(949), ""); //epsilon
	}
	return statementListChildrenString;
}

function parseStatementTree()
{
	putMessage("--Building Statement Node");
	var statementChildrenString = "";
	if(match("print"))
	{
		putMessage("--Building Print Statement Node");
		statementChildrenString = parseToNode("PrintStatement", parsePrintStatementTree());
	}
	else if(match("var_id"))
	{
		putMessage("--Building Assignment Statement Node");
		statementChildrenString = parseToNode("AssignmentStatement", parseAssignmentStatementTree());
	}
	else if(matchType())
	{
		putMessage("--Building Variable Declaration Statement Node");
		statementChildrenString = parseToNode("VarDeclStatement", parseVarDeclStatementTree());
	}
	else if(match("while"))
	{
		putMessage("--Building While Node");
		statementChildrenString = parseToNode("WhileStatement", parseWhileStatementTree());
	}
	else if(match("if"))
	{
		putMessage("--Building If Node");
		statementChildrenString = parseToNode("IfStatement", parseIfStatementTree());
	}
	else if(match("left_brace"))
	{
		statementChildrenString = parseToNode("Block", parseBlockTree());
	}
	//alert(statementChildrenString.length);
	return statementChildrenString;
}

function parsePrintStatementTree()
{
	putMessage("--Building Print Node");
	var printNode = tokenToNode();
	putMessage("--Building Left Parenthesis Node");
	var leftParenNode = tokenToNode();
	var exprChildrenString = parseToNode("Expr", parseExprTree());
	putMessage("--Building Right Parenthesis Node");
	var rightParenNode = tokenToNode();
	var printStatementChildrenString = printNode + ", " + leftParenNode + ", " + exprChildrenString + ", " + rightParenNode;
	return printStatementChildrenString;
}

function parseAssignmentStatementTree()
{
	var idChildrenString = parseToNode("Id", parseIdTree());
	putMessage("--Building Assignment Op Node");
	var assignmentNode = tokenToNode();
	var exprChildrenString = parseToNode("Expr", parseExprTree());
	var assignmentStatementChildrenString = idChildrenString + ", " + assignmentNode + ", " + exprChildrenString;
	return assignmentStatementChildrenString; 
}

function parseVarDeclStatementTree()
{
	putMessage("--Building Type Node");
	var typeNode = tokenToNode();
	var idChildrenString = parseToNode("Id", parseIdTree());
	var varDeclStatementChildrenString = typeNode + ", " + idChildrenString;
	return varDeclStatementChildrenString; 
}

function parseWhileStatementTree()
{
	var whileNode = tokenToNode();
	_CurrentToken = _TokenList[_Index];
	var boolExprString = parseToNode("BooleanExpr", parseBooleanExprTree());
	var blockString = parseToNode("Block", parseBlockTree());
	var whileStatementString = whileNode + ", " + boolExprString + ", " + blockString;
	return whileStatementString;
}

function parseIfStatementTree()
{
	var ifNode = tokenToNode();
	_CurrentToken = _TokenList[_Index];
	var boolExprString = parseToNode("BooleanExpr", parseBooleanExprTree());
	var blockString = parseToNode("Block", parseBlockTree());
	var ifStatementString = ifNode + ", " + boolExprString + ", " + blockString;
	return ifStatementString;
}

function parseExprTree()
{
	putMessage("--Building Expr Node");
	_CurrentToken = _TokenList[_Index];
	var exprChildrenString = "";
	if(match("digit"))
	{
		putMessage("--Building IntExpr Node");
		exprChildrenString = parseToNode("IntExpr", parseIntExprTree());
	}
	else if(match("string"))
	{
		putMessage("--Building StringExpr Node");
		exprChildrenString = parseToNode("StringExpr", parseStringExprTree());
	}
	else if(match("left_paren") || match("false") || match("true"))
	{
		putMessage("--Building BooleanExpr Node");
		exprChildrenString = parseToNode("BooleanExpr", parseBooleanExprTree());
	}
	else if(match("var_id"))
	{
		putMessage("--Building Id Node");
		exprChildrenString = parseToNode("Id", parseIdTree());
	}
	return exprChildrenString;
}

function parseIntExprTree()
{
	putMessage("--Building Digit Node");
	var digitNode = parseToNode("Digit", parseDigitTree());
	_CurrentToken = _TokenList[_Index];
	var intExprChildrenString = digitNode;
	if(match("plus_op")) //more than just a digit
	{
		putMessage("--Building Plus Op Node");
		var plusOpNode = tokenToNode();
		var exprChildrenString = parseToNode("Expr", parseExprTree());
		intExprChildrenString = intExprChildrenString + ", " + plusOpNode + ", " + exprChildrenString;
	}
	return intExprChildrenString;
}

function parseStringExprTree()
{
	putMessage("--Building CharList Node");
	var charListNode = parseToNode("CharList", parseStringTree());
	return charListNode;
}

function parseBooleanExprTree()
{
	var booleanExprChildrenString = "";
	//tokenToString(_CurrentToken);
	if(match("left_paren"))
	{
		putMessage("--Building Left Parenthesis Node");
		var leftParenNode = tokenToNode();
		var leftExprChildrenString = parseToNode("Expr", parseExprTree());
		if(match("boolop_equal"))
		{
			putMessage("--Building Boolean Operator Equal Node");
		}
		else if(match("boolop_not_equal"))
		{
			putMessage("--Building Boolean Operator Not Equal Node");
		}
		var boolOpChildrenString = parseToNode("BoolOp", parseBoolOpTree());
		var rightExprChildrenString = parseToNode("Expr", parseExprTree());
		putMessage("--Building Right Parenthesis Node");
		var rightParenNode = tokenToNode();
		booleanExprChildrenString = leftParenNode + ", " + leftExprChildrenString + ", " + boolOpChildrenString + ", " + rightExprChildrenString + ", " + rightParenNode;
	}
	else if(match("true") || match("false")) //realistically could be else, just figured it made more sense to keep it.
	{
		putMessage("--Building BoolVal Node");
		booleanExprChildrenString = parseToNode("BoolVal", parseBoolValTree());
	}
	return booleanExprChildrenString;
}

function parseIdTree()
{
	putMessage("--Building Char Node");
	var idChildrenString = parseToNode("Char", parseCharTree());
	return idChildrenString;
}

function parseDigitTree()
{
	return tokenToNode();
}

function parseStringTree() //this is because spaces and JIT do not like each other.
{
	var string = tokenToNode();
	var stringJSON = JSON.parse(string);
	
	var newString = stringJSON.name.toString(); //remove the spacer to preserve the original string, 
	while(newString.substr(0, _Spacer.length) === _Spacer)
	{
		newString = newString.substr(_Spacer.length, newString.length);
	}
	
	//var newString = stringJSON.name.toString().replace(/ /g, "&nbsp;");
	var newString = newString.replace(/ /g, "&nbsp;");  //then convert it,
	newString = "\"" + newString + "\"";
	newString = spacer(newString) + newString; //then add the new spacer.
	//alert(unique.name);
	stringJSON.name = newString;
	return JSON.stringify(stringJSON);
}

function parseCharTree()
{
	return tokenToNode();
}

function parseBoolOpTree()
{
	return tokenToNode();
}

function parseBoolValTree()
{
	//tokenToString(_CurrentToken);
	return tokenToNode();
}

function tokenToNode()
{
	_CurrentToken = _TokenList[_Index++];
	//tokenToString(_CurrentToken);
	var id = _CurrentToken.lineNumber.toString() + "_" + _CurrentToken.position.toString(); //node id's have to be unique, therefore, we use line number and position to define the id's, as every token should have a unique position.
	var name = _CurrentToken.value.toString();
	var string = '{"id":"node'+ id + '","name":"' + spacer(name) + name + '","data":{},"children":[]}';
	//var string = '{"id":"node","name":"name","data":{},"children":[{"id": "node46","name":"4.6","data": {},"children":[]}, {"id": "node23","name":"2.6","data": {},"children":[]}]}';
	//alert(string);
	//return JSON.parse(string);
	return string;
}

function parseToNode(type, children)
{
	var id = _NonTokenNodeCount.toString(); //node id's have to be unique, therefore, we use line number and position to define the id's, as every token should have a unique position.
	_NonTokenNodeCount++;
	var name = type;
	var string = '{"id":"node'+ id + '","name":"' + spacer(name) + name + '","data":{},"children":[' + children + ']}';
	//var string = '{"id":"node","name":"name","data":{},"children":[{"id": "node46","name":"4.6","data": {},"children":[]}, {"id": "node23","name":"2.6","data": {},"children":[]}]}';
	//alert(string);
	//return JSON.parse(string);
	return string;
}

function spacer(name) //adds a spacer for nicer node allignment.
{
	var spaceString = "";
	if(name.length < _NameLengthMax)
	{
		var size = _SpacerSize - name.length;
		for(var i = 0; i < size; i++)
		{
			spaceString = spaceString + _Spacer;
		}
		if(name.length === 1)
		{
			spaceString = spaceString + _Spacer;
		}
	}
	else
	{
		spaceString = _Spacer;
	}
	return spaceString;
}


//currently not used, hopefully never used.
function addChild(string)
{
	var location = string.indexOf("\"children\":[{"); //check if this is the first child or not, if this returns -1, there are no children yet.
	if(location === -1) 
	{
		var location = string.indexOf("\"children\":[") + 12; //the location of the children list start, plus how many characters to offset by for the child
		var newNodeString = tokenToNode();
		var newJSONstring = string.substr(0, location) + newNodeString + string.substr(location, string.length);
		alert(newJSONstring);
	}
	else //there is already a child. Not sure if necessary if built recursively.
	{
		
	}
	return newJSONstring;
}