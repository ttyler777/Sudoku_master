var canvas; //main canvas being draw to
var ctx;	// context, used to draw on canvas
var canvas_size; // passed from html code for size of drawing canvas
var fk_canvas; // fk canvas used for click detection in objects, never displayed
var fk_ctx;
var perm_canvas; // permanent canvas and only drawn once, ie game board
var perm_ctx;
var menu_canvas; // used to draw the menu
var menu_ctx;
var refresh = 20;// redraw interval
var canvasValid = false; // handler for if the canvas needs to be redrawn
var dispMenuHandler = false; // handler to display menu object
var intervalHandler; // handler for interval and auto run of draw function
var Cells = []; // 2d array of position and number in each cell
var mySel = 0; // copy of cell element to draw
var selColor =  "#FFFF00"; //color cell turns when it is clicked on
var selWidth = 5; // width of boarder around cell when clicked
var mx, my; //mouse coords 
var offsetx, offsety; // used to set correct coords for canvas taking into account where the canvas is drawn on the screen
var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop; // more offset variables 
var menu = new Menu(); // menu object that holds data about position
var sample_puzzle = [' ',' ',' ',1,' ',5,' ',' ',' ',1,4,' ',' ',' ',' ',6,7,' ',' ',8
					,' ',' ',' ',2,4,' ',' ',' ',6,3,' ',7,' ',' ',1,' ',9,' ',' ',' '
					,' ',' ',' ',' ',3,' ',1,' ',' ',9,' ',5,2,' ',' ',' ',7,2,' ',' ',' '
					,8,' ',' ',2,6,' ',' ',' ',' ',3,5,' ',' ',' ',4,' ',9,' ',' ',' '] // givens to start the game
					 
var solution_puzzle = [6,7,2,1,4,5,3,9,8,1,4,5,9,8,3,6,7,2,3,8,9,7,6,2,4,5,1,2,6,3,5,7,4,8
						,1,9,9,5,8,6,2,1,7,4,3,7,1,4,3,9,8,5,2,6,5,9,7,2,3,6,1,8,4,4,2,6,8,1
						,7,9,3,5,8,3,1,4,5,9,2,6,7];					 //An array of entries for the sample puzzle
function checkdata(){ // checks to make sure the given and solution are of equal length
	given = "given:"+sample_puzzle.length;
	sol = "sol:"+solution_puzzle.length;
	console.log(given);
	console.log(sol);
	var solved = "S:";
	var givens = "G:";
	for(var i = 0; i < solution_puzzle.length; i++){
		solved += solution_puzzle[i];
		givens += sample_puzzle[i];				
	}
	console.log(givens);
	console.log(solved);
}
function solver(){ // solves the puzzle
	var count = 0;
	var change = ' ';
	try{
	for(var i = 0; i < Cells.length; i++){
		for(var j = 0; j < Cells[i].length; j++){
		
			change = "change:"+Cells[j][i].num;
			Cells[j][i].num = solution_puzzle[count]; // sets cell value to the solution
			change += ":"+Cells[j][i].num; 
			count++;
		}
	}
	invalidate();
	}catch(err){console.log(err);}

}
function checker(){ // checks puzzle for correctness
	var count = 0;
	try{
	for(var i = 0; i < Cells.length; i++){
		for(var j = 0; j < Cells[i].length; j++){
			if(!(Cells[j][i].num == solution_puzzle[count])){//if puzzle does not match solution
				alert("Sorry, that solution is not correct\nProblem in Highlighted cell");
				mySel = Cells[j][i]; // tells it to highlight that cell
				dispMenuHandler = false; // do not display menu
				invalidate();
				return;
			}
			count++;
		}
	}
	}catch(err){console.log(err);}
	alert("solution is correct!"); // no errors, soultion is correct
}
function init(cSize){
	checkdata();
	canvas_size = cSize;
	canvas = document.getElementById("myCanvas"); // grabs canvas from html 
	ctx = canvas.getContext("2d"); // ties the canvas to a context used to draw to the canvas
	fk_canvas = document.getElementById("colorCanvas"); //same as above but for differing canvases ditto below
	fk_ctx = fk_canvas.getContext("2d"); // '' 
	perm_canvas = document.getElementById("permCanvas");// '' 
	perm_ctx = perm_canvas.getContext("2d");
	menu_canvas = document.getElementById("menuCanvas");
	menu_ctx = menu_canvas.getContext("2d");
	drawGrids(); // draws the game board once to the perm_canvas
	try{
	createCells(); // fills cells with starting data of position, fill number, size
	}catch(err){console.log(err);}
	intervalHandler = setInterval(draw, refresh); // sets an interval to run draw automatically
	
	if (document.defaultView && document.defaultView.getComputedStyle) { // gets info about html code and how much to offset
		stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
		stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
		styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
		styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
	}
	canvas.onmousedown = mDown; // detects mouse down on top most canvas
	//canvas.onmouseup = mUp;
	//canvas.ondblclick = mDblClick;
} 
function draw(){ // all calls to draw on main canvas
	if(canvasValid === false){ // asks if canvas needs to be redrawn
		ctx.clearRect(0,0,canvas_size, canvas_size); // clears the canvas from previous draw
		try{
		drawStuffInCells(); // draws the numbers in each cell
		}catch(err){console.log(err);}
		if(dispMenuHandler){ // asks if need to display menu
			drawMenu();
		}
		if (mySel !== 0) { // if there is a selection, highlight cell 
			//needs to be turned into its own function.........................
			ctx.strokeStyle = selColor; 
			ctx.lineWidth = selWidth;
			ctx.strokeRect(mySel.x,mySel.y,mySel.size,mySel.size); // draws boarder around selected cell
		}
		canvasValid = true; // canvas is now up to date
	}
}
function invalidate(){ // canvas is no longer uptodate, needs to be redrawn
	canvasValid = false;
}
function drawGrids(){ // draws the background grids for the board
	perm_ctx.strokeStyle = 'black'; // color of grids
	for(var i = 1; i < 9; i++){
		perm_ctx.beginPath(); //new set of lines to be drawn
		if(i%3 === 0){ //big lines
			perm_ctx.lineWidth = 5;
			perm_ctx.moveTo((canvas_size/9)*i,0); //starting point of horizontal line
			perm_ctx.lineTo((canvas_size/9)*i,canvas_size);//ending point of horizontal line
			perm_ctx.moveTo(0,(canvas_size/9)*i);	//starting point of vertical line
			perm_ctx.lineTo(canvas_size,(canvas_size/9)*i); // ending point of vertical line
		}else{//narrow lines
			perm_ctx.lineWidth = 1;
			perm_ctx.moveTo((canvas_size/9)*i,0); 
			perm_ctx.lineTo((canvas_size/9)*i,canvas_size);
			perm_ctx.moveTo(0,(canvas_size/9)*i);
			perm_ctx.lineTo(canvas_size,(canvas_size/9)*i);
		}
		perm_ctx.stroke(); // draw line on per canvas
	}
}
function Cell(){ // create type Cell
	this.x = 0; // where to draw on canvas 
	this.y = 0;
	this.size = canvas_size/9;
	this.fill = '#444444'; // dont really have a use for this..
	this.num = ' '; // what goes into the cell
	this.numbers = []; // array of bool to show in menu, not used yet
}
function Menu(i,j,x,y){ // menu type
	this.i; // cell row
	this.j; // column
	this.x; // position x
	this.y; // y
}
function drawMenu(){ // draws menu on menu canvas
	ctx.fillStyle = 'red'; // what color the menu is
	ctx.fillRect(Cells[menu.i][menu.j].x,Cells[menu.i][menu.j].y,(canvas_size/9),(canvas_size/9)); //draw menu using cell and menu info
	ctx.stroke();
	ctx.font="14px Georgia";
	ctx.fillStyle = 'white';
	for(var i = 1; i < 4; i++){ // displays numbers in menu to add to selected cell
		// need to change literals to vars......-10
		ctx.fillText(i,Cells[menu.i][menu.j].x+(canvas_size/9)*.3*i-10,(Cells[menu.i][menu.j].y)+(canvas_size/9)*.3);
		ctx.fillText(3+i,Cells[menu.i][menu.j].x+(canvas_size/9)*.3*i-10,(Cells[menu.i][menu.j].y)+(canvas_size/9)*.6);
		ctx.fillText(6+i,Cells[menu.i][menu.j].x+(canvas_size/9)*.3*i-10,(Cells[menu.i][menu.j].y)+(canvas_size/9)*.9);
	}
	invalidate();
	
}
function drawCell(contex,i,j,color,size){ // used to draw on fake canvas for click detection on cells 
	try{
	contex.lineWidth = 2;
	contex.fillStyle = color;
	contex.fillRect(Cells[i][j].x,Cells[i][j].y,size,size); // draws cell on passed canvas
	invalidate();
	}catch(err){console.log(err);}
}
function drawMenuCell(contex,x,y,color,size){ // used to draw on fake canvas for click detection on menu
	try{
	contex.lineWidth = 2;
	contex.fillStyle = color;
	contex.fillRect(x,y,size,size); // draws cell on passed canvas
	invalidate();
	}catch(err){console.log(err);}
}
function addCell(index,x,y,fill,num){ // adds cell to Cell array
	try{
	var cell = new Cell();
	// sets basic info for cell type
	cell.x = x;
	cell.y = y;
	cell.size = canvas_size/9;
	cell.fill = fill;
	cell.num = num;
	for(var i = 0; i < 9; i++){
		cell.numbers.push(true); //	fills menu boolean for menu numbers to display
	}
	Cells[index].push(cell); // pushes cells to 2d array
	}catch(err){console.log(err);}
}
function createCells(){ // creates cell 2d array
	var color = "#000080"; 
	var num = ' '; // what is in the cell at the start
	try{
		for(var i = 0; i < 9; i++){
			Cells.push([]); // creates next cell array row
			for(var j = 0; j < 9; j++){
				num = sample_puzzle[(j*9)+i];
                addCell(i,(i*(canvas_size/9)),(j*(canvas_size/9)),color, num); // passes cell info to be created and pushed to array
			}
		}
	}catch(err){console.log(err);}
}
function clear(context){ // removes all objects on passed canvas
	context.clearRect(0,0,canvas_size, canvas_size);
}
function mDown(e){ // what happens when mouse left button is depressed
	getMouse(e); // gets corrected mouse coords with offsets
	clear(ctx); // clears main canvas
	if(!menuClick()){ // checks to see if menu is clicked
		cellClick();// checks to see if cell is clicked
	}
	clear(ctx); // clears canvas again.....might not need this
	invalidate();
}
function menuClick(){ // checks for menu click
	if(mySel == 0){ //if there is no sel, dont run check
		return false; //false so cell click can check instead
	}
	var counter = 0;
	for (var j = 0; j < 3; j++) {
		for (var i = 0; i < 3; i++) {
			counter++;
			var imageData;
			drawMenuCell(menu_ctx,Cells[menu.i][menu.j].x+((canvas_size/27)*i),Cells[menu.i][menu.j].y+((canvas_size/27)*j),'blue',canvas_size/27);// draws color squares on menu one at a time
			imageData = menu_ctx.getImageData(mx, my, 1, 1); // gets RBG data for mouse coords on canvas
			clear(menu_ctx);
			if (imageData.data[3] > 0) {//3 is alpha value of colour at mouse coordinates
				Cells[menu.i][menu.j].num = counter; // sets new num in cell to number clicked
				var str = "clicked:"+counter // debug stuff
				console.log(str); // tell console what number was clicked, dugbug stuff
				invalidate();
				dispMenuHandler = false; // no longer disp menu
				return true;
			}
		}																			
	}
	
}
function cellClick(){ // checks if a cell was clicked
	mySel = 0;
	for (var i = 0; i < Cells.length; i++) { // cycle through cell 2d array 
		for (var j = 0; j < Cells[i].length; j++) {
			var imageData; // RBG data for canvas
			drawCell(fk_ctx,i,j,'blue',(canvas_size/9)); // draws cell on non-displayed canvas
			imageData = fk_ctx.getImageData(mx, my, 1, 1); // gets RBG data for mouse cords
			clear(fk_ctx);
			if (imageData.data[3] > 0) {//3 is alpha value of colour at mouse coordinates
			// if there is color then cell was clicked
				try{
				popUpMenu(mx,my,i,j); // sends info to menu for it to be displayed
				}catch(err){console.log(err);};
				mySel = Cells[i][j]; // sets the clicked cell to mySel to be used for displaing info // might use this instead of menu object
				offsetx = mx - mySel.x; // mouse cords correction
				offsety = my - mySel.y;
				mySel.x = mx - offsetx; 
				mySel.y = my - offsety;
				invalidate();
				return;
			}
		}																			
	}

}
function popUpMenu(x,y,i,j){ // sets new menu info 
	dispMenuHandler = true; // tells draw to disp menu
	menu.x = x; // mouse
	menu.y = y;
	menu.i = i;  // cell
	menu.j = j;
}
function getMouse(e) { // mouse offsets
      var element = canvas, offsetX = 0, offsetY = 0; //gets uncorrected mouse cords
      if (element.offsetParent) { //if html has offset 
        do {
          offsetX += element.offsetLeft; // add to offset counters
          offsetY += element.offsetTop;
        } while ((element = element.offsetParent));
      }
      offsetX += stylePaddingLeft; // add padding info to offset
      offsetY += stylePaddingTop;

      offsetX += styleBorderLeft; // add boarder to offset
      offsetY += styleBorderTop;

      mx = e.pageX - offsetX; // create the corrected mouse cords
      my = e.pageY - offsetY;
}
function fillCell(i,j,stuff){// fills cell with passed info
	// i,j cell, stuff is what to put into it
	try{
	//add assert that num is a string number 1 - 9
	Cells[i][j].num = String(stuff);
	}catch(err){console.log(err);}
}
function drawfilledCell(i,j){ // display number in cell
	ctx.font="50px Georgia";
	try{
	ctx.fillText(Cells[i][j].num,Cells[i][j].x+15,(Cells[i][j].y-15)+canvas_size/9);
	}catch(err){console.log(err);}
}
function drawStuffInCells(){ // dispaly all numbers in cells
	ctx.fillStyle = 'black';
	for(var i = 0; i < Cells.length; i++){
		for(var j = 0; j < Cells[i].length; j++){
			try{
			drawfilledCell(i,j); // display number in passed cell 
			}catch(err){console.log(err);}
		}
	}
	ctx.stroke();
	invalidate();
}