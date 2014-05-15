//
//codeGen.js
//

function generateCode()
{
	putMessage("Now Starting Code Generation from AST");
	jsonCleaning(_ASTjson);
	alert(JSON.stringify(_ASTjson));
}

function jsonCleaning(json)
{
	json.name = nameCleaning(json.name);
	for(var i = 0; i < json.children.length; i++)
	{
		jsonCleaning(json.children[i]);
	}
}