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
	putMessage("-Program Node");
	var programJSONstring = parseToNode("Program", parseProgramTree())
	_CSTjson = JSON.parse(programJSONstring);
}

function parseProgramTree()
{
	putMessage("-Block Node");
	var blockJSONString = parseToNode("Block", parseBlockTree()); //parses the total block of the tree.
	putMessage("-End of File Node");
	var eofNode = tokenToNode(); //at this point, should be finished with the entire program other than the end of file token.
	var programsChildrenString = blockJSONString + ", " + eofNode;
	return programsChildrenString;
}

function parseBlockTree()
{
	putMessage("-Left Bracket Node");
	var leftBracketNode = tokenToNode();
	putMessage("-Statement List Node");
	var statementListJSONString = parseToNode("StatementList", parseStatementListTree()); //parses the total block of the tree.
	putMessage("-Right Bracket Node");
	var rightBracketNode = tokenToNode();
	var blocksChildrenString = leftBracketNode + ", " + statementListJSONString + ", " + rightBracketNode;
	return blocksChildrenString;
}

function parseStatementListTree()
{
	putMessage("-StatementList Node");
	_CurrentToken = _TokenList[_Index];
	var StatementListChildrenString = "";
	if(!match("right_brace"))
	{
		var StatementNode = parseToNode("Statement", parseStatementTree());
		var StatementListNode = parseToNode("StatementList", parseStatementListTree());
		StatementListChildrenString = StatementNode + ", " + StatementListNode;
	}
	else
	{
		StatementListChildrenString = parseToNode(String.fromCharCode(949), ""); //epsilon
	}
	return StatementListChildrenString;
}

function tokenToNode()
{
	_CurrentToken = _TokenList[_Index++];
	var id = _CurrentToken.lineNumber.toString() + "_" + _CurrentToken.position.toString(); //node id's have to be unique, therefore, we use line number and position to define the id's, as every token should have a unique position.
	var name = _CurrentToken.value.toString();
	var string = '{"id":"node'+ id + '","name":"' + name + '","data":{},"children":[]}';
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
	var string = '{"id":"node'+ id + '","name":"' + name + '","data":{},"children":[' + children + ']}';
	//var string = '{"id":"node","name":"name","data":{},"children":[{"id": "node46","name":"4.6","data": {},"children":[]}, {"id": "node23","name":"2.6","data": {},"children":[]}]}';
	//alert(string);
	//return JSON.parse(string);
	return string;
}

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