//
//globals.js
//

var _LineNumber = 1;
var _EOF = "$";
var _EOFCount = 0;
//var _CurrentToken = "";
var _ErrorCount = 0;
var _WarningCount = 0;
var _TokenList = [];
var inputProgram = "";
var _CurrentSymbol = "";
var _SymbolLineLocation = 0;
var _TokenTotal = 1;
var _NotMidParse = true;
var wsMatch = new RegExp("\\s");