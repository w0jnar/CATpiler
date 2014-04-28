//
//astBuilder.js
//

//admittedly, most of this will be cstBuilder, but there will be some modifications.
//also, there is very clear repetition in terms of similar structured functions.
//these are mainly to clarify what is going on, as though I could change them all to one function,
//it would seem a lot like using "magic numbers."

//also, considered building the CST and the AST into parse, but it just made thinks seem convoluted and quite confusing.
//it could most likely be done, but it would just get messy and not as simply stated.

function buildAST()
{
	putMessage("Now Building Concrete Syntax Tree from Tokens");
	_Index = 0;
	putMessage("--Building Statement Block Node");
	var programJSONstring = parseToNode("stmtBlock", parseASTBlockTree());
	_ASTjson = JSON.parse(programJSONstring);
}

function parseASTBlockTree()
{
	var leftBracketNode = tokenToNode(); //still parse the token to make space. I could remove the variable, but it helps to keep track.
	var statementListJSONString =  parseASTStatementListTree(); //parses the total block of the tree.
	var rightBracketNode = tokenToNode();
	var blocksChildrenString = statementListJSONString;
	return blocksChildrenString;
}

function parseASTStatementListTree()
{
	_CurrentToken = _TokenList[_Index];
	//tokenToString(_CurrentToken);
	var statementListChildrenString = "";
	if(!match("right_brace"))
	{
		var statementNode = parseASTStatementTree();
		statementListChildrenString = statementNode;
		_CurrentToken = _TokenList[_Index];
	}
	while(!match("right_brace")) //check if we are at the right brace yet, otherwise, we are at a statement.
	{
		var statementNode = parseASTStatementTree();
		statementListChildrenString = statementListChildrenString + ", " + statementNode;
		_CurrentToken = _TokenList[_Index];
	}
	return statementListChildrenString;
}

function parseASTStatementTree()
{
	var statementChildrenString = "";
	if(match("print"))
	{
		putMessage("--Building Print Node");
		statementChildrenString = parseASTPrintStatementTree();
	}
	else if(match("var_id"))
	{
		putMessage("--Building Assignment Node");
		statementChildrenString = parseToNode("assignment", parseASTAssignmentTree());
	}
	else if(matchType())
	{
		putMessage("--Building Variable Declaration Node");
		statementChildrenString = parseToNode("varDecl", parseASTVarDeclTree());
	}
	else if(match("while"))
	{
		putMessage("--Building While Node");
		statementChildrenString = parseToNode("while", parseASTWhileTree());
	}
	else if(match("if"))
	{
		putMessage("--Building If Node");
		statementChildrenString = parseToNode("if", parseASTIfTree());
	}
	else if(match("left_brace"))
	{
		putMessage("--Building Statement Block Node");
		statementChildrenString = parseToNode("stmtBlock", parseASTBlockTree());
	}
	return statementChildrenString;
}

function parseASTPrintStatementTree()
{
	var printNode = tokenToNode();
	var leftParenNode = tokenToNode();
	var exprChildrenString = parseToNode("print", parseASTExprTree());
	var rightParenNode = tokenToNode();

	return exprChildrenString;
}

function parseASTAssignmentTree()
{
	var idChildrenString = astTokenToNode();
	_Index++; //to pass over the assignment operator.
	var assignmentNode = parseToNode("=", (idChildrenString + ", " + parseASTExprTree()));
	return assignmentNode; 
}

function parseASTVarDeclTree()
{
	var typeChildrenString = astTokenToNode();
	var idChildrenString = astTokenToNode();
	var varDeclChildren = typeChildrenString + ", " + idChildrenString;
	return varDeclChildren; 
}

function parseASTWhileTree()
{
	var whileNode = tokenToNode();
	_CurrentToken = _TokenList[_Index];
	var boolASTExprString = parseASTBooleanExprTree();
	var blockString = parseToNode("stmtBlock", parseASTBlockTree());
	var astWhileString = boolASTExprString + ", " + blockString;
	return astWhileString;
}

function parseASTIfTree()
{
	var ifNode = tokenToNode();
	_CurrentToken = _TokenList[_Index];
	var boolASTExprString = parseASTBooleanExprTree();
	var blockString = parseToNode("stmtBlock", parseASTBlockTree());
	var astIfString = boolASTExprString + ", " + blockString;
	return astIfString;
}

function parseASTExprTree()
{
	_CurrentToken = _TokenList[_Index];
	//tokenToString(_CurrentToken);
	var exprChildrenString = "";
	if(match("digit"))
	{
		exprChildrenString = parseASTIntExprTree();
	}
	else if(match("left_paren") || match("false") || match("true"))
	{
		exprChildrenString = parseASTBooleanExprTree();
	}
	else if(match("var_id"))
	{
		exprChildrenString = parseASTIdTree();
	}
	else if(match("string"))
	{
		exprChildrenString = parseASTStringTree();
	}
	return exprChildrenString;
}

function parseASTIntExprTree()
{
	//putMessage("--Building Digit Node");
	var digitNode = parseASTDigitTree();
	//tokenToString(_CurrentToken);
	_CurrentToken = _TokenList[_Index];
	var intExprChildrenString = digitNode;
	if(match("plus_op")) //more than just a digit
	{
		_Index++;
		var plusOpNode = parseToNode("+", (digitNode + ", " + parseASTExprTree()));
		intExprChildrenString = plusOpNode;
		//alert(intExprChildrenString);
	}
	return intExprChildrenString;
}

function parseASTBooleanExprTree()
{
	var booleanExprChildrenString = "";
	if(match("left_paren"))
	{
		var leftParenNode = tokenToNode();
		var leftExprChildrenString = parseASTExprTree();
		//alert(leftExprChildrenString);
		//tokenToString(_CurrentToken);
		//_Index++;
		_CurrentToken = _TokenList[_Index++];
		//tokenToString(_CurrentToken);
		if(match("boolop_equal"))
		{
			var booleanExprChildrenString = parseToNode("==", (leftExprChildrenString + ", " + parseASTExprTree()));
		}
		else if(match("boolop_not_equal"))
		{
			var booleanExprChildrenString = parseToNode("!=", (leftExprChildrenString + ", " + parseASTExprTree()));
		}
		var rightParenNode = tokenToNode();
	}
	else if(match("true") || match("false")) //realistically could be else, just figured it made more sense to keep it.
	{
		booleanExprChildrenString = parseASTBoolValTree();
	}
	//alert(booleanExprChildrenString);
	return booleanExprChildrenString;
}

function parseASTDigitTree()
{
	return astTokenToNode();
}

function parseASTStringTree() //this is because spaces and JIT do not like each other.
{
	var string = astTokenToNode();
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

function parseASTIdTree()
{
	return astTokenToNode();
}

function parseASTBoolValTree()
{
	return astTokenToNode();
}

function astTokenToNode()
{
	_CurrentToken = _TokenList[_Index++];
	var id = _CurrentToken.lineNumber.toString() + "_" + _CurrentToken.position.toString() + "ast"; //node id's have to be unique, therefore, we use line number and position to define the id's, as every token should have a unique position and ast now, as each node in each tree has to be unique because every label is a div.
	var name = _CurrentToken.value.toString();
	var string = '{"id":"node'+ id + '","name":"' + spacer(name) + name + '","data":{},"children":[]}';
	return string;
}