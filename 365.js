
Canvas365.registerDay('365', function(){
    // classes and globals

    var Util = {
        rand : function (max){
            return Math.floor(Math.random()*max);
        }
    };

    var BBoxRegistry = {
        objects : [],
        bboxes  : [],
        update : function(object, bbox){
            var i = this.objects.indexOf(object);
            if(i !== -1){
                this.bboxes.splice(i, 1, bbox);
            } else {
                this.objects.push(object);
                this.bboxes.push(bbox);
            }
        },
        remove : function(object){
            var i = this.objects.indexOf(object);
            if(i !== -1){
                this.objects.splice(i, 1);
                this.bboxes.splice(i, 1);
            }
        },
        getBBoxesAt : function(x, y){
            return this.bboxes.filter(function(bbox, i){
                return bbox.x1 < x && x < bbox.x2 && bbox.y1 < y && y < bbox.y2;
            });
        },
        getObjectsAt : function(x, y){
            var all = this.objects;
            var boxes = this.bboxes;
            return this.getBBoxesAt(x, y).map(function(bbox){
                return all[boxes.indexOf(bbox)];
            });
        }
    };

    var StickMan = function(ctx, config){
        this.ctx    = ctx;
        this.config = config || {};

        this.x = this.y = 0;
        this.move(config.x, config.y);

        this.vx     = config.vx;
        this.vy     = config.vy;
        this.scale  = config.scale || 1;

        this.targetX = this.x;
        this.targetY = this.y;
    };

    StickMan.prototype.onClick = function(){
        if(ModeSelector.mode === 'edit'){
            var colors = ['white', 'red', 'cyan', 'blue', 'black'];
            this.config.strokeStyle = colors[Util.rand(colors.length)];
        }
    };

    StickMan.prototype.draw = function(){
        var ctx    = this.ctx;
        var config = this.config;

        ctx.save();

        ctx.lineWidth   = config.lineWidth   || 2;
        ctx.strokeStyle = config.strokeStyle || 'black';

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

        if(config.msg){
            this.say(config.msg);
        }
        ctx.restore();
    };

    StickMan.prototype.move = function(x, y){
        this.x += x;
        this.y += y;

        // bbox
        BBoxRegistry.update(this, this.getBBox2());
    };

    StickMan.prototype.goTo = function(x, y){
        var bbox = this.getBBox();
        this.targetX = Math.min(Math.max(0, x), 500 - bbox.w);
        this.targetY = Math.min(Math.max(0, y), 500 - bbox.h);
    };

    StickMan.prototype.say = function(msg){
        var bubble = new SpeechBubble(this.ctx, {
            x : 50,
            y : 15,
            text : msg
        });
        bubble.draw();
    };

    StickMan.prototype.update = function(){
        // move
        var dx = 0, dy = 0;
        if(Math.abs(this.targetX - this.x) > this.vx){
            dx = this.targetX > this.x ? this.vx : -this.vx;
        }
        if(Math.abs(this.targetY - this.y) > this.vy){
            dy = this.targetY > this.y ? this.vy : -this.vy;
        }
        this.move(dx, dy);
    };

    StickMan.prototype.getBBox = function(){
        return {
            x : this.x,
            y : this.y,
            w : 60  * this.scale,
            h : 130 * this.scale
        };
    };
    StickMan.prototype.getBBox2 = function(){
        return {
            x1 : this.x,
            y1 : this.y,
            x2 : this.x + 60  * this.scale,
            y2 : this.y + 130 * this.scale
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
        var styleIndex = 0;

        var angle = 0, arc;
        for(var i = 0, l = this.arcs.length; i < l; i++){
            arc = this.arcs[i];

            ctx.beginPath();
            ctx.fillStyle = styles[styleIndex];
            styleIndex = (styleIndex + 1) % styles.length;

            ctx.moveTo(0, 0);
            var r = 500;
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
        this.t      = 0;
    };

    Beach.prototype.draw = function(){
        var ctx    = this.ctx;
        var config = this.config;

        ctx.save();

        var waterHeight = (this.ySand - this.yWater);

        // sand
        ctx.fillStyle = '#F0C479';
        ctx.fillRect(0, this.yWater, 500, 500 - this.yWater);

        // wet sand
        ctx.beginPath();
        ctx.fillStyle = '#e0b576';
        ctx.translate(0, this.ySand + this.amplitude2 * 100 + 10);
        ctx.scale(1, this.amplitude2);
        ctx.arc(0,   0, 50, Math.PI, 0, false);
        ctx.arc(100, 0, 50, Math.PI, 0, true);
        ctx.arc(200, 0, 50, Math.PI, 0, false);
        ctx.arc(300, 0, 50, Math.PI, 0, true);
        ctx.arc(400, 0, 50, Math.PI, 0, false);
        ctx.arc(500, 0, 50, Math.PI, 0, true);
        ctx.scale(1, 1/this.amplitude2);
        ctx.translate(0, -this.amplitude2 * 100 - 10);
        ctx.lineTo(500, -waterHeight);
        ctx.lineTo(  0, -waterHeight);
        ctx.closePath();

        ctx.fill();

        ctx.restore();
        ctx.save();

        // water
        ctx.fillStyle = '#6AB8DF';

        ctx.beginPath();

        // water/sand line
        ctx.translate(0, this.ySand + this.amplitude * 100);
        ctx.scale(1, this.amplitude);
        ctx.arc(0,   0, 50, Math.PI, 0, false);
        ctx.arc(100, 0, 50, Math.PI, 0, true);
        ctx.arc(200, 0, 50, Math.PI, 0, false);
        ctx.arc(300, 0, 50, Math.PI, 0, true);
        ctx.arc(400, 0, 50, Math.PI, 0, false);
        ctx.arc(500, 0, 50, Math.PI, 0, true);
        ctx.scale(1, 1/this.amplitude);
        ctx.translate(0, -this.amplitude * 100);

        // foam
        ctx.lineWidth = 10;
        ctx.strokeStyle = 'white';
        ctx.stroke();

        ctx.lineTo(500, -waterHeight);
        ctx.lineTo(  0, -waterHeight);
        ctx.closePath();
        ctx.fill();


        ctx.restore();
    };
    Beach.prototype.update = function(){
        this.t += 0.01;
        this.amplitude  = 0.25*(1 + Math.sin(this.t));
        this.amplitude2 = 0.25*(1 + Math.sin(this.t - Math.PI/6));
    };

    var Sun = function(ctx, config){
        this.ctx    = ctx;
        this.config = config || {};

        this.x      = config.x;
        this.y      = config.y;
        this.radius = config.radius;
        this.register();
    };

    Sun.prototype.register = function(){
        BBoxRegistry.update(this, {
            x1 : this.x - this.radius,
            y1 : this.y - this.radius,
            x2 : this.x + this.radius,
            y2 : this.y + this.radius
        });
    };

    Sun.prototype.onClick = function(){
        if(ModeSelector.mode === 'edit'){
            this.radius = this.config.radius + (this.radius + 2) % 10;
            this.register();
        }
    };

    Sun.prototype.draw = function(){
        var ctx    = this.ctx;
        var config = this.config;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = '#FFFF00';

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, 2 * Math.PI, true);
        ctx.fill();

        ctx.restore();
    };

    Sun.prototype.update = function(){};


    var Shark = function(ctx, config){
        this.ctx    = ctx;
        this.config = config || {};

        this.cx = config.x;
        this.cy = config.y;
        this.t  = 0;
    };

    Shark.prototype.draw = function(){
        var ctx    = this.ctx;
        var config = this.config;

        ctx.save();
        ctx.translate(this.x, this.y);
        if(this.reverse){
            ctx.scale(-1, 1);
        }
        ctx.fillStyle   = '#ccc';
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(15, 0, 15, Math.PI, -Math.PI/2, false);
        ctx.arc(45, 0, 30, -5*Math.PI/6, Math.PI, true);

        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    };

    Shark.prototype.update = function(){
        this.t += 0.01;
        var dx = 50 * Math.cos(this.t);
        var dy = 30 * Math.sin(this.t);
        this.x = this.cx + dx;
        this.y = this.cy + dy;
        this.reverse = (dy < 0);

        // buggy
        // BBoxRegistry.update(this, this.getBBox2());
    };

    Shark.prototype.getBBox2 = function(){
        return {
            x1 : this.x,
            y1 : this.y - 15,
            x2 : this.x + 15,
            y2 : this.y
        };
    };

    var Umbrella = function(ctx, config){
        this.ctx    = ctx;
        this.config = config || {};

        this.x     = config.x;
        this.y     = config.y;
        this.angle = config.angle;
    };

    Umbrella.prototype.draw = function(){
        var ctx = this.ctx;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.beginPath();
        ctx.moveTo(0, -35);
        ctx.lineTo(0, 60);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-60, 0);
        ctx.quadraticCurveTo(  0, -60,  60, 0);
        ctx.quadraticCurveTo( 45, -10,  30, 0);
        ctx.quadraticCurveTo(  0, -10, -30, 0);
        ctx.quadraticCurveTo(-45, -10, -60, 0);

        ctx.fillStyle = 'yellow';
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();

        ctx.moveTo(30, 0);
        ctx.quadraticCurveTo(  0, -10, -30,   0);
        ctx.quadraticCurveTo(-20, -20,   0, -30);
        ctx.quadraticCurveTo( 20, -20,  30,   0);

        ctx.fillStyle  = 'red';
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    };

    Umbrella.prototype.update = function(){
    };

    var SpeechBubble = function(ctx, config){
        this.ctx = ctx;
        this.config = config;
        this.padding = (config.padding != null) ? config.padding : 20;
        if(typeof config.text === 'string'){
            config.text = [config.text];
        }

    };

    SpeechBubble.prototype.computeSize = function(lineHeight){
        var width, height;
        var text = this.config.text;
        var ctx  = this.ctx;

        var widths = text.map(function(t){
            return ctx.measureText(t).width;
        });

        width  = Math.max.apply(Math, widths);
        height = lineHeight * text.length;

        return {
            width      : width  + 2 * this.padding,
            height     : height + 2 * this.padding,
            lineWidths : widths
        };
    };

    SpeechBubble.prototype.draw = function(){
        var ctx = this.ctx;
        var config = this.config;
        ctx.save();

        ctx.fillStyle   = 'white';
        ctx.strokeStyle = 'black';
        ctx.font        = '20px sans-serif';
        ctx.lineWidth   = 3;

        var size = this.computeSize(20);
        var w    = size.width;
        var h1   = size.height;
        var h2   = 30;
        var cornerW = w/5;
        var cornerH = Math.min(h1/2, cornerW);

        ctx.translate(config.x, config.y - h1 - h2);

        ctx.beginPath();
        ctx.moveTo(4*cornerW, 0);
        // top, top left
        ctx.lineTo(cornerW, 0);
        ctx.quadraticCurveTo(0, 0, 0, cornerH);

        // left, bottom left
        ctx.lineTo(0, h1 - cornerH);
        ctx.quadraticCurveTo(0, h1, cornerW, h1);

        // arrow
        ctx.quadraticCurveTo(cornerW, h1+h2, 0, h1+h2);
        ctx.quadraticCurveTo(cornerW, h1+h2, 2*cornerW, h1);

        // bottom, bottom right
        ctx.lineTo(4*cornerW, h1);
        ctx.quadraticCurveTo(w, h1, w, h1 - cornerH);

        //right, top right
        ctx.lineTo(w, cornerH);
        ctx.quadraticCurveTo(w, 0, 4*cornerW, 0);

        ctx.stroke();
        ctx.fill();

        ctx.fillStyle    = 'black';
        ctx.textBaseline = 'top';
        var p = this.padding;
        config.text.forEach(function(line, i){
            ctx.fillText(line, (w - size.lineWidths[i]) / 2, p + i * 20);
        });

        ctx.restore();
    };

    var Bird = function(ctx, config){
        this.ctx = ctx;
        this.config = config;
        this.x = config.x;
        this.y = config.y;
        this.t = 0;
        config.scale   = config.scale || 1;
        config.color   = config.color || [0, 0, 0];
        config.opacity = config.opacity || 1; // can't be 0

        this.register();
    };

    Bird.prototype.register = function(){
        var s = this.config.scale;
        BBoxRegistry.update(this, {
            x1 : this.x - s * 20,
            y1 : this.y - s * 10,
            x2 : this.x + s * 20,
            y2 : this.y + s * 10
        });
    };

    Bird.prototype.onClick = function(){
        if(ModeSelector.mode === 'edit'){
            this.config.color = [0, 0, 0];
        }
    };

    Bird.prototype.draw = function(){
        var ctx = this.ctx;
        var config = this.config;
        ctx.save();
        ctx.fillStyle = 'rgba(' + config.color.join(',') + ',' + config.opacity + ')';

        ctx.translate(this.x, this.y);
        ctx.scale(config.scale, config.scale);

        ctx.beginPath();
        ctx.moveTo(0, 0);

        var m = this.m;
        //                    ctrl pt1,        ctrl pt2,           target pt
        ctx.bezierCurveTo(  5,      -5,     15, -10 + m,     20, -10 + 1.5*m);
        ctx.bezierCurveTo( 15,  -8 + m,      5,       0,               0,  8);
        ctx.bezierCurveTo( -5,       0,    -15,  -8 + m,    -20, -10 + 1.5*m);
        ctx.bezierCurveTo(-15, -10 + m,     -5,      -5,              0,   0);

        ctx.fill();
        ctx.restore();
    };

    Bird.prototype.update = function(){
        this.t += 0.1;
        this.m = 7 * (1 + Math.sin(this.t));
    };

    var ModeSelector = function(ctx, config){
        this.ctx = ctx;
        this.config = config;
        this.x = config.x;
        this.y = config.y;
        this.register();
    };

    // default mode
    ModeSelector.mode = 'normal';

    ModeSelector.prototype.register = function(){
        var me = this;
        this.config.modes.forEach(function(mode, i){
            var x1 = me.x + 2 + 12*i;
            var y1 = me.y + 2;
            BBoxRegistry.update(mode, {
                x1 : x1,
                y1 : y1,
                x2 : x1 + 10,
                y2 : y1 + 10
            });
            mode.onClick = me.onModeClick;
        });
    };

    ModeSelector.prototype.onModeClick = function(x, y){
        //this = clicked mode object
        ModeSelector.mode = this.mode;
    };

    ModeSelector.prototype.draw = function(){
        var ctx = this.ctx;
        var config = this.config;
        ctx.save();
        ctx.fillStyle = 'white';

        ctx.translate(this.x, this.y);

        ctx.fillRect(0, 0, config.modes.length * 12 + 2, 14);

        config.modes.forEach(function(mode, i){
            ctx.fillStyle = mode.color;
            ctx.fillRect(2 + 12*i, 2, 10, 10);
            if(mode.mode === ModeSelector.mode){
                ctx.strokeRect(2 + 12*i, 2, 10, 10);
            }
        });

        ctx.font = '14px sans serif';
        ctx.fillStyle = '#ddd';
        ctx.textBaseline = 'top';
        ctx.fillText(ModeSelector.mode, 0, 16);
        ctx.restore();
    };

    ModeSelector.prototype.update = function(){};

    var Cloud = function(ctx, config){
        this.ctx = ctx;
        this.config = config;
        this.x = config.x;
        this.y = config.y;

        // angle between points is in [2π/10 ; 3π/10]
        config.angleRange  = config.angleRange  || [Math.PI/10, 3*Math.PI/10];
        config.ratio       = config.ratio       || 3; // ellipse w/h ratio
        config.scale       = config.scale       || 1;
        config.heightRange = config.heightRange || [0.4, 0.4] // between 40% and 80% of the distance between 2 points
        // precompute the cloud
        var angle = 0;
        var points = [];

        // place some points on an ellipse
        var arg = config.angleRange;
        while(angle < 2 * Math.PI){
            angle += arg[0] + Math.random() * (arg[1] - arg[0]);

            points.push({
                x : config.ratio * 20 * Math.cos(angle),
                y : 20 * Math.sin(angle)
            });
        }

        // compute bezier curves between points
        // control points are placed on the perpendicular lines (outside
        // the ellipse)
        for(var i = 0, l = points.length; i < l; i++){
            var pt = points[i];
            var lastPt = points[i-1] || points[points.length-1];
            var x0, y0, x1, y1, r;
            // vector between the 2 points
            x1 = pt.x - lastPt.x;
            y1 = pt.y - lastPt.y;
            // rotate by 90° and reduce length
            var hrg = config.heightRange;
            r = hrg[0] + (hrg[1] - hrg[0]) * Math.random();
            x0 =  y1 * r;
            y0 = -x1 * r;

            // add vector to both points to determine the control points
            pt.cp2x = pt.x + x0;
            pt.cp2y = pt.y + y0;
            pt.cp1x = lastPt.x + x0;
            pt.cp1y = lastPt.y + y0;
        }

        this.points = points;
    };

    Cloud.prototype.draw = function(){
        var ctx = this.ctx;
        var config = this.config;
        ctx.save();
        ctx.fillStyle = 'white';

        ctx.translate(this.x, this.y);
        ctx.scale(config.scale, config.scale);

        ctx.beginPath();
        var pt0 = this.points[0];
        ctx.moveTo(pt0.x, pt0.y);
        for(var i = 1, l = this.points.length; i < l; i++){
            var pt = this.points[i];
            ctx.bezierCurveTo(pt.cp1x, pt.cp1y, pt.cp2x, pt.cp2y, pt.x, pt.y);
        }
        // link the last point to the first
        ctx.bezierCurveTo(pt0.cp1x, pt0.cp1y, pt0.cp2x, pt0.cp2y, pt0.x, pt0.y);

        ctx.fill();
        ctx.restore();
    };

    Cloud.prototype.update = function(){};



    var Palmtree = function(ctx, config){
        this.ctx = ctx;
        this.config = config;
        this.x = config.x;
        this.y = config.y;

        config.scale   = config.scale || 1;
    };

    Palmtree.prototype.draw = function(){
        var ctx = this.ctx;
        var config = this.config;
        ctx.save();

        ctx.translate(this.x, this.y);
        ctx.scale(config.scale, config.scale);

        // trunk
        ctx.fillStyle = '#803B0A';

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-5, -50, 15, -75);
        ctx.quadraticCurveTo(20, -77, 20, -73);
        ctx.quadraticCurveTo( 0, -50, 12,   0);
        ctx.closePath();
        ctx.fill();

        // leaves
        ctx.fillStyle = '#207E39';

        ctx.beginPath();
        ctx.moveTo(12, -75);
        ctx.quadraticCurveTo(-5, -73, -20, -75);
        ctx.bezierCurveTo(-10, -80, 0, -90, 10, -85);
        ctx.quadraticCurveTo(-7, -95, -25, -100);
        ctx.bezierCurveTo(-10, -98, 10, -105, 20, -90);
        ctx.bezierCurveTo(25, -100, 42, -105, 47, -110);
        ctx.lineTo(30, -90);
        ctx.quadraticCurveTo(55, -92, 58, -80);
        ctx.quadraticCurveTo(45, -80, 30, -82);
        ctx.quadraticCurveTo(45, -80, 48, -60);
        ctx.quadraticCurveTo(30, -65, 22, -75);
        ctx.quadraticCurveTo(20, -80, 12, -75)

        ctx.fill();

        ctx.restore();
    };

    Palmtree.prototype.update = function(){};


    // globals
    var drawList = [];
    var transparentBird;
    var beach;
    var boxes = [];

    return {
        init : function(ctx){
            // create your objects here
            // add them to the drawList
            var stickman = new StickMan(ctx, {
                x : 100,
                y : 380,
                vx : 3,
                vy : 0,
                zIndex : 10,
                msg : ["Hello!", "Click anywhere on the", "beach and I'll go!"],
                scale : 0.8
            });
            drawList.push(stickman);

            beach = new Beach(ctx, {
                yWater : 250,
                ySand  : 350,
                zIndex : -1
            });
            drawList.push(beach);

            drawList.push(new Sun(ctx, {
                x : 400,
                y : 100,
                radius : 20,
                zIndex : -1
            }));

            drawList.push(new Shark(ctx, {
                x : 350,
                y : 300
            }));

            drawList.push(new Umbrella(ctx, {
                x : 380,
                y : 420,
                angle : -Math.PI/8
            }));

            drawList.push(new Bird(ctx, {
                x : 350,
                y : 80
            }));

            drawList.push(new Bird(ctx, {
                x : 370,
                y : 110,
                scale : 0.6
            }));

            drawList.push(new Bird(ctx, {
                x : 320,
                y : 100,
                scale : 0.7
            }));

            drawList.push(new ModeSelector(ctx, {
                x : 10,
                y : 10,
                zIndex : 100,
                modes : [{
                    mode  : 'normal',
                    color : 'red'
                },{
                    mode  : 'edit',
                    color : 'green'
                },{
                    mode  : 'add',
                    color : 'orange'
                }]
            }));

            drawList.push(new Cloud(ctx, {
                x : 100,
                y : 100,
                angleRange : [Math.PI/10, Math.PI/4],
                heightRange : [0.6, 0.8]
            }));

            drawList.push(new Cloud(ctx, {
                x : 180,
                y : 50,
                scale : 0.5
            }));

            drawList.push(new Cloud(ctx, {
                x : 200,
                y : 120,
                ratio : 1.2,
                scale : 0.7,
                heightRange : [0.5, 0.7]
            }));

            drawList.push(new Palmtree(ctx, {
                x : 50,
                y : 450,
                zIndex : 5,
                scale  : 2.2
            }));



            // This bird will be attached to the mouse pointer when it's
            // in the sky. A click will make it black and fix its position
            // and create a new transparent bird

            function makeBird(){
                return new Bird(ctx, {
                    x : -100,
                    y : -100,
                    color : [Util.rand(255), Util.rand(255), Util.rand(255)],
                    opacity : 0.5,
                    scale : 0.5 + Math.random()
                });
            }

            transparentBird = makeBird();
            transparentBird.config.scale = 1.5; // make the first big, so that the user sees it immediately.

            // sort the drawlist by zindex
            drawList.sort(function(a, b){
                return (a.config.zIndex || 0) - (b.config.zIndex || 0);
            });

            var canvasX = ctx.canvas.offsetLeft,
                canvasY = ctx.canvas.offsetTop;

            ctx.canvas.addEventListener('click', function(ev){
                var x, y;
                if ( ev.offsetX == null ) { // Firefox
                   x = ev.layerX;
                   y = ev.layerY;
                } else {                    // Other browsers
                   x = ev.offsetX;
                   y = ev.offsetY;
                }

                // dispatch clicks
                var hoveredObj = BBoxRegistry.getObjectsAt(x, y);
                hoveredObj.forEach(function(o){
                    if(o.onClick){
                        o.onClick(x, y);
                    }
                });

                // add bird
                if(y < beach.config.yWater){
                    if(ModeSelector.mode === 'add'){
                        transparentBird.config.opacity = 1;
                        transparentBird.register();
                        drawList.push(transparentBird);

                        // sort the drawlist by zindex
                        drawList.sort(function(a, b){
                            return (a.config.zIndex || 0) - (b.config.zIndex || 0);
                        });

                        transparentBird = makeBird();
                    }
                }
                // movement
                else {
                    stickman.goTo(x, stickman.y); // animated
                }

            }, false);

            ctx.canvas.addEventListener('mousemove', function(ev){
                var x, y;
                if ( ev.offsetX == null ) { // Firefox
                   x = ev.layerX;
                   y = ev.layerY;
                } else {                    // Other browsers
                   x = ev.offsetX;
                   y = ev.offsetY;
                }

                if(ModeSelector.mode === 'add'){
                    transparentBird.x = x;
                    transparentBird.y = y;
                }

                boxes = BBoxRegistry.getBBoxesAt(x, y);

            }, false);

            var messages = [
                "Hello!|Click anywhere on the|beach and I'll go!",
                "What's up?",
                "I'm afraid of sharks.|I think I've spotted one|in the water…",
                "Could you add some|birds in the sky?|I feel alone…",
                "Don't like these clouds?|Just reload the page!",
                "Did you know you could|make the sun bigger?",
                "Switch to edit mode|and change my color!",
                "You should have tell me|it wasn't a nude beach!"
            ];

            var changeMessage = function(){
                var c = stickman.config;
                if(c.msg){
                    c.msg = null;
                    setTimeout(changeMessage, 1000);
                } else {
                    c.msg = messages[Util.rand(messages.length)].split('|');
                    setTimeout(changeMessage, 4000);
                }
            };
            setTimeout(changeMessage, 4000);

        },
        main : function(ctx){
            ctx.fillStyle = '#0582C2'; // sky
            ctx.fillRect(0, 0, 500, 500);
            drawList.forEach(function(item, i){
                item.update();
                item.draw();
            });

            if(ModeSelector.mode === 'edit'){
                boxes.forEach(function(box, i){
                    ctx.beginPath();
                    ctx.fillStyle = 'orange';
                    ctx.rect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
                    ctx.stroke();
                });
            }

            // transparent bird
            if(ModeSelector.mode === 'add'){
                if(transparentBird.y < beach.config.yWater){
                    transparentBird.update();
                    transparentBird.draw();
                }
            }
        }
    };

});
