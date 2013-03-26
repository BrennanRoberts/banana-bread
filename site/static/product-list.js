var columnHeaders = [
  ['Product', 'style'],
  ['Color', 'color'],
  ['Size', 'size'],
  ['Sales/wk', 'velocity-week'],
  ['Remain', 'remaining'],
  ['Sellthrough', 'sellthrough'],
  ['Days since restock', 'last-restock'],
  ['Total sold', 'sold-total']
];

var table = d3.select('table');
var thead = table.append('thead');
var tbody = table.append('tbody');

var filterSettings = {
  group: {}
};

var renderHeaders = function() {
  var columns = thead.append('tr')
    .selectAll('th')
    .data(columnHeaders);

  columns.enter().append('th');
  columns.text(function(d) { return d[0]; });
  columns.exit().remove();
};

var render = function(data) {
  var rows = tbody.selectAll('tr')
    .data(data);

  rows.enter().append('tr');
  rows.exit().remove();

  var cells = rows.selectAll('td')
    .data(function(row) {
      return columnHeaders.map(function(column) {
        return {column: column, value: row[column[1]]};
      });
    });
  cells.enter().append('td');
  cells.text(function(d) { return d.value });
  cells.exit().remove();
};

var load = function(callback, opts) {
  opts = opts || {};
  var req = new XMLHttpRequest();
  var query = [];
  opts = _.extend(opts, filterSettings);

  if (opts.group.color) query.push('group-by-color=1');
  if (opts.group.size)  query.push('group-by-size=1');
  if (opts.offset)      query.push('offset='+opts.offset);

  req.open('GET', 'api/products?'+query.join('&'));
  req.onload = function() {
    var fresh = JSON.parse(this.responseText);
    window.data = (window.data || []).concat(fresh);
    callback(window.data);
  };
  req.send();
};

var loadNext = function() {
  load(render, {
    offset: data.length
  });
};

var ProductFilter = function(opts) {
  this.el = opts.el;

  var label = d3.select(this.el).selectAll('label')
    .data(opts.filters)
    .enter()
    .append('label');

  this.inputs = label.append('input')
    .attr('type', 'checkbox')
    .on('change', _.bind(this.changeHandler, this));
  label.append('span').text(String)
};

ProductFilter.prototype.changeHandler = function(e) {
  var group = this.inputs.filter(':checked').data();
  var groupMap = _.reduce(group, function(memo, val) { memo[val] = true; return memo; }, {});

  window.data = [];
  filterSettings.group = groupMap;
  load(render);
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
  console.log(values);


};

renderHeaders();
load(render);

var filters = new ProductFilter({
  el: document.querySelector('.product-filter'),
  filters: ['size', 'color']
});

var storeFilter = new StoreFilter({
  el: document.querySelector('.store-filter'),
  stores: ['web', 'Los Angeles', 'New York', 'Honolulu']
});

document.querySelector('.more').addEventListener('click', loadNext);

