//begin da script when window loads
window.onload = setMap();

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
        .rotate([-89.400600, 0, 0]) 
        .parallels([33, 53]) 
        .scale(5000) //"is a factor by which distances between points are multiplied, increasing or decreasing the scale of the map." 
        //will have to figure out which way to adjust the .scale lol
        .translate([width / 2, height / 2]); //"Keep these as one-half the <svg> width and height to keep your map centered in the container."
    
    var path = d3.geoPath()
        .projection(projection);


    //use Promise.all to parallelize asynchronous data loading
    var promises = [d3.csv("data/lab2_quant_data.csv"),                    
                    d3.json("data/madison_neighborhood_polygonz.topojson")                   
    ];    
    Promise.all(promises).then(callback);

    function callback(data){
        var csvData = data[0],
            madtown = data[1];
        //translate neighborhoods topojson to geojson (waste of time alert)
        var madisonNeighborhoodz = topojson.feature(madtown, madtown.objects.madison_neighborhood_polygonz);    
        
        //add madison's near-campus neighborhoodz to the map
        var neighborhoodz = map.append("path")
            .datum(madisonNeighborhoodz)
            .attr("class", "neighborhoodz")
            .attr("d", path);
        var enumeratedNeighborhoodz = map.selectAll(".neighborhoodz")
            .data(madisonNeighborhoodz)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "enumeratedNeighborhoodz " + d.properties.id; 
            })
            .attr("d", path);
    
    
    
    
    }
};
