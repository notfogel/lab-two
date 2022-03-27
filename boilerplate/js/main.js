//SVG dimension variables
var w = 900, h = 500;
var dataArray = [10, 20, 30, 40, 50];
var cityPop = [
    { 
        city: 'Madison',
        population: 233209
    },
    {
        city: 'Milwaukee',
        population: 594833
    },
    {
        city: 'Green Bay',
        population: 104057
    },
    {
        city: 'Superior',
        population: 27244
    }
];
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

    var circles = container.selectAll(".circles") //ay dios mio! todavia no hay circulos!
        .data(cityPop) //here we feed in an array
        .enter() //one of the great mysteries of the universe (???)
        .append("circle") //add a circle for each datum
        .attr("class", "circles") //apply a class name to all circles
        .attr("id",function(d){ 
            return d.city;
        })
        .attr("r",function(d){ //calcul8 radii based on popn values
            var area = d.population*0.01;
            return Math.sqrt(area/Math.PI);
        })
        .attr("cx",function(d,i){ //xcoordinate
            //use index to place each birble horizontally
            return 90 + (i*180);
        })
        .attr("cy",function(d){ //ycoordin8
            //subtracc value from 450 to grow birbles up from the btm up
            return 450 - (d.population*0.0005);
        });
    
};