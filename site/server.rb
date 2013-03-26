require 'rubygems'
require 'bundler/setup'
require 'sinatra'
require 'json'

set :public_folder, File.dirname(__FILE__) + '/static'

get '/api/products' do
  # TODO query db
  params[:sortBy] ||= 'velocity-week'
  params[:offset]||= 0
  params[:limit] ||= 10
  puts params.inspect
  return randomProducts(params).to_json
end

def randomProducts(opts = {})
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


