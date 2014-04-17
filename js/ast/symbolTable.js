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
	for(var i = 0; i < _ASTjson.children.length; i++)
	{
		var currentName = _ASTjson.children[i].name; //gets the name of the current node.
		_ASTjson.children[i].name = nameCleaning(currentName); //cleans it up and restores it in the json.
		currentName = _ASTjson.children[i].name; //gets it back to use in comparisons.
		if(currentName === "print")
		{
			//alert(JSON.stringify(_ASTjson.children[i]));
			checkPrint(_ASTjson.children[i]);
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
	var potentialId = nameCleaning(currentNode.children[0].name);
	//alert(potentialId);
	//alert(currentNode.children[0].id);
	if(isId(potentialId)) //check if the the expr for this print statement is an id
	{
		//var scopeLocation = -1;
		if(!scopeContainsId(potentialId))
		{
			var nodeLocation = currentNode.children[0].id.slice(_NodeLength, currentNode.children[0].id.length - _ASToffset); //breaks down the id to pull out the line number location.
			//alert(nodeLocation);
			nodeLocation = nodeLocation.split("_");
			putMessage("~~~SYMBOL TABLE ERROR symbol used without being declared ended on line " + nodeLocation[0] + ", character " + nodeLocation[1]);
			_ErrorCount++;
		}
		else
		{
			var tableIndex = -1;
			for(var i = 0; i < _SymbolTable.length; i++)
			{	
				if(id === _SymbolTable[i].id && _CurrentScope >= _SymbolTable[i].scope)
				{
					tableIndex = i;
				}
			}
			_SymbolTable[tableIndex].used = true;
			putMessage("Var Id " + _SymbolTable[tableIndex].id+ "is (or was) in use, line " + _SymbolTable[tableIndex] + ", character " + );
		}
	}
	else
	{
		//alert("MEOW");
	}
}

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

function createScopeElement(node)
{
	var currentScopeElement = new ScopeElement();
	var nodeLocation = node.id.slice(_NodeLength, node.id.length - _ASToffset); //breaks down the id to pull out the line number location.
	nodeLocation = nodeLocation.split("_");
	currentScopeElement.id = node.name;
	currentScopeElement.lineNumber = nodeLocation[0];
	currentScopeElement.linePosition = nodeLocation[1];
	currentScopeElement.scope = _CurrentScope;
	putMessage("---Symbol Created with ID of " + currentScopeElement.id);
	_SymbolTable.push(currentScopeElement);
}

