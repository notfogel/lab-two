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
    var x = d3.scaleLinear() //cre8 da scale
        .range([90,810]) //output min/max
        .domain([0,3.25]) //input min/max
    //find minval of array:
    var minPop = d3.min(cityPop,function(d){
        return d.population;
    });
    //find array's max val:
    var maxPop = d3.max(cityPop,function(d){
        return d.population;
    });
    //scale for birbles center y coordin8
    var y = d3.scaleLinear()
        .range([450,50])
        .domain([0,700000]);
    var color = d3.scaleLinear()
        .range([
            "#FDBE85",
            "#D94701"
        ])
        .domain([
            minPop, 
            maxPop
        ]);            
        
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
            //use scale gener8or w/ da index to place each birble horizontally
            return x(i);
        })
        .attr("cy",function(d){ //ycoordin8
            //subtracc value from 450 to grow birbles up from the btm up
            return y(d.population);
        })
        .style("fill",function(d,i){
            return color(d.population)
        })
        .style("stroke","#000") //birble stroke = black
    var yAxis = d3.axisLeft(y); //creates y axis
    var axis = container.append("g") //cre8 axis g elmt & add axis
        .attr("class","axis")
        .attr("transform","translate(50,0)") //makes the axis actually visible w/in the svg by pushing it to the right 50px
        .call(yAxis);
    //create a text element     
    var title = container.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("x", 450)
        .attr("y", 30)
        .text("City Populations");
    var labels = container.selectAll(".labels") //create labels for the cities
        .data(cityPop)
        .enter()
        .append("text")
        .attr("class","labels")
        .attr("text-anchor","left")
        .attr("y",function(d){
            //vert position centered on each birble
            return y(d.population) - 3; //used minus 3 bc superior's label was hugging the border
        });
    var nameLine = labels.append("tspan") //fixing superior's off-graphedness: name line
        .attr("class","nameLine")
        .attr("x",function(d,i){
            //horiz position to the right of each birble
            return x(i) + Math.sqrt(d.population*0.01/Math.PI) +5;
        })
        .text(function(d){
            return d.city;
        });
    var format = d3.format(",");
    var popLine = labels.append("tspan") //fixing superior's off-graphedness: popn line
        .attr("class","popLine")
        .attr("x",function(d,i){
            //horiz position right of burble once more
            return x(i) + Math.sqrt(d.population*0.01/Math.PI) +5;
        })
        .attr("dy","15")//vert offset
        .text(function(d){
            return "Pop. " + format(d.population);
        });
};