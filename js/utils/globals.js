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

var _CurrentScopeId = 0;

//Code Generation 
var _ProgramSize = 255;
var _GeneratedCode = [];
var _Heap = [];
var _HeapPointer = _ProgramSize;
var _StaticData = [];
var _JumpTable = [];
var _CurrentTemp = 0;
var _CurrentJump = 0;
var _Offset = 0;

var _TempIndex = 0;
var _VarIndex = 1;
var _ScopeIndex = 2;
var _OffsetIndex = 3;
var _LastScopeIdStack = [];
var _TruePointer = "";
var _FalsePointer = "";
var _ActualTempCount = 0;
var _CurrentJump = 0;