(function() {

  var Product = { data: [] };

  var get = function(url, data) {
    var req = new XMLHttpRequest();
    var deferred = Q.defer();
    var params;

    if (data) {
      params = _.map(data, function(v, k) {
        return k + '=' + v;
      });
      url += '?' + params.join('&')
    }

    req.open('GET', url);
    req.onload = function() {
      if (req.status == 200) {
        deferred.resolve(JSON.parse(this.responseText));
      } else {
        deferred.reject(new Error('request failed'));
      }
    };

    req.send();
    return deferred.promise;
  };

  var setProductFilter = function(splitBy) {
    var filter = {store: '*', size: '*', color: '*'};
    var gets = [];

    if (splitBy == 'none') {
      gets.push(getProductData(filter));
    } else {
      _.each(Product.attributes[splitBy], function(val) {
        filter[splitBy] = val;
        gets.push(getProductData(filter));
      })
    }

    Q.all(gets).then(function(data) {
      render(data);
    });
  };

  var getProductAttributes = function() {
    return get('api/product/attributes');
  };

  var getProductData = function(opts) {
    var deferred = Q.defer();

    opts = opts || {};
    opts.color = opts.color || '*';
    opts.size = opts.size || '*';
    opts.store = opts.store || '*';

    get('api/product/', opts).then(
      function(data) {
        data['sales-day'].forEach(function(d) {
          d.date = parseDate(d.date);
        });
        data.filter = opts;
        deferred.resolve(data);
      },
      deferred.reject);
    return deferred.promise;
  };

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

  // render accepts something like:
  // [
  //   {
  //     filter: {
  //       store: 'los-angeles',
  //       color: '*',
  //       size: '*'
  //     },
  //     sales-day: [
  //        {
  //          date: Y-m-d
  //          sales: int
  //        }
  //     ],
  //     inventory-day: [
  //       {
  //        date: Y-m-d
  //        inventory: int
  //       }
  //     ]
  //   },
  //   {
  //     filter: {
  //      store: 'nyc',
  //      color: '*',
  //      size: '*'
  //     },
  //     ...
  // ];

  var render = function(data) {
    var renderSalesGraph = function(data) {
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

      var sku = svg.selectAll('.sku')
          .data(data);

      sku.enter().append('path')
        .attr('class', 'sku line')
        .style('stroke', function(d, i) { return color(i); });

      sku.attr('d', function(d) { return line(d['sales-day']); })

      sku.exit().remove();
    };
    renderSalesGraph(data);
  };

  var RadioSelector = Backbone.View.extend({
    events: {
      'change': 'changeHandler'
    },

    initialize: function() {
      this.keys = this.options.keys;
      this.callback = this.options.callback;
      this.$el.addClass('radio-selector');
      this.render();
    },

    render: function() {
      var html = '';

      _.each(this.keys, function(key) {
        html += '<label><input type="radio" name="blah" value="'+key.value+'"/>'+key.label+'</label>';
      });
      this.$el.html(html);
    },

    changeHandler: function() {
      var val = this.$(':checked').val()
      this.callback(val);
    }

  });

  var createSelector = function(attributes) {
    var keys = [
      {label: 'None', value: 'none'},
      {label: 'Stores | '+attributes.store.join(' '), value: 'store'},
      {label: 'Colors | '+attributes.color.join(' '), value: 'color'},
      {label: 'Sizes | '+attributes.size.join(' '), value: 'size'}
    ];

    new RadioSelector({
      el: $('.filter'),
      keys: keys,
      callback: setProductFilter
    });
  };

  getProductAttributes().then(function(data) {
    Product.attributes = data;
    createSelector(data);
  });

  setProductFilter('none');
})();

