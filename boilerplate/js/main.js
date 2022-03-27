//SVG dimension variables
var w = 900, h = 500;

//execute script when window is loaded
window.onload = function(){
    var container = d3.select("body") //cop the <body> element from the DOM
        .append("svg") //put a new svg in the body ody ody ody ody ody ody 
        .attr("width", w) //assign  width
        .attr("height", h) //assign height
        .attr("class", "container") //always assign a class (as the block name) for styling and future selection
        .style("background-color", "rgba(0,0,0,0.2)");
    var innerRect = container.append("rect") //place a new rectangle in tha svg
        .datum(400) //a single value is a datum
        .attr("width", function(d){ //rectangle's width
            return d*2; //400*2=800
        })
        .attr("height",function(d){//rectangle's height
            return d; //should b 400
        })
        .attr("class","innerRect") //naming the class identically to the var, as is best practice
        .attr("x",50)//position from left on the x (horiz) axis i guess
        .attr("y",50)//you'll never believe what this one is
        .style("fill","#702963"); //fill color = #702963 (byzantium purple)

    console.log(innerRect);
};