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
        y : 50,
        vx : 1,
        vy : 0.5
    }));

    drawList.push(new StickMan(ctx, {
        x : 150.5,
        y : 50.5,
        vx : -0.5,
        vy : 2,
        scale : 1.2,
        lineWidth : 3,
        strokeStyle : 'green'
    }));

    drawList.push(new StickMan(ctx, {
        x : 250,
        y : 50,
        vx : 0.7,
        vy : 0.7,
        scale : 0.8,
        strokeStyle : 'orange'
    }));

    drawList.push(new Background(ctx,{
        x : 250,
        y : 250,
        zIndex : -2
    }));

    drawList.push(new Beach(ctx, {
        yWater : 300,
        ySand  : 400,
        zIndex : -1
    }));

    // sort the drawlist by zindex
    drawList.sort(function(a, b){
        return (a.config.zIndex || 0) - (b.config.zIndex || 0);
    });

    var loop = function(){
        ctx.clearRect(0, 0, 500, 500);
        drawList.forEach(function(item, i){
            item.update();
            item.draw();
        });

        window.requestAnimFrame(loop);
    };

    loop();
};

var StickMan = function(ctx, config){
    this.ctx    = ctx;
    this.config = config || {};

    this.x      = config.x;
    this.y      = config.y;
    this.vx     = config.vx;
    this.vy     = config.vy;
    this.scale  = config.scale || 1;
};

StickMan.prototype.draw = function(){
    var ctx    = this.ctx;
    var config = this.config;

    ctx.lineWidth   = config.lineWidth   || 2;
    ctx.strokeStyle = config.strokeStyle || 'black';

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);

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

StickMan.prototype.update = function(){
    // move
    this.move(this.vx, this.vy);
    var bbox = this.getBBox();
    // bounce
    if(bbox.x < 0 || bbox.x + bbox.w > 500){
        this.vx = -this.vx;
    }
    if(bbox.y < 0 || bbox.y + bbox.h > 500){
        this.vy = -this.vy;
    }
};

StickMan.prototype.getBBox = function(){
    return {
        x : this.x,
        y : this.y,
        w : 60  * this.scale,
        h : 130 * this.scale
    };
};


var Background = function(ctx, config){
    this.ctx    = ctx;
    this.config = config || {};

    this.x      = config.x;
    this.y      = config.y;
    this.angle  = config.angle || 0;

    var arcs = [];
    for(var angle = 0; angle < 2 * Math.PI;){
        var arc = 0.15 + Math.random() * 0.3;
        arcs.push(arc);
        angle += arc;
    }
    this.arcs = arcs;
};

Background.prototype.draw = function(){
    var ctx    = this.ctx;
    var config = this.config;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle, this.angle);

    var styles = ['red', 'yellow', 'pink'];
    styleIndex = 0;

    var angle = 0, arc;
    for(var i = 0, l = this.arcs.length; i < l; i++){
        arc = this.arcs[i];

        ctx.beginPath();
        ctx.fillStyle = styles[styleIndex];
        styleIndex = (styleIndex + 1) % styles.length;

        ctx.moveTo(0, 0);
        var r = 360; // radius, coincidentally 360px
        ctx.lineTo(r * Math.cos(angle), r * Math.sin(angle));
        angle += arc;
        ctx.lineTo(r * Math.cos(angle + 0.01), r * Math.sin(angle + 0.01)); // add tiny angle to avoid artifacts
        ctx.closePath();

        ctx.fill();
    }

    ctx.restore();
};
Background.prototype.update = function(){
    this.rotate(0.005);
};
Background.prototype.rotate = function(angle){
    this.angle += angle;
};

var Beach = function(ctx, config){
    this.ctx    = ctx;
    this.config = config || {};

    this.yWater = config.yWater;
    this.ySand  = config.ySand;
    this.shift  = 0;
};

Beach.prototype.draw = function(){
    var ctx    = this.ctx;
    var config = this.config;

    ctx.save();

    // sand
    ctx.fillStyle = 'yellow';
    ctx.fillRect(0, this.ySand, 500, 500 - this.ySand);

    // water
    ctx.translate(50-(this.shift % 200), this.yWater);
    ctx.scale(1, 0.5);
    var waterHeight = (this.ySand - this.yWater) * 2;

    ctx.fillStyle = 'blue';

    ctx.beginPath();
    ctx.moveTo(-50, waterHeight);
    ctx.lineTo(-50, 0);
    ctx.arc(0,   0, 50, Math.PI, 0, false);
    ctx.arc(100, 0, 50, Math.PI, 0, true);
    ctx.arc(200, 0, 50, Math.PI, 0, false);
    ctx.arc(300, 0, 50, Math.PI, 0, true);
    ctx.arc(400, 0, 50, Math.PI, 0, false);
    ctx.arc(500, 0, 50, Math.PI, 0, true);
    ctx.arc(600, 0, 50, Math.PI, 0, false);
    ctx.lineTo(650, waterHeight);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
};
Beach.prototype.update = function(){
    this.shift++;
};
