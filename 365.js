// shim layer with setTimeout fallback
window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function( callback ){
                window.setTimeout(callback, 1000 / 60);
            };
})();

window.onload = function(){
    var canvas = document.getElementById('c');
    var ctx    = canvas.getContext('2d');

    var drawList = [];

    drawList.push(new StickMan(ctx, {
        x : 50,
        y : 50
    }));

    drawList.push(new StickMan(ctx, {
        x : 150.5,
        y : 50.5,
        scale : 1.2,
        lineWidth : 3,
        strokeStyle : 'green'
    }));

    drawList.push(new StickMan(ctx, {
        x : 250,
        y : 50,
        scale : 0.8,
        strokeStyle : 'orange'
    }));

    var moves = [
        {x : 2,   y : 1},
        {x : -1,   y : 4},
        {x : 1.5, y : 1.5}
    ];
    var loop = function(){
        ctx.clearRect(0, 0, 500, 500);
        drawList.forEach(function(item, i){
            // move
            item.move(moves[i].x, moves[i].y);
            // bounce
            if(item.x < 0 || item.x > 450){
                moves[i].x = -moves[i].x;
            }
            if(item.y < 0 || item.y > 400){
                moves[i].y = -moves[i].y;
            }
            item.draw();
        });

        window.requestAnimFrame(loop);
    }

    loop();
};

var StickMan = function(ctx, config){
    this.ctx    = ctx;
    this.config = config || {};
    this.x = config.x;
    this.y = config.y;
};

StickMan.prototype.draw = function(){
    var ctx    = this.ctx;
    var config = this.config;

    ctx.lineWidth   = config.lineWidth   || 2;
    ctx.strokeStyle = config.strokeStyle || 'black';

    ctx.save();
    ctx.translate(this.x, this.y);
    if(config.scale){
        ctx.scale(config.scale, config.scale);
    }

    // head, hands & feet
    ctx.strokeRect(15,  0, 30, 30);
    ctx.strokeRect(22,  5,  5,  5);
    ctx.strokeRect(33,  5,  5,  5);
    ctx.strokeRect(23, 20, 14,  5);

    ctx.strokeRect( 0, 70, 10, 10);
    ctx.strokeRect(50, 70, 10, 10);

    ctx.strokeRect(10, 120, 10, 10);
    ctx.strokeRect(40, 120, 10, 10);

    ctx.beginPath();
    // arms
    ctx.moveTo( 5, 70);
    ctx.lineTo( 5, 40);
    ctx.lineTo(55, 40);
    ctx.lineTo(55, 70);
    // legs
    ctx.moveTo(15, 120);
    ctx.lineTo(15,  90);
    ctx.lineTo(45,  90);
    ctx.lineTo(45, 120);
    // body
    ctx.moveTo(30, 30);
    ctx.lineTo(30, 90);

    ctx.stroke();
    ctx.restore();
};

StickMan.prototype.move = function(x, y){
    this.x += x;
    this.y += y;
};
