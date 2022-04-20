//1st line should be an anonymous fxn containing everything else I guess!    
(function(){    

    //pseudo-global variables!!!!!!!!!!!!!
    //varz for data join (update these as I update the csv)
    var attrArray = ["Number_of_students","Percent_of_total", "Percent_white", "Percent_nonwhite", "Percent_house", "Percent_apartment","Percent_first_year_students","Percent_second_year_students","Percent_third_year_students","Percent_fourth_year_students","Percent_fifth_year_students","Percent_grad_students","Percent_strongly_agree:_My_Neighborhood_feels_LGBTQ+_Inclusive","Percent_agree:_My_Neighborhood_feels_LGBTQ+_Inclusive","Percent_Neither_agree_nor_disagree:_My_Neighborhood_feels_LGBTQ+_Inclusive","Percent_disagree:_My_Neighborhood_feels_LGBTQ+_Inclusive","Percent_strongly_disagree:_My_Neighborhood_feels_LGBTQ+_Inclusive","Percent_strongly_agree:_My_Neighborhood_could_be_more_LGBTQ+_Inclusive","Percent_agree:_My_Neighborhood_could_be_more_LGBTQ+_Inclusive","Percent_neither_agree_nor_disagree:_My_Neighborhood_could_be_more_LGBTQ+_Inclusive","Percent_disagree:_My_Neighborhood_could_be_more_LGBTQ+_Inclusive","Percent_strongly_disagree:_My_Neighborhood_could_be_more_LGBTQ+_Inclusive","percent_bi","percent_gay","percent_queer","percent_lesbian","percent_pan","percent_nonbinary","percent_GNC","percent_demi","percent_trans","percent_ace","percent_closeted","percent_genderqueer","percent_het","percent_polysexual","percent_bicurious","percent_questioning","percent_intersex","percent_otherIdentity","percent_preferNotToSay_identity","percent_affordability","percent_proximity","percent_friends","percent_senseOfCmty","percent_likeminded","percent_org","percent_facilities","percent_GIH","percent_otherReason"];
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
        chartHeight = 460, //maybe switch to 473
        leftPadding = 50,
        rightPadding = 2,
        topBottomPadding = 5,
        chartInnerWidth = chartWidth - leftPadding - rightPadding,
        chartInnerHeight = chartHeight - topBottomPadding * 2,
        translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

    //cre8 scale which sizes the bars proportionally to frame
    // commenting out the OG yScale but leaving its existence in tact
    var yScale = d3.scaleLinear()
        .range([chartHeight,0 ])
        .domain([0, 105]);
    /*
    var yScale = d3.scaleLinear()
        .range([463, 0])
        .domain([0, 100]);
*/
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
            
            //console.log(madisonNeighborhoodz)
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
            

            var colorScale = makeColorScale(csvData); //call makeColorScale fxn
            
            setEnumerationUnits(madisonNeighborhoodz,map,path,colorScale,projection); //call enumerator fxn

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
        //console.log(clusters) //check console to see that clusters/groups were created (should be a nested array)

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
    
    function setEnumerationUnits(madisonNeighborhoodz,map,path,colorScale,projection){ //fxn name self explanatory
        //add near-campus neighborhoodz to said map
        var neighborhoodz = map.selectAll(".neighborhoodz")
            .data(madisonNeighborhoodz)
            .enter()
            .append("path")
            .attr("class", function (d) {
                return "neighborhoodz d" + d.properties.id; 
            })
            .attr("d", path)
            .style("fill",function(d){ //populates the enumeration units with their choropleth appropri8 colorz! 
                var value = d.properties[expressed];
                if(value){
                    return colorScale(value);    
                } else{
                    return "#ccc";
                }
            })
            .on("mouseover", function(event,d) { //makes the highlighting in the highlight fxn happen
                highlight(d.properties)
                //console.log(d.properties);
                
            })
            .on("mouseout",function(event,d){ //event listener for the dehighlight fxn w/ the neighborhoodz
                dehighlight(d.properties);
            })
            .on("mousemove",moveLabel);
        //creates a desc container for the highlight event
        var desc = neighborhoodz.append("desc")
            .text('{"stroke": "#000", "stroke-width": "0.5px"}');      
            
        


        /* will do this tmrw in class, keeping commented out for now
        //create neighborhood labels!!!
        var neighborhood_labelz = map.selectAll(".neighborhood_labelz")
            .data(madisonNeighborhoodz)
            .enter()
            .append("text")
            .attr("class", function (d) {
                return "neighborhood_labelz d" + d.properties.id; 
            })
            .text(function(d){
                d.properties.id
            })
            .attr("transform",function(d){
                console.log(d.geometry.coordinates)

                var location = d.geometry.coordinates,
                    x = projection(location[0][0][0])
                    y = projection(location[0][0][1]);
                return "translate(" + x + "," + y + ")";
            }) */

    };//end of setEnumerationUnits

    function setChart(csvData,colorScale){

        //create a 2nd svg elmt for the chart
        var chart = d3.select("body")
            .append("svg")
            .attr("width",chartWidth)
            .attr("height",chartHeight)
            .attr("class","chart");    
        //create a rectangle for chart background fill
        var chartBackground = chart.append('rect')
            .attr("class", "chartBackground")
            .attr("width", chartInnerWidth)
            .attr("height", chartInnerHeight)
            .attr("transform", translate);
        //set bars for each neighborhood
        var bars = chart.selectAll(".bars")
            .data(csvData)
            .enter()
            .append("rect")
            .sort(function(a,b){ //sorts the bars from greatest to least
                return b[expressed] - a[expressed] //to change sorting order, switch a&b
            })
            .attr("class",function(d){
                return "bars d" + d.id;
            })
            /* og attributes
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
            })
            end OG attributes */
            //new attributes suited for an axis
            .attr("width", chartInnerWidth / csvData.length - 1)
            .attr("x", function(d, i){
                return i * (chartInnerWidth / csvData.length) + leftPadding;
            })
            .attr("height", function(d, i){
                return 463 - yScale(parseFloat(d[expressed]));
            })
            .attr("y", function(d, i){
                return yScale(parseFloat(d[expressed])) + topBottomPadding;
            })
            .style("fill", function(d){
                return colorScale(d[expressed]);
            })
            .on("mouseover",function(event,d){ //makes the highlight fxn for the bsars work
                highlight(d);
            })
            .on("mouseout",function(event,d){ //event listener to dehighlight the barz
                dehighlight(d);
            })
            .on("mousemove",moveLabel); 
        var desc = bars.append("desc")
            .text('{"stroke": "none", "stroke-width": "0px"}');        //annot8 barz w/ attvalue text (yay!!!!!!)
        
        //keep an eye on the structure of this code when trying to implement lake labels for map (other things too probably)
        /*
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
            }); */

        //create text elmt for chart title
        var chartTitle = chart.append("text")
            .attr("x",55)
            .attr("y",40)
            .attr("class","chartTitle")
            .text(expressed.replaceAll("_"," ") + " in each neighborhood"); //fix this line later (it's kinda hardcoded (and largely inaccurate!!!))
            //.text(function(d){ return attrArray });
            //gonna require a little csv doctoring AND then re-harmonizing
            //console.log(expressed)
        
        //create vertical axis generator
        var yAxis = d3.axisLeft().scale(yScale);

        //place axis
        var axis = chart.append("g")
            .attr("class", "axis")
            .attr("transform", translate)
            .call(yAxis);

        //create frame for chart border
        var chartFrame = chart.append("rect")
            .attr("class", "chartFrame")
            .attr("width", chartInnerWidth)
            .attr("height", chartInnerHeight)
            .attr("transform", translate);


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
            .text(function(d){ return d.replaceAll("_"," ")});   
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
            .attr("x", function(d, i){
                return i * (chartInnerWidth / csvData.length) + leftPadding;
            })
            .attr("height", function(d, i){
                return 463 - yScale(parseFloat(d[expressed]));
            })
            .attr("y", function(d, i){
                return yScale(parseFloat(d[expressed])) + topBottomPadding;
            })
            .style("fill",function(d){
                var value = d[expressed];
                if(value){
                    return colorScale(value);
                }else{
                    return "#ccc";
                }
            }); 

        var chartTitle = d3.select(".chartTitle")
            .text(expressed.replaceAll("_"," ") + " in each neighborhood");
            
    }; //end of changeAttribute

    //highlight fxn!
    function highlight(props){
        //so I think it's this d3.selectAll that's tripping me up here. but why? 
        var selected = d3.selectAll(".d" + props.id) //change stroke
            .style("stroke","blue") //blue and 2 for width are the defaults; perhaps change 
            .style("stroke-width","2");
        //.log(selected)
        setLabel(props); //calls the label fxn
    };//end of highlight fxn

    //fxn to reset the elmt style upon mouseout
    function dehighlight(props){
        var selected = d3.selectAll(".d" + props.id) 
            .style("stroke",function(){
                return getStyle(this, "stroke")
            })
            .style("stroke-width", function(){
                return getStyle(this, "stroke-width")
            });
        function getStyle(element,styleName){
            var styleText = d3.select(element)
                .select("desc")
                .text(); //sets desc to blank(?) so it's got something to reset to
            
            var styleObject = JSON.parse(styleText);

            return styleObject[styleName];
        };//end of getStyle
        //remove infoLabel
        d3.select(".infoLabel").remove();

    };//end of dehighlight fxn

    //fxn to create dynamic labels!
    function setLabel(props){
        //console.log("yo!")
        //line below this populates the label content
        

        var labelAttribute = "<h1>" + props[expressed] + "</h1><b>" + expressed + "</b>";
        //line below this creates an infoLabel div
        var infoLabel = d3.select("body")
            .append("div")
            .attr("class","infoLabel")
            .attr("id", props.id + "_label") //may have to add that d prefix to this line later
            .html(labelAttribute);
        //console.log(props)
        var neighborhoodName = infoLabel.append("div").attr("class", "neighborhoodName").html(props.Name)
        //console.log(properties)     
        };//end of setLabel

    //fxn for moving the labelz w/ mouse
    function moveLabel(){
        //get width of label
        var labelWidth = d3.select(".infoLabel")
            .node()
            .getBoundingClientRect()
            .width;
    
        //use coordinates of mousemove event to set label coordinates
        var x1 = event.clientX + 10,
            y1 = event.clientY - 75,
            x2 = event.clientX - labelWidth - 10,
            y2 = event.clientY + 25;
    
        //horizontal label coordinate, testing for overflow
        var x = event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1; 
        //vertical label coordinate, testing for overflow
        var y = event.clientY < 75 ? y2 : y1; 
    
        d3.select(".infoLabel")
            .style("left", x + "px")
            .style("top", y + "px");
    };//end of moveLabel
    
})(); //end of anonymous wrapper fxn
//hey it's jasper, not even a wrapper, only on this script to make my racks load faster