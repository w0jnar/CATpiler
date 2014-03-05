//
//buttons.js
//

function buttons()
{
//mainly put this here because I like the fancy button.
var buttonListener = document.getElementById("btnCATpile");
	buttonListener.addEventListener("click",
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
}