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
var json ={};