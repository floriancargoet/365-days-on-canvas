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

    drawList.forEach(function(item){
        item.draw();
    });
};

var StickMan = function(ctx, config){
    this.ctx    = ctx;
    this.config = config || {};
};

StickMan.prototype.draw = function(){
    var ctx    = this.ctx;
    var config = this.config;

    ctx.lineWidth   = config.lineWidth   || 2;
    ctx.strokeStyle = config.strokeStyle || 'black';

    ctx.save();
    ctx.translate(config.x, config.y);
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
