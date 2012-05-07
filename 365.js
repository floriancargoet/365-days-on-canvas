window.onload = function(){
    var canvas = document.getElementById('c');
    var ctx    = canvas.getContext('2d');
    drawStickMan(ctx);
};

function drawStickMan(ctx){
    ctx.lineWidth   = 2;
    ctx.strokeStyle = 'black';
    
    // head, hands & feet
    ctx.strokeRect(100, 50, 30, 30);
    ctx.strokeRect(107, 55,  5,  5);
    ctx.strokeRect(118, 55,  5,  5);
    ctx.strokeRect(108, 70, 14,  5);
    
    ctx.strokeRect( 85, 120, 10, 10);
    ctx.strokeRect(135, 120, 10, 10);
    ctx.strokeRect( 95, 170, 10, 10);
    ctx.strokeRect(125, 170, 10, 10);
    
    
    ctx.beginPath();
    // arms
    ctx.moveTo( 90, 120);
    ctx.lineTo( 90,  90);
    ctx.lineTo(140,  90);
    ctx.lineTo(140, 120);
    // legs
    ctx.moveTo(100, 170);
    ctx.lineTo(100, 140);
    ctx.lineTo(130, 140);
    ctx.lineTo(130, 170);
    // body
    ctx.moveTo(115,  80);
    ctx.lineTo(115, 140);
    
    ctx.stroke();
}
