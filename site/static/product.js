(function() {
  var Data = [];

  var margin = { top: 20, right: 20, bottom: 30, left: 50 };
  var width = 680 - margin.left - margin.right;
  var height = 200 - margin.top - margin.bottom;

  var parseDate = d3.time.format('%Y-%m-%d').parse;

  var x = d3.time.scale().range([0, width]);
  var y = d3.scale.linear().range([height, 0]);
  var color = d3.scale.category10();

  var xAxis = d3.svg.axis()
    .scale(x)
    .orient('bottom');

  var yAxis = d3.svg.axis()
    .scale(y)
    .orient('left');

  var line = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.sales); });

  var svg = d3.select('body').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,'+height+')');

  svg.append('g')
    .attr('class', 'y axis');

  var render = function() {
    data = Data;
    color.domain(d3.range(data.length));
    x.domain([
      d3.min(data, function(d) {
        return d3.min(d['sales-day'], function(s) { return s.date; });
      }),
      d3.max(data, function(d) {
        return d3.max(d['sales-day'], function(s) { return s.date; });
      })
    ]);

    y.domain([
      d3.min(data, function(d) {
        return d3.min(d['sales-day'], function(s) { return s.sales; });
      }),
      d3.max(data, function(d) {
        return d3.max(d['sales-day'], function(s) { return s.sales; });
      })
    ]);

    d3.transition(svg).select('.x.axis').call(xAxis);
    d3.transition(svg).select('.y.axis').call(yAxis);

    var g = svg.selectAll('.wtf')
        .data(data)
      .enter().append('g')
        .attr('class', 'wtf');

    g.append('path')
      .attr('class', 'line')
      .attr('d', function(d) { return line(d['sales-day']); })
      .style('stroke', function(d, i) { return color(i); });
  };

  var load = function(opts, callback) {
    var req = new XMLHttpRequest();
    var params = _.map(opts, function(v, k) {
      return k + '=' + v;
    });

    req.open('GET', 'api/product/?' + params.join('&'));
    req.onload = function() {
      var data = JSON.parse(this.responseText);
      data.forEach(function(d) {
        d.date = parseDate(d.date);
      });

      callback(data);
    };
    req.send();
  };

  var loadDataFor = function(opts) {
    opts = opts || {};
    opts.color = opts.color || '*';
    opts.size = opts.size || '*';
    opts.store = opts.store || '*';
    load(opts, function(d) {
      opts['sales-day'] = d;
      addData(opts);
      render();
    });
  };

  var addData = function(d) {
    var exists = _.find(Data, function(item) {
      return item.color === d.color &&
             item.size === d.size &&
             item.store == d.store;
    });

    if (exists) exists['sales-day'] = d['sales-day'];
    else Data.push(d);
  };

  var adjust = function() {
    _.each(filter, function(list, key) {
      _.each(list, function(v) {
        var opts = {};
        opts[key] = v;
        loadDataFor(opts);
      });
    });
  };

  var StoreFilter = function(opts) {
    this.el = opts.el;

    var labels = d3.select(this.el).selectAll('label')
      .data(opts.stores);

    labels.enter().append('label');
    labels.exit().remove();

    this.inputs = labels.append('input')
      .attr('type', 'checkbox')
      .on('change', _.bind(this.changeHandler, this));
    labels.append('span').text(String)
  };

  StoreFilter.prototype.changeHandler = function() {
    var values = this.inputs.filter(':checked').data();
    filter.stores = values;
    adjust();
  };

  var ProductFilter = function(opts) {
    this.el = opts.el;
    this.params = opts.params;
    this.render();
  };

  ProductFilter.prototype = {
    render: function() {
      var keys = this.params.map(function(p) { return p.key; });
      keys.unshift('none');
      var labels = d3.select(this.el).selectAll('label').data(keys);
      labels.enter().append('label');
      labels.exit().remove();

      this.inputs = labels.append('input')
        .attr('type', 'radio')
        .attr('name', 'blah')
        .on('change', _.bind(this.changeHandler, this));
      labels.append('span').text(String);
    },

    changeHandler: function() {
      var value = this.inputs.filter(':checked').data()[0];
      var filter = {};

      this.params.forEach(function(p) {

      });
    }
  };

  var filter = {};

  new ProductFilter({
    el: document.querySelector('.store-filter'),
    params: [
      { key: 'stores', value: ['web', 'Los Angeles', 'New York', 'Honolulu'] },
      { key: 'colors', value: ['red', 'yellow', 'blue'] },
      { key: 'sizes', value: ['small', 'medium', 'large'] }
    ],
    allowCombinations: false
  });

  loadDataFor();
})();
