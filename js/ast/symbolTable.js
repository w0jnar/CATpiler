//
//symbolTable.js
//

//how this should be organized IMHO:

//symbols are ids, line/character initialized, data type, value, are they initialized(gotten when getting the data type), are they used(gotten when getting the value)


function generateSymbolTable()
{
	_WarningCount = 0;
	putMessage("Now Building Symbol Table");
	_ASTjson.name = nameCleaning(_ASTjson.name) ; //should be the opening brace/stmtBlock.
	putMessage("Opening Scope 0");
	_SymbolTable[_CurrentScope] = [];
	for(var i = 0; i < _ASTjson.children.length; i++)
	{
		var currentName = _ASTjson.children[i].name; //gets the name of the current node.
		_ASTjson.children[i].name = nameCleaning(currentName); //cleans it up and restores it in the json.
		currentName = _ASTjson.children[i].name; //gets it back to use in comparisons.
		//alert(currentName);
		if(currentName === "print")
		{
			//alert(JSON.stringify(_ASTjson.children[i]));
			checkPrint(_ASTjson.children[i]);
		}
		else if(currentName === "varDecl")
		{
			//alert(JSON.stringify(_ASTjson.children[i]));
			checkVarDecl(_ASTjson.children[i]);
		}
		
		if(_ErrorCount > 0)
		{
			break;
		}
		
		
	}
	if(_ErrorCount > 0)
	{
			putMessage("Symbol Table could not be generated due to error");
	}
	else
	{
		putMessage("Symbol Table complete!");
	}
	//alert(JSON.stringify(_ASTjson));
}

function checkPrint(currentNode)
{
	var currentExpr = currentNode.children[0]; //gets the first child of the print statement, in this case the expression.
	//alert(nameCleaning(currentExpr.name));
	//alert(JSON.stringify(currentExpr));
	//alert("Line: " + nodeLocation(currentExpr)[0] + ", character: " + nodeLocation(currentExpr)[1]);
	checkExpr(currentExpr);
}

function checkExpr(currentNode)
{
	var currentName = nameCleaning(currentNode.name); //pulls the name of the current node, which would be the type of expression.
	//alert(currentName);
	if(currentName.match(/\d/))  //expression is just an int.
	{
		//alert("int!");
		//build an array to return
		var returnList = [];
		returnList.push("int");
		returnList.push(parseInt(currentName));
		//return currentName; //this looks better in terms of assignment and boolean expressions. 
		return returnList;
	}
	else if(currentName.match(/^\"/))  //expression is a string. We are only matching the first character, but at this point, if it starts with a quote, it is a valid string.
	{
		//alert("string!");
		var returnList = [];
		returnList.push("string");
		returnList.push(currentName);
		//return currentName; //this looks better in terms of assignment and boolean expressions. 
		return returnList;
	}
	else if(currentName.match(/\+/))
	{
		//alert("Meow!");
		return checkIntExpr(currentNode); //pass the entire node as it contains both of the children to do the Int Expression comparison elsewhere.
	}
	else
	{
		alert("critical error"); //has not happened yet.
	}
}

function checkIntExpr(currentNode)
{
	var leftExpr = currentNode.children[0]; //left had to be an int for this to be an int expression, therefore, only have to check right.
	var rightExpr = currentNode.children[1]; 
	var leftName = nameCleaning(leftExpr.name);
	var rightName = nameCleaning(rightExpr.name);
	//alert(leftName);
	//alert(rightName);
	var rightList = checkExpr(rightExpr); //get the type of the right expression and the value, if applicable.
	var rightType = rightList[_TypeConstant];
	if(rightType === "int") //we have digits on both sides of the int expression.
	{
		var sum = parseInt(leftName) + rightList[_ValueConstant];
		//alert(sum);
		var returnList = [];
		returnList.push("int");
		returnList.push(sum);
		return returnList;
	}
	else if(rightType === "bad type") //to remove printing the same error multiple times in one statement.
	{
		return _ErrorList;
	}
	else
	{
		var nodeLocationList = nodeLocation(rightExpr);
		putMessage("~~~SYMBOL TABLE ERROR Invalid Int Expression on line " + nodeLocationList[0] + ", character " + nodeLocationList[1]);
		_ErrorCount++;
		return _ErrorList;
	}
}

function checkVarDecl(currentNode)
{
	var idNode = currentNode.children[1]; //get the child node, aka the identifier.
	var idName = nameCleaning(idNode.name);
	var checkIfIdExists = currentScopeIdCheck(idName);
	if(checkIfIdExists)
	{
		var nodeLocationList = nodeLocation(idNode);
		putMessage("~~~SYMBOL TABLE ERROR Invalid Var Decl, id on line " + nodeLocationList[0] + ", character " + nodeLocationList[1] + " is already declared in this scope");
		_ErrorCount++;
	}
	else
	{
		var typeNode = currentNode.children[0];
		var type = nameCleaning(typeNode.name); //get the type
		createScopeElement(idNode, type);
	}
}

function currentScopeIdCheck(id)
{
	var currentScopeIdList = _SymbolTable[_CurrentScope];
	var checkReturn = false;
	for(var i = 0; i < currentScopeIdList.length; i++)
	{
		if(id === currentScopeIdList[i].id)
		{
			checkReturn = true;
		}
	}
	return checkReturn;
}

function nameCleaning(name) //clean up the mess made by making the formatting nice for the AST.
{
	var newString = name;
	while(newString.substr(0, _Spacer.length) === _Spacer)
	{
		newString = newString.substr(_Spacer.length, newString.length);
	}
	var newString = newString.replace(/&nbsp;/g, " ");
	return newString;
}

function ScopeElement()
{
	this.id;
	this.lineNumber = 0;
	this.position = 0;
	this.scope;
	this.dataType;
	this.value;
	this.initialized = false;
	this.used = false;
}

function createScopeElement(node, type)
{
	var currentScopeElement = new ScopeElement();
	var nodeLocationList = nodeLocation(node);
	currentScopeElement.id = nameCleaning(node.name);
	currentScopeElement.lineNumber = nodeLocationList[0];
	currentScopeElement.linePosition = nodeLocationList[1];
	currentScopeElement.type = type;
	currentScopeElement.scope = _CurrentScope;
	putMessage("---Symbol Created with ID of " + currentScopeElement.id + ", type " + currentScopeElement.type);
	_SymbolTable[_CurrentScope].push(currentScopeElement);
}

function nodeLocation(node)
{
	var nodeLocation = node.id.slice(_NodeLength, node.id.length - _ASToffset); //breaks down the id to pull out the line number location.
	nodeLocation = nodeLocation.split("_");
	return nodeLocation;
}


//not currently in use

function isId(potentialId)
{
	return (potentialId.match(/[a-z]/) && potentialId.length === 1);
}

function scopeContainsId(id)
{
	if(_SymbolTable.length === 0)
	{
		return false;
	}
	var tableIndex = -1;
	for(var i = 0; i < _SymbolTable.length; i++)
	{	
		if(id === _SymbolTable[i].id && _CurrentScope >= _SymbolTable[i].scope)
		{
			tableIndex = i;
		}
	}
	if(tableIndex !== -1) //the id is already in the table
	{
		return true;
	}
	else
	{
		return false;
	}
}