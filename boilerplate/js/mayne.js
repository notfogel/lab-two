//begin da script when window loads
window.onload = setMap();

//set up a choropleth map
function setMap(){
    
    //map frame dimensions
    var width = 860,
        height = 550;

    //create new svg container for the map!!!! woooohoooo0ooo I LOVE SCALABLE VECTOR GRAPHICS!!!!!
    var map = d3.select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

        
    //create Albers equal area conic projection centered on Madison!
    var projection = d3.geoAlbers()
        .center([0, 43.073280])
        .rotate([89.395, 0, 0]) //yeah no shit ARE YOU FUCKING KIDDING ME 
        .parallels([33, 53]) 
        .scale(1100000) //higher number good for me since my scale is real small (it's just Madison after all!)
        //I thought maybe scale needed to be way higher bc stuff wasn't showing up and dimensions seemed small when inspecting
        //however, no matter how high I made the number, the map still did not show up (dimensions did change tho which is good)
        .translate([width/2, height/2]); //"Keep these as one-half the <svg> width and height to keep your map centered in the container."
    

    var path = d3.geoPath()
        .projection(projection);


    //use Promise.all to parallelize asynchronous data loading (ok this block seems redundant for sure lol FUCK)
    var promises = [d3.csv("data/lab2_quant_data.csv"),                    
                    d3.json("data/madison_city_limit.topojson"),
                    d3.json("data/madison_neighborhood_polygonz.topojson"),
                    d3.json("data/madison_water.topojson"),     
    ];    
    Promise.all(promises).then(callback); 

    function callback(data){
        var csvData = data[0],
            madtown = data[1],
            campus = data[2],
            water = data[3];
        
        console.log(csvData)
        console.log(campus)
        //translate the topojsons to geojson (waste of time alert)
        var madisonBoundariez = topojson.feature(madtown, madtown.objects.madison_city_limit),
            madisonNeighborhoodz = topojson.feature(campus, campus.objects.madison_neighborhood_polygonz).features,
            madisonWater = topojson.feature(water, water.objects.madison_water);
        
        //varz for data join
        var attrArray = ["Count","Percent of total", "Percent white", "Percent nonwhite", "Percent house", "Percent apartment"];

        //loop thru csv to assign each set of csv attributes to a geojson neighborhood
        for(var i=0; i<csvData.length; i++){
            var csvNeighborhood = csvData[i]; //current neighborhood
            var csvKey = csvNeighborhood.id;
            //(this should b fun) loop thru geojson neighborhoodz to find the current one
            for(var a=0; a<madisonNeighborhoodz.length; a++){

                var geojsonProps = madisonNeighborhoodz[a].properties; //the current geojson properties
                var geojsonKey = geojsonProps.id; //the geojson primary key

                //where primary keyz match, transfer csv data to geojson properties object 
                if(geojsonKey==csvKey){

                    //assign all attributes & values
                    attrArray.forEach(function(attr){
                        var val = parseFloat(csvNeighborhood[attr]); //cop that csv attr value
                        geojsonProps[attr] = val; //assign attribute & value to geojson properties
                    });
                };
            };
        };
        console.log(madisonNeighborhoodz)
        //add madison's city limitz to the map
        var cityLimitz = map.append("path")
            .datum(madisonBoundariez)
            .attr("class", "cityLimitz")
            .attr("d", path);
        //let's see if I can add water all by myself
        var lakez = map.append("path")
            .datum(madisonWater)
            .attr("class", "lakez")
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
