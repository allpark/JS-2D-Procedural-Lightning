
class LightningSegment
{
	constructor(p0, p1, width, col){
		
		this.p0 = p0;
		this.p1 = p1;
		this.thickness = width;
		this.col   = col;
		
	}
	
	Draw(thicknessmod){
		rt_FB0.strokeWeight(this.thickness * thicknessmod);        
		rt_FB0.line(this.p0.x, this.p0.y, this.p1.x, this.p1.y);
	}
	
}


class LightningBolt
{
	constructor(p0, p1, data){
		this.data            = data;
		this.color           = data.color || [255,255,255];
		this.thickness       = data.width || 5.0;
        
        this.life            = data.life || 1.0;
        
        this.fadeinTime      = data.fadeInTime  || 0.05;
        this.fadeOutTime     = data.fadeOutTime || 0.05;
        this.growTime        = data.growTime    || 0.05;
        this.initTime        = millis() * 0.001;
    
        this.dynamic         = (data.dynamic || false);
        this.velocity        = data.velocity || [0,0];
        this.velDampening    = data.velDampening || 0.5;
        this.shouldDraw      = true;
        
		this.p0   = p0.copy();
		this.p1   = p1.copy();
        
		this.shouldOscillate = data.oscillate == undefined ? true : data.oscillate;
        this.oscillateFreq   = data.oscillateFreq || 1.0;
        this.shouldGrow      = data.shouldGrow == undefined ? true : data.shouldGrow;
        
		this.segments        = [];
        
		this.createBolt(p0, p1);
		registerLightningObject(this);
	}
	
	Draw(){
        
        this.Think();
        this.Physics();
        
        if (this.shouldDraw){
            
            let alpha        = this.GetAlpha();
            let fadeinAlpha  = this.GetFadeInAlpha();
            let fadeoutAlpha = this.GetFadeOutAlpha();
            let growAlpha    = this.GetGrowAlpha();
            
            let curSegGrowThreshold = this.segments.length * growAlpha;
            
            let oscillateMod        = this.shouldOscillate ? ( cos( 2.0 * 3.14 *  this.oscillateFreq * (millis() * 0.001)) * 0.5 + 0.5 )  : 1;
            let thicknessmodFadeIn  = this.shouldGrow ?  min(fadeinAlpha, fadeoutAlpha) : 1.0;
            
            let thicknessMod        = oscillateMod * thicknessmodFadeIn;
    
            rt_FB0.stroke(this.color[0], this.color[1], this.color[2]);
            for (let i=0; i<  this.segments.length; i++){ 
                if (i < curSegGrowThreshold){
                    let segment = this.segments[i];
                    segment.Draw(thicknessMod);       
                }
            }  
            
        }
	}
    
    GetAlpha(){
        return min( (millis() * 0.001 - this.initTime) / this.life, 1.0);
    }
    GetFadeOutAlpha(){
        return 1.0 - constrain( (millis() * 0.001 - (this.initTime + this.life * ( 1.0 - this.fadeOutTime) )) / (this.fadeinTime * this.life), 0.0, 1.0);
    }
    GetGrowAlpha(){
        return (millis() * 0.001 - this.initTime) / (this.growTime * this.life);

    }
    GetFadeInAlpha(){
        return min((millis() * 0.001 - this.initTime) / (this.fadeinTime * this.life), 1.0);
    }
    DecayThink(){
        
        let alpha = this.GetAlpha();
        
        if (alpha >= 1.0){
            this.shouldDraw = false;
        }
        
    }
    Think(){
        this.DecayThink();
    }
    
    Physics(){
        
        if (this.dynamic && this.shouldDraw)
        {

            let p0 =  this.p0;
            let p1 =  this.p1;
            
            let maxDist = p0.dist(p1);
        
            for (let i=1; i<this.segments.length; i++){
                
                let prevSeg = this.segments[i-1];
                let curSeg  = this.segments[i];
                
                let distToStartingPoint = 0.0;
                let distToEndingPoint   = 0.0;
                
                distToStartingPoint     = curSeg.p0.dist(p0);
                distToEndingPoint       = curSeg.p0.dist(p1);
                
                let velScale = constrain(min(distToStartingPoint, distToEndingPoint) / (maxDist * 0.5), 0.0, 1.0) ** this.velDampening;
                
                let velX      = this.velocity[0] * velScale;
                let velY      = this.velocity[1] * velScale;
                
                // update point positions given velocity;
            
                prevSeg.p1.add(velX, velY);
                curSeg.p0.add(velX, velY);
                
            }
        }
    }
	createBolt(p0, p1){
	
		let segments = [];
	
		let iGen    			   = this.data.generations || 8;

		let maxBranchOffset   	   = constrain(this.data.chaosfactor || 100, 1,5000);
		
		let chanceOfForkPercentage = this.dynamic ? 0 : (this.data.forkchance || 5.0); 
		let widthReductionOnFork   = this.data.widthreductiononfork || 0.8;
		let forkLengthMin          = this.data.forklengthmin || 0.1;
		let forkLengthMax          = this.data.forklengthmax || 2.0;
		
		let forkRotationMin        = this.data.forkrotationmin || 0.0;
		let forkRotationmax        = this.data.forkrotationmax || 95.0;
		
		let branchOffsetReductionEachGenerationPercentage = 50;
		
		let currentBranchOffset    = maxBranchOffset;
		let bmaxBranchOffsetAsPercentageOfLength = false;
		
		if (bmaxBranchOffsetAsPercentageOfLength){
			currentBranchOffset =  Vector(p0.x - p1.x, p0.y, - p1.y).mag() * (constrain(maxBranchOffset, 0.1, 100) / 100);
        }
		
		let chanceOfFork = constrain(chanceOfForkPercentage, 0, 100) / 100;
		let branchOffsetReductionEachGeneration = constrain(branchOffsetReductionEachGenerationPercentage, 0.0, 100) / 100.0;
		
		segments.push(new LightningSegment(p0, p1, this.data.width || 1.0, [255,255,255]))
		
		
		for (let i=0; i<iGen; i++){
		
			let newGen = [];
			
			for (let i2=0; i2<segments.length; i2++){
				
				let seg      = segments[i2];
				
				let midpoint = Vector((seg.p1.x + seg.p0.x) * 0.5, (seg.p1.y + seg.p0.y) * 0.5);
				let normal   = Vector(seg.p1.x - seg.p0.x , seg.p1.y - seg.p0.y).getNormal().normalize();
		
        
				midpoint.add( normal.mult(random(-currentBranchOffset, currentBranchOffset)));
				
				newGen.push( new LightningSegment(seg.p0, midpoint, seg.thickness));
				newGen.push( new LightningSegment(midpoint, seg.p1, seg.thickness));

		
				if (random() > (1.0 - chanceOfFork)){
				
                    
					let direction = Vector(midpoint.x - seg.p0.x, midpoint.y - seg.p0.y);
					let splitEnd  = direction.mult(random(forkLengthMin, forkLengthMax)).rotateDegs(random(forkRotationMin, forkRotationmax)).add(midpoint);
					
					newGen.push( new LightningSegment(midpoint, splitEnd, seg.thickness * widthReductionOnFork))
					
				}

			}
			
			segments = [];
			segments = newGen;
			
			currentBranchOffset = currentBranchOffset * branchOffsetReductionEachGeneration;
			
		
		}
      
		this.segments = segments;
	
	}
	
	
	
}

