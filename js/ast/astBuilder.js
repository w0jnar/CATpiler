//
//astBuilder.js
//

//admittedly, most of this will be cstBuilder, but there will be some modifications.

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

function parseASTExprTree()
{
	_CurrentToken = _TokenList[_Index];
	var exprChildrenString = "";
	if(match("digit"))
	{
		//alert("meow");
		exprChildrenString = parseASTIntExprTree();
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

function astTokenToNode()
{
	_CurrentToken = _TokenList[_Index++];
	var id = _CurrentToken.lineNumber.toString() + "_" + _CurrentToken.position.toString() + "ast"; //node id's have to be unique, therefore, we use line number and position to define the id's, as every token should have a unique position and ast now, as each node in each tree has to be unique because every label is a div.
	var name = _CurrentToken.value.toString();
	var string = '{"id":"node'+ id + '","name":"' + spacer(name) + name + '","data":{},"children":[]}';
	return string;
}