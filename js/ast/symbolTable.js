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
	_SymbolTable[_CurrentScope] = new Scope(-1);
	for(var i = 0; i < _ASTjson.children.length; i++)
	{
		var currentName = _ASTjson.children[i].name; //gets the name of the current node.
		_ASTjson.children[i].name = nameCleaning(currentName); //cleans it up and restores it in the json.
		currentName = _ASTjson.children[i].name; //gets it back to use in comparisons.
		//alert(currentName);
		//alert(JSON.stringify(_ASTjson.children[i]));
		if(currentName === "print")
		{
			checkPrint(_ASTjson.children[i]);
		}
		else if(currentName === "varDecl")
		{
			checkVarDecl(_ASTjson.children[i]);
		}
		else if(currentName === "stmtBlock")
		{
			checkNewScope(_ASTjson.children[i], 0);
		}
		else if(currentName === "assignment")
		{
			checkAssignment(_ASTjson.children[i]);
		}
		
		if(_ErrorCount > 0)
		{
			break;
		}
		
		
	}
	putMessage("Closing Scope 0");
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

function checkAssignment(currentNode)
{
	var valueToAssignNode = currentNode.children[0].children[1];
	var idNode = currentNode.children[0].children[0]; //get the child node, aka the identifier.
	var idName = nameCleaning(idNode.name);
	var checkIfIdExists = currentScopeChain(idName);
	var scope = checkIfIdExists[0];
	var locationInScope = checkIfIdExists[1];
	var nodeLocationList = nodeLocation(idNode);
	if(scope === -1 && locationInScope === -1) //error, as not declared.
	{
		putMessage("~~~SYMBOL TABLE ERROR Invalid Var Assignment, id on line " + nodeLocationList[0] + ", character " + nodeLocationList[1] + " is not declared in this scope, or any parent scopes");
		_ErrorCount++;
	}
	else //now we have to check if the types match.
	{
		var idCopy = _SymbolTable[scope].table[locationInScope]; //id to modify in the symbol table.
		var valueToAssignEval = checkExpr(valueToAssignNode);
		var valueToAssignType = valueToAssignEval[_TypeConstant];
		var valueToAssignValue = valueToAssignEval[_ValueConstant];
		if(valueToAssignType === idCopy.dataType) //it is of the right type
		{
			if(scope !== _CurrentScopeId) //it is initialized, just in a parent scope, therefore, create a new node in the current scope.
			{
				createScopeElement(idNode, idCopy.dataType); //create a new node at the current location, as a copy would not be in the right spot.
				var currentLocation = _SymbolTable[_CurrentScopeId].table.length - 1;
				_SymbolTable[_CurrentScopeId].table[currentLocation].value = valueToAssignValue;
				_SymbolTable[_CurrentScopeId].table[currentLocation].initialized = true;
			}
			else //it is in the current scope, already initialized.
			{
				_SymbolTable[scope].table[locationInScope].value = valueToAssignValue;
				_SymbolTable[scope].table[locationInScope].initialized = true;
			}
			putMessage("---id " + idName + " on line " + nodeLocationList[0] + ", character " + nodeLocationList[1] + ", has been assigned the value " + valueToAssignValue);
		
		}
		else
		{
			var nodeLocationList = nodeLocation(idNode);
			putMessage("~~~SYMBOL TABLE ERROR Invalid Var Assignment, id on line " + nodeLocationList[0] + ", character " + nodeLocationList[1] + ", types differ");
			_ErrorCount++;
		}
	}
}


function checkNewScope(currentNode, parent)
{
	putMessage("Opening New Scope, Scope level " + ++_CurrentScope);
	var newScopeLocation = _SymbolTable.length;
	_CurrentScopeId = newScopeLocation;
	_SymbolTable[newScopeLocation] = new Scope(parent);
	_CurrentScopeId = newScopeLocation;
	for(var i = 0; i < currentNode.children.length; i++) //admittedly, could probably combined this with the code from generateSymbolTable(), but it started getting messy. Future goal possibly.
	{
		var currentName = nameCleaning(currentNode.children[i].name); //gets the name of the current node.
		//alert(currentName);
		if(currentName === "print")
		{
			checkPrint(currentNode.children[i]);
		}
		else if(currentName === "varDecl")
		{
			checkVarDecl(currentNode.children[i]);
		}
		else if(currentName === "stmtBlock")
		{
			checkNewScope(currentNode.children[i], _CurrentScopeId);
		}
		else if(currentName === "assignment")
		{
			checkAssignment(currentNode.children[i]);
		}
		
		if(_ErrorCount > 0)
		{
			break;
		}
	}
	//checkIfScopeIsClean();
	if(_ErrorCount === 0)
	{
		putMessage("Closing Scope, Scope level "+ _CurrentScope--);
		//printScope();
		
		_CurrentScopeId = parent;
	}
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
		alert("critical error"); //has not happened yet...
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

function currentScopeIdCheck(id)
{
	var currentScopeIdList = _SymbolTable[_CurrentScopeId].table;
	var checkReturn = false;
	for(var i = 0; i < currentScopeIdList.length; i++)
	{
		//alert(currentScopeIdList[i].id);
		if(id === currentScopeIdList[i].id)
		{
			checkReturn = true;
		}
	}
	return checkReturn;
}

function currentScopeChain(idName)
{
	var scopeId = _CurrentScopeId;
	var location;
	while(scopeId !== -1) //the parent value of the first scope, aka, there is nothing higher.
	{
		for(var i = 0; i < _SymbolTable[scopeId].table.length; i++)
		{
			if(idName === _SymbolTable[scopeId].table[i].id)
			{
				location = [scopeId, i];
			}
		}
		
		if(location === undefined) //it was not found in the current scope, therefore we must go to the parent.
		{
			scopeId = _SymbolTable[scopeId].parent;
		}
		else
		{
			scopeId = -1;
		}
	}
	
	if(location === undefined) //if it is still undefined after going through the scopes, it does not exist, therefore we have an error.
	{
		location = [-1, -1];
	}
	return location;
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
	this.redeclared = false;
	this.undeclared = false;
}

function createScopeElement(node, type)
{
	var currentScopeElement = new ScopeElement();
	var nodeLocationList = nodeLocation(node);
	currentScopeElement.id = nameCleaning(node.name);
	currentScopeElement.lineNumber = nodeLocationList[0];
	currentScopeElement.linePosition = nodeLocationList[1];
	currentScopeElement.dataType = type;
	currentScopeElement.scope = _CurrentScopeId;
	putMessage("---Symbol Created with ID of " + currentScopeElement.id + ", type " + currentScopeElement.dataType);
	_SymbolTable[_CurrentScopeId].table.push(currentScopeElement);
}

function nodeLocation(node)
{
	var nodeLocation = node.id.slice(_NodeLength, node.id.length - _ASToffset); //breaks down the id to pull out the line number location.
	nodeLocation = nodeLocation.split("_");
	return nodeLocation;
}

function Scope(parent)
{
	this.parent = parent;
	this.table = [];
}

function checkIfScopeIsClean()
{
	var currentScopeList = _SymbolTable[_CurrentScopeId].table;
	for(var i = 0; i < currentScopeList.length; i++)
	{
		var nodeLocationList = nodeLocation(idNode);
		if(currentScopeList[i].undeclared) //might become part of assignment
		{
			putMessage("~~~SYMBOL TABLE ERROR id on line " + nodeLocationList[0] + ", character " + nodeLocationList[1] + " is was not declared");
			_ErrorCount++;
		}
	}
	return checkReturn;
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