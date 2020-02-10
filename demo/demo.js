// game related variables 

var screenWidth  = 1270;
var screenHeight = 720;


// render targets 
var rt_FB0;
var rt_FB1_Mip0;
var rt_FB1_Mip1;
var rt_FB1_Mip2;


// shader textures
var tex_CurlNoise;

// shaders 
var shader_GaussBlur;
var shader_lightningDistort;
var shader_Copy;


// demo variables

var oldSpawnTime = 0.0;
var overlayWidth = 250;

var drawPPEffects    = false;
var drawPPDistortion = false;

// inputs

var input_ColorLightningR;
var input_ColorLightningG;
var input_ColorLightningB;
var input_Generations;
var input_Chaos;
var input_Width;
var input_Life;
var input_ForkChance;
var input_SpawnInterval;
var buttons = [];


// array for holding lightning bolt objects
lightningRenderables = [];

// array for cleaning up lightning bolt objects
lightningRenderablesToRemove = [];

var mouseClicks = {
    nums  : 0,
    start : Vector(screenWidth * 0.5, 0 + screenHeight * 0.05),
    end   : Vector(screenWidth * 0.5, screenHeight - screenHeight * 0.05)
}

function loadImages(){
    tex_CurlNoise    = loadImage("curl_noise.png");
}
function loadShaders(){
    shader_GaussBlur        = loadShader('shaders/blur.vert', 'shaders/blur.frag');
    shader_lightningDistort = loadShader('shaders/distort.vert', 'shaders/distort.frag');
    shader_Copy             =  loadShader('shaders/copy.vert', 'shaders/copy.frag');
    
}

function createInputs(){
    
    input_ColorLightningR = createSlider(0, 255, 255);
    input_ColorLightningR.position(1100, 80);

    input_ColorLightningG = createSlider(0, 255, 255);
    input_ColorLightningG.position(1100, 100);

    input_ColorLightningB = createSlider(0, 255, 255);
    input_ColorLightningB.position(1100, 120);
    
    input_Generations  = createSlider(1, 8, 3);
    input_Generations.position(1100, 165);

    input_Chaos  = createSlider(1, 1000, 125);
    input_Chaos.position(1100, 205);
    
    input_Life  = createSlider(0, 2, 1, 0.1);
    input_Life.position(1100, 245);
    
    input_ForkChance  = createSlider(0, 100, 5, 1);
    input_ForkChance.position(1100, 285);
          
    input_Width = createSlider(0, 64, 5, 1);
    input_Width.position(1100, 325);
    
    input_GrowTime = createSlider(0, 1, 0.5, 0.01);
    input_GrowTime.position(1100, 365);
    
    input_SpawnInterval = createSlider(0.5, 3, 2, 0.05);
    input_SpawnInterval.position(1100, 405);
    
    
    // buttons
    
    let button_PPEnable = newButton(1050, 450, 180, 50, "PP Effects", false);
    button_PPEnable.OnClickVarChange = function(){
        drawPPEffects = !drawPPEffects;
    }
    
    
        
    let button_DistortEnable = newButton(1050, 520, 180, 50, "Distort", false);
    button_DistortEnable.OnClickVarChange = function(){
        drawPPDistortion = !drawPPDistortion;
    }
    
    
    buttons.push( button_PPEnable);
    buttons.push( button_DistortEnable);

    
    
}

function mouseClicked(){
    
    if (mouseX < (screenWidth - overlayWidth)){

        mouseClicks.nums += 1

        if ( mouseClicks.nums%2==0){
            mouseClicks.start.set(mouseX, mouseY);
        }
        else{
            mouseClicks.end.set(mouseX, mouseY);
        }        
    }
    
    


    // go through every button and query for clicking 

    for (let i=0; i<buttons.length; i++){

        let button = buttons[i];
        button.OnMouseClick(mouseX, mouseY);
    }
    
}

function drawAnchors(){
    
    fill(255);
    noStroke();
    
    ellipse(mouseClicks.start.x, mouseClicks.start.y, 15);
    ellipse(mouseClicks.end.x, mouseClicks.end.y, 15);

    
}
function preload(){
    loadImages();
    loadShaders();
}


function setupRenderTargets(){
    
    rt_FB0 = createGraphics(screenWidth, screenHeight);
    rt_FB0.blendMode(ADD);

    // create mip render targets 
    rt_FB1_Mip0       = createGraphics(screenWidth, screenHeight, WEBGL);
    rt_FB1_Mip1       = createGraphics(screenWidth / (2 ** 2), screenHeight / (2**2), WEBGL);
    rt_FB1_Mip2       = createGraphics(screenWidth / (2 ** 3), screenHeight / (2**3), WEBGL);
    
    
}


function setup() {
    
    createCanvas(screenWidth, screenHeight);
    setupRenderTargets();
    createInputs();
  
}


function drawLightningBolts(){
    for (let i=0; i<lightningRenderables.length; i++){
        
        let lightningObj  = lightningRenderables[i];
        let drawLightning = lightningObj.shouldDraw;
        
        if (!drawLightning){
            lightningRenderablesToRemove.push(i);
        }
        
        lightningObj.Draw();
        
    }

}

function spawnLightning(){
    

    if (millis() * 0.001 >= oldSpawnTime){
        
         new LightningBolt(mouseClicks.start, mouseClicks.end,
              {
            color               : [input_ColorLightningR.value(),input_ColorLightningG.value(),input_ColorLightningB.value()],
            generations         : input_Generations.value(),
            chaosfactor         : input_Chaos.value(),
            width               : input_Width.value(),
            life                : input_Life.value(),
            fadeInTime          : 0.1,
            fadeOutTime         : 0.1,
            oscillateFreq       : 8,
            forkchance          : input_ForkChance.value(),
            widthreductiononfork: 0.5,
            forklengthmin       : 0.5, 
            forklengthmax       : 0.8,
            forkrotationmin     : 1,  
            forkrotationmax     : 25,
            growTime            : input_GrowTime.value(),
            dynamic             : false,
            velocity            : [2,-1],

        })      
    
        oldSpawnTime = millis() * 0.001 + input_SpawnInterval.value();
        
        
    }
    
}

function cleanupLightningBolts(){
    
    let cleanedLightningRenderables = [];
    
    // only append lightning objects which are still active 
    for (let i=0; i<lightningRenderablesToRemove.length; i++){
        for (let i2=0; i2<lightningRenderables.length; i2++){
        
            
            let lightningObj          = lightningRenderables[i];
            let lightningToExclude    = lightningRenderablesToRemove[i]; 
       
            if (i2 != lightningToExclude){
              
                cleanedLightningRenderables.push(lightningObj);
            }
        }
 
        
    }
    
    if (lightningRenderablesToRemove!=0){
        lightningRenderables         = cleanedLightningRenderables.splice();
    }
    
    // reset the 'to remove' array 
    lightningRenderablesToRemove = [];
    cleanedLightningRenderables  = [];
    
}
function updateLightningBolts(){

}


function drawInputsAndText(){
    
    
    // draw overlay
    fill(55);
    rect(screenWidth - overlayWidth, 0, overlayWidth, screenHeight);
    
    // draw text
    fill(255);
    textSize(25);
    text("Settings", screenWidth - overlayWidth * 0.7, 44);
    
    textSize(15);
    text("Color", screenWidth - overlayWidth * 0.9, 80);
    text("R", screenWidth - overlayWidth * 0.75, 95);
    text("G", screenWidth - overlayWidth * 0.75, 115);
    text("B", screenWidth - overlayWidth * 0.745, 135);

    fill(input_ColorLightningR.value(), input_ColorLightningG.value(), input_ColorLightningB.value());
    rect(screenWidth-overlayWidth*0.70, 80, 10, -10);
    
    fill(255);
    text("Generations", screenWidth - overlayWidth * 0.9, 160);
    text(input_Generations.value(), screenWidth - overlayWidth * 0.8, 180);

    text("Chaos", screenWidth - overlayWidth * 0.9, 200);
    text(input_Chaos.value(), screenWidth - overlayWidth * 0.85, 220);

    text("Life (s)", screenWidth - overlayWidth * 0.9, 240);
    text(input_Life.value(), screenWidth - overlayWidth * 0.85, 260);

    text("Fork%", screenWidth - overlayWidth * 0.9, 280);
    text(input_ForkChance.value(), screenWidth - overlayWidth * 0.85, 302);
  
    text("Width", screenWidth - overlayWidth * 0.9, 320);
    text(input_Width.value(), screenWidth - overlayWidth * 0.85, 342);
    
    text("Grow Time (s)", screenWidth - overlayWidth * 0.9, 365);
    text(input_GrowTime.value(), screenWidth - overlayWidth * 0.85, 382);
    
    text("Grow Time", screenWidth - overlayWidth * 0.9, 365);
    text(input_GrowTime.value(), screenWidth - overlayWidth * 0.85, 382);
        
    text("Spawn Interval", screenWidth - overlayWidth * 0.9, 405);
    text(input_SpawnInterval.value(), screenWidth - overlayWidth * 0.85, 422);
    
    
    // draw buttons
    
    for (let i=0; i<buttons.length; i++){
        buttons[i].Draw();
    }
    
    // draw info
    
    text("Click anywhere on the canvas to change lightning start and end points", screenWidth * 0.2, 15)
    
}
function draw() {
    
    blendMode(BLEND)
    // clear additive buffer
    rt_FB0.blendMode(BLEND)
    rt_FB0.background(0);
    rt_FB0.blendMode(ADD)
    
    // clear other buffers
    rt_FB1_Mip0.background(0);
    rt_FB1_Mip1.background(0);
    rt_FB1_Mip2.background(0);
    
    
    // spawn lightning event
    spawnLightning();
    
    // draw lightning bolts  
    drawLightningBolts();
    
    // clean up dead lightning objects
    cleanupLightningBolts();
    
    // draw pp effects
    renderPostProcessEffects();
    
    // draw to screen the output render
    
    if (drawPPEffects){
        
        
        rt_FB0.blendMode(BLEND)
        rt_FB0.image(rt_FB1_Mip0, 0, 0, screenWidth, screenHeight);  
        rt_FB0.blendMode(ADD)
        rt_FB0.image(rt_FB1_Mip1, 0, 0, screenWidth, screenHeight);  
        image(rt_FB0, 0, 0, screenWidth, screenHeight);   

  
    }
    else{
        // if not drawing with post processing effects enabled, then draw from frame buffer 0
        image(rt_FB0, 0, 0, screenWidth, screenHeight);   
    }
    
    // draw start and end point anchors
    drawAnchors();

    // draw inputs 
    drawInputsAndText();    
}

