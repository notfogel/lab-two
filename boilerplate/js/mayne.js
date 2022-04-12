//1st line should be an anonymous fxn containing everything else I guess!    
(function(){    

    //pseudo-global variables
    //varz for data join (update these as I update the csv)
    var attrArray = ["Count","Percent_of_total", "Percent_white", "Percent_nonwhite", "Percent_house", "Percent_apartment"];
    var expressed = attrArray[0]; //initial attribute
    //begin da script when window loads
    window.onload = setMap();

    //set up a choropleth map
    function setMap(){
        
        //map frame dimensions 
        var width = window.innerWidth * 0.5,
            height = 460;

        //create new svg container for the map!!!! woooohoooo0ooo I LOVE SCALABLE VECTOR GRAPHICS!!!!!
        var map = d3.select("body")
            .append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height);

            
        //create Albers equal area conic projection centered on Madison!
        var projection = d3.geoAlbers()
            .center([0, 43.071])
            .rotate([89.399, 0, 0])  
            .parallels([33, 53]) 
            .scale(950000) 
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
            
            //console.log(csvData)
            //console.log(campus)
            
            //translate the topojsons to geojson (waste of time alert)
            var madisonBoundariez = topojson.feature(madtown, madtown.objects.madison_city_limit),
                madisonNeighborhoodz = topojson.feature(campus, campus.objects.madison_neighborhood_polygonz).features,
                madisonWater = topojson.feature(water, water.objects.madison_water);
            

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
            //let's do some linkage!!
            madisonNeighborhoodz = joinData(madisonNeighborhoodz,csvData); //call joinData fxn
            console.log(madisonNeighborhoodz)

            var colorScale = makeColorScale(csvData); //call makeColorScale fxn
            
            setEnumerationUnits(madisonNeighborhoodz,map,path,colorScale); //call enumerator fxn

            setChart(csvData,colorScale); //add coordin8ed vis to the map    

        } //end of callback fxn

    }; //end of setMap

    //ok ok so let's get some colors!!
    function makeColorScale(data){
        
        var colorClasses = [
            "#D4B9DA",
            "#C994C7",
            "#DF65B0",
            "#DD1C77",
            "#980043"
        ];

        //create color scale gener8or
        var colorScale = d3.scaleThreshold()
            .range(colorClasses);

        //build array containing all values of the expressed attribute 
        var domainArray = [];
        for(var i=0; i<data.length; i++){
            var val = parseFloat(data[i][expressed]);
            domainArray.push(val);
        };
        
        //cluster data w/ ckmeans clustering algoryhthm 
        var clusters = ss.ckmeans(domainArray,5);
        console.log(clusters) //check console to see that clusters/groups were created (should be a nested array)

        //reset domain array to cluster minimums
        domainArray = clusters.map(function(d){
            return d3.min(d);
        });
        
        //remove 1st value from domain array to create class breakpts
        domainArray.shift();

        //assign array of last 4 cluster mins as domain
        colorScale.domain(domainArray);
        
        //bring it allllll together
        return colorScale;
    }; //end of makeColorScale

    //fxn name self-explanatory: joins geoJSON data w/ csv(attr) data
    function joinData(madisonNeighborhoodz,csvData){
        //loop thru csv to assign each set of csv attributes to a geojson neighborhood
        for (var i = 0; i < csvData.length; i++) {
            var csvNeighborhood = csvData[i]; //current neighborhood
            var csvKey = csvNeighborhood.id;
            //(this should b fun) loop thru geojson neighborhoodz to find the current one
            for (var a = 0; a < madisonNeighborhoodz.length; a++) {

                var geojsonProps = madisonNeighborhoodz[a].properties; //the current geojson properties
                var geojsonKey = geojsonProps.id; //the geojson primary key

                //where primary keyz match, transfer csv data to geojson properties object 
                if (geojsonKey == csvKey) {

                    //assign all attributes & values
                    attrArray.forEach(function (attr) {
                        var val = parseFloat(csvNeighborhood[attr]); //cop that csv attr value
                        geojsonProps[attr] = val; //assign attribute & value to geojson properties
                    });
                };
            };
        };
        return madisonNeighborhoodz;    
    };//end of joinData (which doesn't work yet! need 2 figure out where/how it gets called)
    
    function setEnumerationUnits(madisonNeighborhoodz,map,path,colorScale){ //fxn name self explanatory
        //add near-campus neighborhoodz to said map
        var neighborhoodz = map.selectAll(".neighborhoodz")
            .data(madisonNeighborhoodz)
            .enter()
            .append("path")
            .attr("class", function (d) {
                return "neighborhoodz " + d.properties.id; 
            })
            .attr("d", path)
            .style("fill",function(d){ //populates the enumeration units with their choropleth appropri8 colorz! 
                var value = d.properties[expressed];
                if(value){
                    return colorScale(d.properties[expressed]);    
                } else{
                    return "#ccc";
                }
            });
    };

    function setChart(csvData,colorScale){
        //chart frame dimensions:
        var chartWidth = window.innerWidth * 0.425,
            chartHeight = 460;

        //create a 2nd svg elmt for the chart
        var chart = d3.select("body")
            .append("svg")
            .attr("width",chartWidth)
            .attr("height",chartHeight)
            .attr("class","chart");    
    }

})(); //end of anonymous wrapper fxn
//hey it's jasper, not even a wrapper, only on this script to make my racks load faster