// grouped bar chart code modified from https://bl.ocks.org/bricedev/0d95074b6d83a77dc3ad

var margin = {top: 20, right: 20, bottom: 30, left: 40}, //set css values for svg
        width = 1200 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

// width function for grouped bar chart bars
var x0 = d3.scale.ordinal()
        .rangeRoundBands([0, width], .2);

// name position scale function
var x1 = d3.scale.ordinal();

// axis scale function
var y = d3.scale.linear()
        .range([height, 0]);

// creates x axis
var xAxis = d3.svg.axis()
        .scale(x0)
        .tickSize(0)
        .orient("bottom");

// creates y axis
var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

// sets the colors to use for the bar chart
var color = d3.scale.ordinal()
        .range(["#ca0020","#ff7f68", "#ffc2b7"]);

// adds svg and change its width/height
var barSVG = d3.select('#container_bar') 
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// load the base json and the data csvs
d3.json("california-counties.json", function(json) { 
    d3.csv("prop-51-2016-trump.csv", function(csv51){ 
        d3.csv("prop-30-2012-trump.csv", function(csv30){ 
            d3.csv("prop-1D-2006-trump.csv", function(csv1D){ 

                var allData = [];
                for (var i = 0; i < csv51.length; i++) {
                    // get the name and percent values from the csvs
                    var csvCountyName = csv51[i].name;
                    var csv51Percent = csv51[i].yes;
                    var csv30Percent = csv30[i].yes;
                    var csv1DPercent = csv1D[i].yes;
                    
                    // find the corresponding county inside the GeoJSON
					for (var j = 0; j < json.features.length; j++)  {
                        json.features[j].properties.values = [];

                        var jsonCountyName = json.features[j].properties.name;
                        if (csvCountyName == jsonCountyName) {
                            allData.push(
                                {countyName: json.features[j].properties.name, values: []});
                            allData[allData.length - 1].values.push(
                                {value: stringPercentToNum(csv51Percent), 
                                    propName: "Prop 51, 2016"});
                            allData[allData.length - 1].values.push(
                                {value: stringPercentToNum(csv30Percent), 
                                    propName: "Prop 30, 2012"});
                            allData[allData.length - 1].values.push(
                                {value: stringPercentToNum(csv1DPercent), 
                                    propName: "Prop 1D, 2006"});
                                    // percent30: , 
                                    // percent1D: stringPercentToNum(csv1DPercent)});
                        }
                    }
                }
                console.log("alldata");
                console.log(allData);
                console.log("test json");
                console.log(json);

                
                var propData = json.features;
                console.log(propData);
                
                var countyNames = allData.map(function(d) { return d.countyName; });
                console.log("catNames");
                console.log(countyNames);
                var propNames = allData[0].values.map(function(d) { return d.propName; });
                console.log("propnames");
                console.log(propNames);

                x0.domain(countyNames);
                x1.domain(propNames).rangeRoundBands([0, x0.rangeBand()]);
                y.domain([0, 100]);

                // add text names to the axises
                barSVG.append("g")
                        .attr("class", "x axis")
                        .attr("id", "x-axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis);

                barSVG.append("g")
                        .attr("class", "y axis")
                        .style('opacity','0')
                        .call(yAxis)
                .append("text")
                        .attr("transform", "rotate(-90)")
                        .attr("y", 6)
                        .attr("dy", ".71em")
                        .style("text-anchor", "end")
                        .style('font-weight','bold')
                        .text("Percent (%)");

                // set smooth intro transition for y axis
                barSVG.select('.y').transition().duration(0).delay(0).style('opacity','1');

                barSVG.append("line")
                    .style("stroke", "black")
                    .style("stroke-dasharray", ("3, 3"))
                    .attr("x1", "0")
                    .attr("y1", "226")
                    .attr("x2", "1550")
                    .attr("y2", "226");

                // create bar (slice) svgs based on data values
                var slice = barSVG.selectAll(".slice")
                        .data(allData)
                        .enter().append("g")
                        .attr("class", "g")
                        .attr("transform",function(d) { return "translate(" + x0(d.countyName) + ",0)"; });

                // size bars based on data vals
                slice.selectAll("rect")
                        .data(function(d) { return d.values; })
                .enter().append("rect")
                        .attr("width", x1.rangeBand())
                        .attr("x", function(d) { 
                            console.log()
                            // return x1(d3.text(d.propName).attr("font-size", "6px"));
                            return x1(d.propName); 
                        })
                        .style("font-size", "6px")
                        .style("fill", function(d) { return color(d.propName) })
                        .attr("y", function(d) { return y(0); })
                        .attr("height", function(d) { return height - y(0); })
                        .on("mouseover", function(d) {
                                d3.select(this).style("fill", d3.rgb(color(d.propName)).darker(2));
                        })
                        .on("mouseout", function(d) {
                                d3.select(this).style("fill", color(d.propName));
                        });

                // create bar transitions
                slice.selectAll("rect")
                        .transition()
                        .delay(function (d) {return Math.random()*1000;})
                        .duration(1000)
                        .attr("y", function(d) { return y(d.value); })
                        .attr("height", function(d) { return height - y(d.value); });

                //Legend
                var legend = barSVG.selectAll(".legend")
                        .data(allData[0].values.map(function(d) { return d.propName; }))
                .enter().append("g")
                        .attr("class", "legend")
                        .attr("transform", function(d,i) { return "translate(0," + i * 20 + ")"; })
                        .style("opacity","0");

                legend.append("rect")
                        .attr("x", width - 18)
                        .attr("width", 18)
                        .attr("height", 18)
                        .style("fill", function(d) { return color(d); });
                
                // create legend for grouped bar chart
                legend.append("text")
                        .attr("x", width - 24)
                        .attr("y", 9)
                        .attr("dy", ".35em")
                        .style("text-anchor", "end")
                        .text(function(d) {return d; });

                // add intro transition for legend
                legend.transition().duration(0).delay(0).style("opacity","1");

            });
        });
    });
});