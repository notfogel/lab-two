//begin da script when window loads
window.onload = setMap();

//set up a choropleth map
function setMap(){
    //use Promise.all to parallelize asynchronous data loading
    var promises = [d3.csv("data/lab2_quant_data.csv"),                    
                    d3.json("data/madison_neighborhood_polygonz.topojson")                   
    ];    
    Promise.all(promises).then(callback);

    function callback(data){
        var csvData = data[0],
            madtown = data[1];
        var neighborhoodz = topojson.feature(madtown, madtown.objects.madison_neighborhood_polygonz);    
        console.log(csvData);
        console.log(neighborhoodz);
    }
};
