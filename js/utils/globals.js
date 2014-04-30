//
//globals.js
//

//Lex
var _LineNumber = 1;
var _EOF = "$";
var _EOFCount = 0;
var _ErrorCount = 0;
var _WarningCount = 0;
var _TokenList = [];
var inputProgram = "";
var _CurrentSymbol = "";
var _SymbolLineLocation = 0;
var _TokenTotal = 1;
var _NotMidParse = true;
var wsMatch = new RegExp("\\s");
var letterMatch = new RegExp("^[a-z]+$");
var stringMatchRegEx = new RegExp("^[a-z ]+$");
var _CharacterGet = true;

//Parse
var _CheckSuccess = false;
var _CurrentToken;
var _Index = 0;

//CST
var _CSTjson ={};
var _NonTokenNodeCount = 0;
var _Spacer = "&nbsp;";
var _NameLengthMax = 19;
var _SpacerSize = 24;

//AST
var _ASTjson ={};

//SymbolTable
var _SymbolTable = [];
var _CurrentScope = 0;
var _NodeLength = 4;
var _ASToffset = 3;

var _TypeConstant = 0;
var _ValueConstant = 1;

var _ErrorList = ["bad type", "undefined"];