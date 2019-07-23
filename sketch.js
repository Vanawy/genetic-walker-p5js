const DNA_LENGTH = 30;
const POPULATION_SIZE = 100;
const MUTATION_RATE = 0.05;
const MAX_STEPS = 500;


let population;
let target;

class Population{
  constructor(){
    this.generation = 1;
    this.maxfitness = 0;
    this.step = 0;
    this.walkers = [];
    for(let i = 0; i < POPULATION_SIZE; i++){
      this.walkers.push(new Walker());  
    }
  }
  
  nextGeneration(){
    this.generation++;
    let maxfitness = 0;
    this.walkers.forEach(w => {
      w.calcFitness();
      if(w.fitness > maxfitness) maxfitness = w.fitness;
    });
    this.maxfitness = maxfitness;
    console.log(maxfitness);
    let dnapool = [];
    this.walkers.forEach(w => {
      w.fitness /= maxfitness;
      for(let i = 0; i < w.fitness * 100; i++){
        dnapool.push(w.dna);  
      }
    });
    
    for(let i = 0; i < POPULATION_SIZE; i++){
      this.walkers[i] = (new Walker(random(dnapool).cross(random(dnapool))));  
    }
    
  }
  
  draw(){
    
    text(this.step + " / " + MAX_STEPS, 10, 20);
    text("generation" + this.generation, 10, 10);
    text("mf " + this.maxfitness, 10, 30);
    this.step++;
    if(this.step >= MAX_STEPS){
      this.step = 0;
      this.nextGeneration();
    }
    this.walkers.forEach(w => {
      w.draw();
    });
  }
  update(){
    this.walkers.forEach(w => {
      w.update();
    });
  }
}

class DNA{
  constructor(genes = null){
    this.genes = (genes != null) ? genes : this.newGenes();  
    this.counter = 0;
  }
  
  newGenes(){
    let genes = [];
    for(let i = 0; i < DNA_LENGTH; i++){
      genes[i] = p5.Vector.random2D(); 
    }
    return genes;
  }
  
  cross(partnerDna){
    let childDna = [];
    let mid = random(DNA_LENGTH);
    for(let i = 0; i < DNA_LENGTH; i++){
      if(random() < MUTATION_RATE){
        childDna[i] = p5.Vector.random2D();
      }else{
        childDna[i] = random() > 0.5 ? this.genes[i] : partnerDna.genes[i]; 
        // childDna[i] = i > mid ? this.genes[i] : partnerDna.genes[i]; 
      }
    }
    return childDna;
  }
  
  nextMove(){
    if(this.counter >= DNA_LENGTH){
      this.counter = 0;  
    }
    return this.genes[this.counter++];
  }
}

class Walker{
  constructor(dna = null){
    this.pos = createVector(200, 200);
    this.color = color(random(100), random(100), random(100)); 
    this.dna = new DNA(dna);
    this.fitness = 0;
    this.targetReached = false;
    this.active = true;
    this.step = MAX_STEPS;
  }
  
  draw(){
    push();
    strokeWeight(2);
    stroke(this.color);
    point(this.pos.x, this.pos.y);  
    pop()
  }
  
  update(){
    if(this.active && !this.targetReached){
      this.pos.add(this.dna.nextMove());
      if(this.pos.x <= 0 || this.pos.x >= width || this.pos.y <= 0 || this.pos.y >= height){
        this.active = false;  
      }
      // console.log(this.pos.copy().sub(target).mag());
      if(this.pos.copy().sub(target).mag() < target.radius){
        this.targetReached = true;  
        this.step = population.step;
      }
    }
  }
  
  calcFitness(){
    this.fitness = (this.active ? 1 : 0.1) * (this.targetReached ? 1000 * ( MAX_STEPS / this.step) : 1) * 1000*((1 / this.pos.copy().sub(target).mag()));
  }
}

function setup() {
  createCanvas(400, 400);
  target = createVector(random(width), random(height));
  target.radius = 10;
  target.draw = function(){
    push();
    noStroke();
    fill(255,0,0);
    ellipse(this.x, this.y, this.radius * 2);
    pop();
  };
  population = new Population();
}

function draw() {
  background(220);
  population.update();
  target.draw();
  population.draw();
  
}