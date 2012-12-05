/*
     Original code under Copyright 2011, Kai Chang

     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at

         http://www.apache.org/licenses/LICENSE-2.0

     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
*/

$(function() {

    var dimensions  = new Filter();
    var highlighter = new Selector();

    // get the data
    var sols = JSON.parse($("#sols").val());

    dimensions.set({data: sols});

    var columns   = _(sols[0]).keys();
    var axes      = _(columns).without('ID');
    var solutions = [];
    var colors    = {};

    _(sols).each(function(sol) {
      solutions.push(sol.ID);
    });

    //https://groups.google.com/forum/?fromgroups=#!topic/d3-js/CdNdLuIJL0s
    var total = solutions.length;
    //var colormap_colors = ["red", "orange", "yellow", "green", "blue", "violet"];
    //var scale = d3.scale.linear()
      //.domain([0, colormap_colors.length - 1])
      //.range(d3.extent(solutions, function(d) { return d.snr3; }));
    //var colormap = d3.scale.linear()
      //.domain(d3.range(colormap_colors.length).map(scale))
      //.range(colormap_colors);
    var colormap = d3.scale.linear()
        .domain([-1,0,1])
        .range(["red", "green", "blue"]);

    // create colormap and legend
    var idx = 0;
    _(solutions).each(function(id) {
      colors[id] = colormap(idx/total - 1);
      idx += 1;
      $('#legend').append("<div class='item'><div class='color' style='background: " + colors[id] + "';></div><div class='key'> id: " + id + "</div></div>");
    });



    // display parallel coordinate plot
    var pc = parallel(dimensions, colors);
    $('#parallel').css({
        height: "600px",
        width: "1100px" //$(window).width() + 'px'
    });
    pc.render();

    // .. and data grid
    var slicky = new grid({
      model: dimensions,
      selector: highlighter,
      width: $('body').width(),
      columns: columns
    });
    slicky.update();



    dimensions.bind('change:filtered', function() {
      var data = dimensions.get('data');
      var filtered = dimensions.get('filtered');
      var data_size = _(data).size();
      var filtered_size = _(filtered).size();
      totals.update([filtered_size, data_size - filtered_size]);

      var opacity = _([2/Math.pow(filtered_size,0.37), 100]).min();
      $('#line_opacity').val(opacity).change();
    });

    highlighter.bind('change:selected', function() {
      var highlighted = this.get('selected');
      pc.highlight(highlighted);
    });

    $('#remove_selected').click(function() {
      dimensions.outliers();
      pc.update(dimensions.get('data'));
      pc.render();
      dimensions.trigger('change:filtered');
      return false;
    });

    $('#keep_selected').click(function() {
      dimensions.inliers();
      pc.update(dimensions.get('data'));
      pc.render();
      dimensions.trigger('change:filtered');
      return false;
    });

    $('#export_selected').click(function() {
      var data = dimensions.get('filtered');
      var keys = _.keys(data[0]);
      var csv = _(keys).map(function(d) { return '"' + addslashes(d) + '"'; }).join(",");
      _(data).each(function(row) {
        csv += "\n";
        csv += _(keys).map(function(k) {
          var val = row[k];
          if (_.isString(val)) {
            return '"' + addslashes(val) + '"';
          }
          if (_.isNumber(val)) {
            return val;
          }
          if (_.isNull(val)) {
            return "";
          }
        }).join(",");
      });
      var uriContent = "data:application/octet-stream," + encodeURIComponent(csv);
      var myWindow = window.open(uriContent, "Nutrient CSV");
      myWindow.focus();
      return false;
    });

    $('#line_opacity').change(function() {
      var val = $(this).val();
      $('#parallel .foreground path').css('stroke-opacity', val.toString());
      $('#opacity_level').html((Math.round(val*10000)/100) + "%");
    });

    $('#parallel').resize(function() {
      // vertical full screen
      pc.render();
      var val = $('#line_opacity').val();
      $('#parallel .foreground path').css('stroke-opacity', val.toString());
    });

    $('#parallel').resizable({
      handles: 's',
      resize: function () { return false; }
    });

    $('#myGrid').resizable({
      handles: 's'
    });

    function addslashes( str ) {
      return (str+'')
        .replace(/\"/g, "\"\"")        // escape double quotes
        .replace(/\0/g, "\\0");        // replace nulls with 0
    };

});

