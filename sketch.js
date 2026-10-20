

let grid = [];
let cols, rows ;
let loc = 50;
let scl = 0.10;
let spacing = 20; 
let message;
let messages = [];
let whom = [];
let box;
function setup() {
  cols = windowWidth/30;
  rows = windowHeight/30; 
  createCanvas(windowWidth, windowHeight);
  let rowSize = height/rows;
  let colSize = width/cols; 
  populate();
  for (let i=0; i<cols+10; i++){
    grid[i] = []
    for (let j=0; j<rows+10; j++){
      grid[i][j] = new Cell(colSize/2+i*colSize - 40, rowSize/2+j*rowSize - 40, rowSize/2, i*loc+j*loc);
    }
  }
  box = new Info();
}

function preload(){
  message = loadTable('messages/form.csv', 'csv', 'header');
}
function populate(){
  messages = message.getColumn('Note');
  whom = message.getColumn("To");
  for(let i = 0; i < messages.length; i++){
    messages[i] = addbreaks(messages[i], 100);
  }
}
function draw() {
  background(0);
  textFont('Courier New');
  push();
  stroke("white");
  textSize(30);
  fill("white");
  textAlign(CENTER);
  text("everthing i wish i said", windowWidth/2, 50);
  pop();
  for (let i=0; i<cols+10; i++){
    for (let j=0; j<rows+10; j++){
      grid[i][j].update();
      grid[i][j].display();
    }
  }

  box.update();

}

function countOccurrences(inputString, phrase) {
  let count = 0;
  let position = inputString.indexOf(phrase);
  while (position !== -1) {
    count++;
    position = inputString.indexOf(phrase, position + 1);
  }

  return count;
}

function addbreaks(inputString, dist){
  count = 0;
  breaks = "";
  for (let i = 0; i < inputString.length; i++){
    charac = inputString[i];
    count += 1;
    if(charac == " "){
       if(count > dist){
          breaks += "\n";
          count = 0;
        }else{
          breaks += inputString[i];
        }
    }else{
       breaks += inputString[i];
    }
  }
  return breaks;
}

function maketextbox(x, y, note){
    noStroke();
    rectMode(CENTER);
    textAlign(CENTER, CENTER);
    textSize(25);
    let iters = countOccurrences(note, "\n");
    push();
    push();
    fill(0,0,0,173);
    rect(x + 5, y + 5, textWidth(note) + 50, 60 + 30*iters, 3);
    pop();
    fill(0,0,0,120);
    rect(x, y, textWidth(note) + 50, 60 + 30*iters, 3);
    push();
    stroke("white");
    strokeWeight(2);
    noFill();
    rect(x, y, textWidth(note) + 40, 50 + 30*iters, 2);
    pop();
    fill("white");
    text(note, x, y);
    pop();
}

class Info{
  constructor(){
    this.x = windowWidth - 50;
    this.y = 20;
  }
  update(){
    push();
    stroke("white");
    strokeWeight(4);
    rectMode(CORNER);
    rect(this.x,this.y,35,35);
    rect(this.x,this.y,15,15);

    pop();
    push();
    stroke("white");
    textSize(30);
    fill("white");
    pop();
    this.mouseHover();
  }
  mouseHover(){
    let distance = dist(mouseX, mouseY, this.x, this.y);
    let note = "Hello welcome to EWS, a collaborative program designed to create space for people to anonymously vent in a public forum. The program works as such, anyone can send in a message of something they wish they had said to someone but hasn't yet or wish they said it in a moment where they didn't. Try your best to find the messages hidden amongst the waves.";
    print(distance);
    note = addbreaks(note, 70);
    if(distance < 45){
      maketextbox(windowWidth/2,windowHeight/2, note);
    }

  }
}
class Cell {
  constructor(x0, y0, r, angle){
    this.r = r;
    this.angle = angle; 
    this.x0 = x0;
    this.y0 = y0;
    this.size = 0;
    this.color = 70;
    this.has = random(0,500);
    this.note = "";
    if(this.has > 499){
      let temp = int(random(0,messages.length));
      this.note = messages[temp];
      this.note2 = whom[temp];
    }
  }
  
  update(){
    this.x = this.r*cos(this.angle);
    this.y = this.r*sin(this.angle);
    
    this.angle += 0.03; 
    let distance = dist(mouseX,mouseY,this.x0,this.y0)*0.1;
    if(this.has > 499){
      this.size = map(distance, 0, 30, 30, 1);
      if(this.size > 35 || this.size < 1){
        this.size = 1;
      }
    }else{
      this.size = map(distance, 0, 25, 25, 1);
      if(this.size > 25 || this.size < 1){
        this.size = 1;
      }
    }

  }
  mouseHover(){
    let distance = dist(mouseX, mouseY, this.x0, this.y0);
    if(this.has > 499){
      this.color = "#90D5FF";
      if(distance < 20){
        this.color = "orange";
        maketextbox(windowWidth/2, windowHeight/2, this.note);
        maketextbox(windowWidth/2, windowHeight * 2/5, this.note2);
      }
    } else {
      if (distance < 50){
        this.color = 255;
      } else {
        if (this.color > 100){
          this.color -= 2; 
        } else {
          this.color = 100;
        }
      }
    }
  }
  
  display(){
    noFill();
    stroke(this.color);
    ellipse(this.x0+this.x, this.y0+this.y, this.size, this.size);
    this.mouseHover();
  }
}