//
//astBuilder.js
//

//admittedly, most of this will be cstBuilder, but there will be some modifications.

function buildAST()
{
	putMessage("Now Building Concrete Syntax Tree from Tokens");
	_Index = 0;
	//tokenToNode();
	//_CSTjson = JSON.parse(tokenToNode());
	// _CSTjson = tokenToNode();
	// _CurrentToken = _TokenList[_Index++];
	// _CSTjson = addChild(_CSTjson);
	// _CSTjson = JSON.parse(_CSTjson);
	putMessage("--Building Program Node");
	var programJSONstring = parseToNode("Block", parseASTBlockTree());
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
	return statementChildrenString;
}

function parseASTPrintStatementTree()
{
	var printNode = tokenToNode();
	var leftParenNode = tokenToNode();
	var exprChildrenString = parseToNode("print", parseASTExprTree());
	var rightParenNode = tokenToNode();
	//var printStatementChildrenString = printNode + ", " + leftParenNode + ", " + exprChildrenString + ", " + rightParenNode;
	return exprChildrenString;
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

function astTokenToNode()
{
	_CurrentToken = _TokenList[_Index++];
	var id = _CurrentToken.lineNumber.toString() + "_" + _CurrentToken.position.toString() + "ast"; //node id's have to be unique, therefore, we use line number and position to define the id's, as every token should have a unique position.
	var name = _CurrentToken.value.toString();
	var string = '{"id":"node'+ id + '","name":"' + spacer(name) + name + '","data":{},"children":[]}';
	return string;
}