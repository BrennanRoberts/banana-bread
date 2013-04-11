#!/usr/bin/ruby

require 'date'
 
STORES = (1...10).to_a
DATE_START = Date.new(2001,1,1)
DATE_END = Date.new(2001,12,1)
STYLE_SUFFIXES = (1...10).to_a
STYLES = Array.new(STYLE_SUFFIXES.length){|s| "Stussy-#{s}"}
COLORS = %w[Black White Red Green]
SIZES = %w[Small Medium Large XL XXL] if ! defined? SIZES
TRANSACTION_TYPE = "sell"
QNTY = 100
HOST = "localhost"
USER = "root"
PASS = "root"
DB = "stussy_test"





