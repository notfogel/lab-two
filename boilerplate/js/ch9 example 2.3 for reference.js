//Example 1.5 line 1
function callback(data){               
    
    ///...
       //translate europe TopoJSON
       var europeCountries = topojson.feature(europe, europe.objects.EuropeCountries),
           franceRegions = topojson.feature(france, france.objects.FranceRegions).features;

       //add Europe countries to map
       var countries = map.append("path")
           .datum(europeCountries)
           .attr("class", "countries")
           .attr("d", path);

       //add France regions to map
       var regions = map.selectAll(".regions")
           .data(franceRegions)
           .enter()
           .append("path")
           .attr("class", function(d){
               return "regions " + d.properties.adm1_code;
           })
           .attr("d", path);
};