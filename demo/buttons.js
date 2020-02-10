
class ClickableButton
{
	constructor(x, y, w, h, text, state){
		
		this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.state = state;
        this.text  = text;
    
	}
	
    OnClick(){
        this.state = !this.state;
        this.OnClickVarChange();
    }
    OnClickVarChange(){

    }
    
    Draw(){
        
        if (this.state){
            fill(100, 255, 100);
        }
        
        else{
            fill(255,100,100);
        }
        
        rect(this.x, this.y, this.w, this.h);
        
        
        fill(255,255,255);
        
        textAlign(CENTER, CENTER);
        textSize(15);
        
        text( (this.state ? "DISABLE" : "ENABLE") + " " + this.text.toUpperCase(), this.x + this.w * 0.5, this.y + this.h * 0.5);
        
        // reset text alignment
        textAlign(LEFT);
    }
    OnMouseClick(x, y){

        if (x >= this.x && x <= this.x + this.w && y > this.y && y <= this.y + this.h ){
            this.OnClick();
        }
        else{
               
        }
        
    }
	
}


function newButton(x, y, w, h, text, state)
{
    return new ClickableButton(x,y,w,h,text,state);
}
