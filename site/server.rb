require 'rubygems'
require 'bundler/setup'
require 'sinatra'
require 'json'
require 'date'

set :public_folder, File.dirname(__FILE__) + '/static'

get '/api/products' do
  # TODO query db
  params[:sortBy] ||= 'velocity-week'
  params[:offset]||= 0
  params[:limit] ||= 10
  puts params.inspect
  return random_products_data(params).to_json
end

get '/api/product/' do
  params[:from] ||= Date.today - 10
  params[:to] ||= Date.today
  return random_product_data(params).to_json
end

def random_products_data(opts = {})
  list = []
  styles = ['Stussy x CLOT Snakeskin Tee']
  colors = ['black', 'blue', 'red']
  sizes = ['small', 'medium', 'large', 'x-large', 'xx-large']

  styles.each do |style|
    colors.each do |color|
      sizes.each do |size|
        stats = {
          :style => style,
          :remaining => Random.rand(1000),
          :'velocity-week' => Random.rand(1000),
          :'sold-total' => Random.rand(1000),
          :'last-restock' => Random.rand(20),
          :sellthrough => Random.rand().round(2),
          :'price-avg' => 36
        }

        stats[:color] = color unless opts[:'group-by-color']
        stats[:size] = size unless opts[:'group-by-size']

        list << stats
        break if opts[:'group-by-size']
      end
      break if opts[:'group-by-color']
    end
  end

  return list
end

def random_product_data(opts)
  dates = (opts[:from]..opts[:to])
  data = dates.map do |day|
    { :date => day, :sales => Random.rand(100) }
  end
  data
end

def random_transaction_data
  trans = []
  days = 10
  today = Date.today
  dates = ((today - days)..today)
  stores = ['Los Angeles', 'Stussy.com', 'New York', 'Las Vegas']
  colors = ['black', 'blue', 'red']
  sizes = ['small', 'medium', 'large', 'x-large', 'xx-large']

  dates.each do |day|
    (Random.rand(10)).times do
      trans << {
        :style => 'Stussy x CLOT Snakeskin Tee',
        :store => stores.sample,
        :colors => colors.sample,
        :sizes => sizes.sample,
        :date => day
      }
    end
  end

  trans
end


