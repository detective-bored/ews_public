
const SUPABASE_URL = "https://cxzzpczwylaqsoydwdry.supabase.co/";
const SUPABASE_KEY = "sb_publishable_p02OMwmXsn7ViyyEaPTxrg_UbiZf3YQ";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const messageDialog = document.getElementById("message-dialog");
const messageForm = document.getElementById("message-form");
const formFeedback = document.getElementById("form-feedback");
const submitButton = document.getElementById("submit-message-button");

let submittingMessage = false;

document
  .getElementById("add-message-button")
  .addEventListener("click", () => {
    formFeedback.textContent = "";

    if (messageBox) {
      messageBox.style.display = "none";
    }

    messageDialog.showModal();
  });

document
  .getElementById("close-message-button")
  .addEventListener("click", () => {
    messageDialog.close();
  });

messageForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (submittingMessage) return;

  const recipientInput = document.getElementById("recipient");
  const messageInput = document.getElementById("message-input");

  const recipient = recipientInput.value.trim();
  const message = messageInput.value.trim();

  if (!recipient || !message) {
    formFeedback.textContent = "Please fill in both fields.";
    return;
  }

  submittingMessage = true;
  submitButton.disabled = true;
  formFeedback.textContent = "Sending...";

  try {
    const { error } = await db
      .from("messages")
      .insert({ recipient, message });

    if (error) throw error;
  } catch (error) {
    console.error("Could not submit message:", error);
    formFeedback.textContent =
      "Your message could not be sent. Please try again.";

    return;
  } finally {
    submittingMessage = false;
    submitButton.disabled = false;
  }

  // The database save succeeded.
  messageForm.reset();
  formFeedback.textContent = "Your message has been added. Thank you.";

  // Add it to the current map's pool of available messages.
  messages.push(message);
  whom.push(recipient);

  buildGrid();
  messagesReady = true;
});

let messageBox;

let grid = [];
let cols, rows;
let loc = 50;

let messages = [];
let whom = [];
let box;

let messagesReady = false;
let loadingText = "Loading messages...";

// function setup() {
//   cols = windowWidth/30;
//   rows = windowHeight/30; 
//   createCanvas(windowWidth, windowHeight);
//   let rowSize = height/rows;
//   let colSize = width/cols; 
//   populate();
//   for (let i=0; i<cols+10; i++){
//     grid[i] = []
//     for (let j=0; j<rows+10; j++){
//       grid[i][j] = new Cell(colSize/2+i*colSize - 40, rowSize/2+j*rowSize - 40, rowSize/2, i*loc+j*loc);
//     }
//   }
//   box = new Info();
// }

// function preload(){
//   message = loadTable('messages/form.csv', 'csv', 'header');
// }
// function populate(){
//   messages = message.getColumn('Note');
//   whom = message.getColumn("To");
//   for(let i = 0; i < messages.length; i++){
//     messages[i] = addbreaks(messages[i], 100);
//   }
// }

function setup() {
  createCanvas(windowWidth, windowHeight);

  cols = windowWidth / 30;
  rows = windowHeight / 30;

  box = new Info();

  loadMessages();
}

async function loadMessages() {
  try {
    const { data, error } = await db
      .from("messages")
      .select("id, recipient, message");

    if (error) {
      throw error;
    }

    if (data.length === 0) {
      loadingText = "No messages yet.";
      return;
    }

    // Both arrays use the same row order, keeping each
    // message paired with its recipient.
    messages = data.map((row) => row.message);
    whom = data.map((row) => row.recipient);

    buildGrid();
    messagesReady = true;
  } catch (error) {
    console.error("Could not load messages:", error);
    loadingText = "Messages could not load. Please refresh to try again.";
  }
}

function buildGrid() {
  const rowSize = height / rows;
  const colSize = width / cols;

  // Shuffle indices to keep messages paired with their recipients.
  const available = shuffle(
    messages.map((_, index) => index)
  );

  grid = [];

  for (let i = 0; i < cols + 10; i++) {
    grid[i] = [];

    for (let j = 0; j < rows + 10; j++) {
      const cell = new Cell(
        colSize / 2 + i * colSize - 40,
        rowSize / 2 + j * rowSize - 40,
        rowSize / 2,
        i * loc + j * loc
      );

      if (cell.has > 499 && available.length > 0) {
        const index = available.pop();

        cell.note = messages[index];
        cell.note2 = whom[index];
      } else {
        // Make this an ordinary circle.
        cell.has = 0;
      }

      grid[i][j] = cell;
    }
  }
}
function draw() {
  background(0);
  if (messageBox) {
  messageBox.style.display = "none";
  }
  if (!messagesReady) {
    push();
    fill("white");
    noStroke();
    textFont("Courier New");
    textSize(20);
    textAlign(CENTER, CENTER);
    text(loadingText, width / 2, height / 2);
    pop();

    return;
  }
  textFont('Courier New');
  push();
  stroke("white");
  textSize(30);
  fill("white");
  textAlign(CENTER);
  text("everything i wish i said", windowWidth/2, 50);
  pop();
  for (let i=0; i<cols+10; i++){
    for (let j=0; j<rows+10; j++){
      grid[i][j].update();
      grid[i][j].display();
    }
  }

  box.update();

}

function maketextbox(note, recipient = "") {
  if (!messageBox) {
    messageBox = document.createElement("div");
    messageBox.className = "message-box";
    document.body.appendChild(messageBox);
  }

  messageBox.textContent = recipient
    ? `${recipient}\n\n${note}`
    : note;

  messageBox.style.display = "block";
}

// function countOccurrences(inputString, phrase) {
//   let count = 0;
//   let position = inputString.indexOf(phrase);
//   while (position !== -1) {
//     count++;
//     position = inputString.indexOf(phrase, position + 1);
//   }

//   return count;
// }

// function addbreaks(inputString, dist) {
//   let count = 0;
//   let breaks = "";

//   for (let i = 0; i < inputString.length; i++) {
//     const charac = inputString[i];
//     count += 1;

//     if (charac === " " && count > dist) {
//       breaks += "\n";
//       count = 0;
//     } else {
//       breaks += charac;
//     }
//   }

//   return breaks;
// }

// function maketextbox(x, y, note){
//     push(); 
//     noStroke();
//     rectMode(CENTER);
//     textAlign(CENTER, CENTER);
//     textSize(25);
//     let iters = countOccurrences(note, "\n");

//     push();
//     fill(0,0,0,173);
//     rect(x + 5, y + 5, textWidth(note) + 50, 60 + 30*iters, 3);
//     pop();
//     fill(0,0,0,120);
//     rect(x, y, textWidth(note) + 50, 60 + 30*iters, 3);
//     push();
//     stroke("white");
//     strokeWeight(2);
//     noFill();
//     rect(x, y, textWidth(note) + 40, 50 + 30*iters, 2);
//     pop();
//     fill("white");
//     text(note, x, y);
//     pop();
// }

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
    // note = addbreaks(note, 70);
    if(distance < 45){
      maketextbox(note);
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
    this.note2 = "";
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
        // maketextbox(windowWidth/2, windowHeight/2, this.note);
        // maketextbox(windowWidth/2, windowHeight * 2/5, this.note2);
        maketextbox(this.note, String("To: " + this.note2));
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

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  cols = width / 30;
  rows = height / 30;

  // Reposition the info button.
  box.x = width - 50;
  box.y = 20;

  if (messagesReady) {
    buildGrid();
  }
}
