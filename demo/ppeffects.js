
function renderBloom(){

 
    // copy render target texture from rt_FB1_Mip0 to rt_FB1_Mip1
    rt_FB1_Mip1.image(rt_FB1_Mip0, -rt_FB1_Mip1.width * 0.5, -rt_FB1_Mip1.height * 0.5, rt_FB1_Mip1.width, rt_FB1_Mip1.height);
    
    // perform blur 
    rt_FB1_Mip1.shader(shader_GaussBlur);

    shader_GaussBlur.setUniform('resolution', [rt_FB1_Mip1.width, rt_FB1_Mip1.height]);
    shader_GaussBlur.setUniform('frameBuffer', rt_FB1_Mip1)


    for (let i=0; i<4; i++){;
        shader_GaussBlur.setUniform('direction', [1,0]);
        shader_GaussBlur.setUniform('radius', i + 1);
        shader_GaussBlur.setUniform('time', millis() * 0.001);

        // draw to the buffer
         rt_FB1_Mip1.rect(0,0,rt_FB1_Mip1.width, -rt_FB1_Mip1.height);

        shader_GaussBlur.setUniform('direction', [0,1]);
        shader_GaussBlur.setUniform('radius', i + 1);

        // draw to the buffer
        rt_FB1_Mip1.rect(0,0,rt_FB1_Mip1.width, -rt_FB1_Mip1.height);

    }
    
   
}

function distortLightningBuffer(){
    
    if (drawPPDistortion){
        
        rt_FB1_Mip0.shader(shader_lightningDistort);

        shader_lightningDistort.setUniform('frameBuffer', rt_FB1_Mip0);
        shader_lightningDistort.setUniform('texnoise', tex_CurlNoise);
        shader_lightningDistort.setUniform('time', millis() * 0.001);

        rt_FB1_Mip0.rect(0,0,rt_FB1_Mip0.width,rt_FB1_Mip0.height);

    }   

}

function copyFromFrameBufferToWorkingBuffer(){
        
    // copy render target texture from rt_FB1_Mip0 to rt_FB1_Mip1
        
    rt_FB1_Mip0.shader(shader_Copy);
    shader_Copy.setUniform('frameBuffer', rt_FB0);
    rt_FB1_Mip0.rect(0,0,rt_FB1_Mip0.width,rt_FB1_Mip0.height);

}
function renderPostProcessEffects(){
    
    if (drawPPEffects){
        
        copyFromFrameBufferToWorkingBuffer();
        distortLightningBuffer();

        renderBloom();

        //clearAdditiveBuffer(FrameBufferLightning);
        //clearAdditiveBuffer(FrameBufferBloom);

    }
}

