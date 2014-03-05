//
//buttons.js
//

function buttons()
{
	//mainly put this here because I like the fancy button.
	var catpileListener = document.getElementById("btnCATpile");
	catpileListener.addEventListener("click",
		function(){
			compile();
			if(_ErrorCount === 0)
			{
				//whatever else goes here (probably should be moved else where eventually
				//this is for token testing.
				//for(var i = 0; i < _TokenList.length; i++)
				//{
				//	tokenToString(_TokenList[i]);
				//}
			}
		},
		false
	);
	
	var clearListener = document.getElementById("btnClear");
	clearListener.addEventListener("click",
		function(){
			var taUserProgamFill = document.getElementById("taUserInput");
			taUserProgamFill.value = "";
		},
		false
	);
	
	var program1Listener = document.getElementById("btnProgram1");
	program1Listener.addEventListener("click",
		function(){
			var taUserProgamFill = document.getElementById("taUserInput");
			taUserProgamFill.value = "{\n   int a\n   a = 1\n   {\n      int a\n      a = 2\n      print ( a )\n   }\n\n   string b\n   b = \"alan\"\n\n   if ( a == 1 ) {\n      print ( b )\n   }\n\n   string c\n   c = \"cat\"\n   b = \"meowington\"\n   print ( b )\n} $";
		},
		false
	);
	
	var program2Listener = document.getElementById("btnProgram2");
	program2Listener.addEventListener("click",
		function(){
			var taUserProgamFill = document.getElementById("taUserInput");
			taUserProgamFill.value = "{\n   int a = 1\n   inta\n\n   while (  false  ) {\n      print ( \"MEOW\"  )\n   }\n   string b\n   string c\n   c2 = \"cat\n   print( a )\n   b = \"meowington\"\n   print ( b )\n}";
		},
		false
	);
}