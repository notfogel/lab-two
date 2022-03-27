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

//Example 2.6 line 3
var circles = container.selectAll(".circles") //create an empty selection
    .data(cityPop) //here we feed in an array
    .enter() //one of the great mysteries of the universe
    .append("circle") //inspect the HTML--holy crap, there's some circles there
    .attr("class", "circles")
    .attr("id", function(d){
        return d.city;
    })
    .attr("r", function(d){
        //calculate the radius based on population value as circle area
        var area = d.population * 0.01;
        return Math.sqrt(area/Math.PI);
    })
    .attr("cx", function(d, i){
        //use the index to place each circle horizontally
        return 90 + (i * 180);
    })
    .attr("cy", function(d){
        //subtract value from 450 to "grow" circles up from the bottom instead of down from the top of the SVG
        return 450 - (d.population * 0.0005);
    });