//begin da script when window loads
//window.onload = setMap();

//set up a choropleth map
function setMap(){
    
    //map frame dimensions
    var width = 960,
        height = 460;

    //create new svg container for the map!!!! woooohoooo0ooo I LOVE SCALABLE VECTOR GRAPHICS!!!!!
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //create Albers equal area conic projection centered on Madison!
    var projection = d3.geoAlbers()
        .center([0, 43.073280])
        .rotate([-89.400600, 0, 0]) //this might need to be a positive 89 for some reason but just making a note
        .parallels([33, 53]) 
        .scale(50000) //higher number good for me since my scale is real small (it's just Madison after all!)
        //I thought maybe scale needed to be way higher bc stuff wasn't showing up and dimensions seemed small when inspecting
        //however, no matter how high I made the number, the map still did not show up (dimensions did change tho which is good)
        .translate([width/2, height/2]); //"Keep these as one-half the <svg> width and height to keep your map centered in the container."
    
    //something something synchronous promises
    var promises = [];
    promises.push(d3.csv("data/lab2_quant_data.csv")); //load that csv!!!
    promises.push(d3.json("data/madison_city_limit.topojson")); //load that yung background data
    promises.push(d3.json("data/madison_neighborhood_polygonz.topojson")); //load that yung choropleth spatial data
    Promise.all(promises).then(callback); 
    //perhaps it was my failure to include this promise bloq was the reason my shit wasn't loading, and not bc of only 1 topojson
    //OH WELL I'M NOT EVEN BITTER ABOUT IT
    //or maybe this block is completely redundant and the documentation for this lab is kind of shit (that seems impossible /s)

    var path = d3.geoPath()
        .projection(projection);

/*
    //use Promise.all to parallelize asynchronous data loading (ok this block seems redundant for sure lol FUCK)
    var promises = [d3.csv("data/lab2_quant_data.csv"),                    
                    d3.json("data/madison_city_limit.topojson"),
                    d3.json("data/madison_neighborhood_polygonz.topojson")                   
    ];    
    Promise.all(promises).then(callback); */

    function callback(data){
        var csvData = data[0],
            madtown = data[1],
            campus = data[2];
        
        //translate the topojsons to geojson (waste of time alert)
        var madisonBoundariez = topojson.feature(madtown, madtown.objects.madison_city_limit),
            madisonNeighborhoodz = topojson.feature(campus, campus.objects.madison_neighborhood_polygonz).features;    
        
        
        //add madison's city limitz to the map
        var cityLimitz = map.append("path")
            .datum(madisonBoundariez)
            .attr("class", "cityLimitz")
            .attr("d", path);
        //add near-campus neighborhoodz to said map
        var neighborhoodz = map.selectAll(".neighborhoodz")
            .data(madisonNeighborhoodz)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "neighborhoodz " + d.properties.id; //I'm wondering if this ID bullshit is causing all this
                //but it shouldn't be!! both the topojson and the csv have it as a property. grrrrrrrrrrr
            }) 
            .attr("d", path);
    
    
    
    
    }
};
document.addEventListener('DOMContentLoaded',setMap)
