//1st line should be an anonymous fxn containing everything else I guess!    
(function(){    

    //pseudo-global variables!!!!!!!!!!!!!
    //varz for data join (update these as I update the csv)
    var attrArray = ["Number_of_students","Percent_of_total", "Percent_white", "Percent_nonwhite", "Percent_house", "Percent_apartment"];
    //var formatted_attrArray = []; //formatting thing is a work in progress, don't need it to turn activity 10 in, just making note
    //console.log(attrArray.length)
    /* trying to get it to rip the underscores out without splitting at spaces for displaying above chart -- incomplete
    for(i=0;i<attrArray.length;i++){
        formatted_attrArray.push(attrArray[i].replace("_"," "))
        console.log(formatted_attrArray)

    }; */
    //pseudo-global varz cont.
    //chart frame dimensions:
    var chartWidth = window.innerWidth * 0.425,
        chartHeight = 460;
    //cre8 scale which sizes the bars proportionally to frame
    var yScale = d3.scaleLinear()
        .range([0, chartHeight])
        .domain([0, 105]);

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

            createDropdown(csvData);
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

        //create a 2nd svg elmt for the chart
        var chart = d3.select("body")
            .append("svg")
            .attr("width",chartWidth)
            .attr("height",chartHeight)
            .attr("class","chart");    

        //set bars for each neighborhood
        var bars = chart.selectAll(".bars")
            .data(csvData)
            .enter()
            .append("rect")
            .sort(function(a,b){ //sorts the bars from greatest to least
                return b[expressed] - a[expressed] //to change sorting order, switch a&b
            })
            .attr("class",function(d){
                return "bars " + d.id;
            })
            .attr("width",chartWidth/csvData.length - 1)
            .attr("x", function(d,i){ //sets bars to the right of the prev bar
                return i * (chartWidth/csvData.length);
            })
            .attr("height",function(d){
                return yScale(parseFloat(d[expressed]));
            })
            .attr("y",function(d){ //this fxn prevents the bars from growing from the top
                return chartHeight - yScale(parseFloat(d[expressed]))
            })
            .style("fill",function(d){
                return colorScale(d[expressed]); 
            }); 
            
        //annot8 barz w/ attvalue text (yay!!!!!!)
        //keep an eye on the structure of this code when trying to implement lake labels for map (other things too probably)
        var numbers = chart.selectAll(".numbers")
            .data(csvData)
            .enter()
            .append("text")
            .sort(function(a,b){
                return b[expressed] - a[expressed]
            })
            .attr("class",function(d){
                return "numbers " + d.id;
            })
            .attr("text-anchor", "middle")
            .attr("x",function(d,i){
                var fraction = chartWidth/csvData.length
                return i * fraction + (fraction-1)/2;
            })
            .attr("y",function(d){
                return chartHeight - yScale(parseFloat(d[expressed])) + 15;
            })
            .text(function(d){
                return d[expressed];
            });

        //create text elmt for chart title
        var chartTitle = chart.append("text")
            .attr("x",20)
            .attr("y",40)
            .attr("class","chartTitle")
            .text("Number of LGBTQ+-identifying students " + " in each neighborhood"); //fix this line later (it's kinda hardcoded)
            //gonna require a little csv doctoring AND then re-harmonizing
            console.log(expressed)
        

    }; //end of setChart
    
    //out here creating a dropdown menu!!!!!!!!!!!!!!
    function createDropdown(csvData){
        var dropdown = d3.select("body") //add select element 
            .append("select")
            .attr("class","dropdown")
            .on("change",function(){
                changeAttribute(this.value,csvData)
            });
        
        var titleOption = dropdown.append("option") //add initial option
            .attr("class","titleOption")
            .attr("disabled","true")
            .text("Select attribute!"); //this maybe sounds awkward in context, so uh, maybe change later

        var attrOptions = dropdown.selectAll("attrOptions")
            .data(attrArray)
            .enter()
            .append("option")
            .attr("value",function(d){ return d })
            .text(function(d){ return d});   
    };//end of createDropdown

    //make that dropdown menu actually do some shit!!!!
    function changeAttribute(attribute,csvData) {
        expressed = attribute; //change the expressed attribute

        var colorScale = makeColorScale(csvData); //recre8 color scale

        var neighborhoodz = d3.selectAll(".neighborhoodz")
            .transition() //add animation
            .duration(1000) //set animation settings or whartever
            .style("fill",function(d){
                var value = d.properties[expressed];
                if (value){
                    return colorScale(d.properties[expressed])
                }else{
                    return "#ccc";
                }
        });
        //sort,resize,&recolor barz
        var bars = d3.selectAll(".bars")
            .sort(function(a,b){
                return b[expressed] - a[expressed];
            })
            .transition() //add animation
            .delay(function(d,i){ //add cutesy delay 
                return i * 20
            })
            .duration(500) //set transition animation duration or whateva
            .attr("x",function(d,i){
                return i * (chartWidth/csvData.length) 
            })
            .attr("height",function(d){
                return yScale(parseFloat(d[expressed]));
            })
            .attr("y",function(d){ //this fxn prevents the bars from growing from the top
                return chartHeight - yScale(parseFloat(d[expressed]))
            })
            .style("fill",function(d){
                var value = d[expressed];
                if(value){
                    return colorScale(value);
                }else{
                    return "#ccc";
                }
            }); 
            
    }; //end of changeAttribute

 
})(); //end of anonymous wrapper fxn
//hey it's jasper, not even a wrapper, only on this script to make my racks load faster