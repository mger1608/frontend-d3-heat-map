const dataUrl = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
fetch(dataUrl)
  .then(response => response.json())
  .then(json => {
    const dataset = json.monthlyVariance;
    const baseTemp = 8.66;

    // Dynamic dimensions
    const w = window.innerWidth - 40;
    const h = window.innerHeight - 100;
    const padding = 60;

    const years = d3.extent(dataset, d => d.year);
    const xScale = d3.scaleLinear()
      .domain([years[0], years[1]])
      .range([padding, w - padding]);

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const yScale = d3.scaleBand()
      .domain(monthNames)
      .range([padding, h - padding]);

    const svg = d3.select("body")
      .append("svg")
      .attr("width", w)
      .attr("height", h);

    // Color scale
    const actualTemps = dataset.map(d => baseTemp + d.variance);
    const minTemp = d3.min(actualTemps);
    const maxTemp = d3.max(actualTemps);
    const colorScale = d3.scaleSequential(t => d3.interpolateRdBu(1 - t))
      .domain([minTemp, maxTemp]);

    // Heatmap cells
    svg.selectAll("rect")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", d => xScale(d.year))
      .attr("y", d => yScale(monthNames[d.month - 1]))
      .attr("width", (w - 2 * padding) / (years[1] - years[0] + 1))
      .attr("height", yScale.bandwidth())
      .attr("data-month", d => d.month)
      .attr("data-year", d => d.year)
      .attr("data-temp", d => baseTemp + d.variance)
      .attr("fill", d => colorScale(baseTemp + d.variance))
      .on("mouseover", function(event, d) {
        const actualTemp = baseTemp + d.variance;
        d3.select("#tooltip")
          .style("visibility", "visible")
          .html(`${d.year} - ${monthNames[d.month - 1]}<br>${actualTemp.toFixed(2)}°C<br>${d.variance.toFixed(2)}°C`)
          .attr("data-year", d.year)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function() {
        d3.select("#tooltip")
          .style("visibility", "hidden");
      });

    // Axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
      .attr("id", "x-axis")
      .attr("transform", `translate(0, ${h - padding})`)
      .call(xAxis);

    svg.append("g")
      .attr("id", "y-axis")
      .attr("transform", `translate(${padding}, 0)`)
      .call(yAxis);

    // Axis titles
    svg.append("text")
      .attr("x", w / 2)
      .attr("y", h - 20)
      .attr("text-anchor", "middle")
      .text("Years")
      .style("font-size", "12px")
      .style("fill", "#666");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -h / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .text("Months")
      .style("font-size", "12px")
      .style("fill", "#666");

    // Legend
    const numLegendPoints = 6;
    const legendTemps = d3.range(numLegendPoints)
      .map(i => minTemp + i * (maxTemp - minTemp) / (numLegendPoints - 1));
    const legendData = legendTemps.map(temp => ({
      color: colorScale(temp),
      temp: temp.toFixed(2)
    }));

    const legend = svg.append("g")
      .attr("id", "legend")
      .attr("transform", `translate(${(w - (legendData.length * 50)) / 2}, ${h - padding + 40})`);

    legendData.forEach((d, i) => {
      legend.append("rect")
        .attr("x", i * 50)
        .attr("y", 0)
        .attr("width", 40)
        .attr("height", 20)
        .attr("fill", d.color);

      legend.append("text")
        .attr("x", i * 50 + 20)
        .attr("y", 35)
        .attr("text-anchor", "middle")
        .text(`${d.temp}°C`)
        .style("font-size", "12px")
        .style("fill", "#666");
    });
  });
