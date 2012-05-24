var Canvas365 ={};
Canvas365.baseUrl = '';
Canvas365.days = {};
Canvas365.contexts = {};

Canvas365.loadDay = function(id){
    var file = Canvas365.baseUrl + id + '.js';
    Canvas365.loadScript(file);
};

Canvas365.loadScript = function(url){
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(script, s);
};

Canvas365.registerDay = function(id, callback){
    var day = Canvas365.days[id] = callback();
    day.ctx = Canvas365.contexts[id];
    day.init(day.ctx);
    Canvas365.days[id].loop = true;
    day.main(day.ctx);
};

Canvas365.startStop = function(ev){
    var id = ev.target.id.substring(3);
    Canvas365.days[id].loop = !(Canvas365.days[id].loop);
};

Canvas365.loop = function(){
    Object.keys(Canvas365.days).forEach(function(id){
        var day = Canvas365.days[id];
        if(day.loop){
            day.main(day.ctx);
        }
    });
    window.requestAnimFrame(Canvas365.loop);
};

window.onload = function(){
    var tags = document.querySelectorAll('canvas');
    Array.prototype.slice.call(tags).forEach(function(el){
        var id = el.id.substring(3);
        el.addEventListener('click', Canvas365.startStop, false);
        Canvas365.contexts[id] = el.getContext('2d');
        Canvas365.loadDay(id);
    });
    
    Canvas365.loop();
};

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function( callback ){
                window.setTimeout(callback, 1000 / 60);
            };
})(); 
