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
            neighborhoodz = data[1];
        console.log(csvData);
        console.log(neighborhoodz);
    }
};
