#!/usr/bin/env ruby

require 'rubygems'
require 'mysql'

# load configuration
require_relative 'config.rb'

##################
# TODO
# - Club Style, Size, Color, Sample, Original Price together
# - normalize schema 
# - write data to file and upate DB in one step instead
# - prompt for password
##################

# defaults
STORES = (1...10).to_a if ! defined? STORES
DATE_START = Date.new(2001,1,1) if ! defined? DATE_START
DATE_END = Date.new(2001,12,1) if ! defined? DATE_END
STYLE_SUFFIXES = (1...10).to_a if ! defined? STYLE_SUFFIXES
STYLES = Array.new(STYLE_SUFFIXES.length){|s| "Stussy-#{s}"} if ! defined? STYLES
COLORS = %w[Black White Red Green] if ! defined? COLORS
SIZES = %w[Small Medium Large XL XXL] if ! defined? SIZES
TRANSACTION_TYPE = "sell" if ! defined? TRANSACTION_TYPE
QNTY = 100 if ! defined? QNTY

HOST = "localhost" if ! defined? HOST
USER = "test" if ! defined? USER
PASS = "test" if ! defined? PASS
DB = "stussy_test" if ! defined? DB

# other constants
STR_SZ = 200

# connect to database
con = {}
begin
  con = Mysql.new HOST, USER, PASS

  # if DB does not exist, create it
  con.query "CREATE DATABASE #{DB}" if ! con.list_dbs.include? DB

  con.query "USE #{DB}"

  # IF TABLE does not exist create it
  # con.query("CREATE TABLE IF NOT EXISTS \
#     Transactions(Id INT, \
#                  Name VARCHAR(#{STR_SZ}), \
#                  Size VARCHAR(#{STR_SZ}), \
#                  Color VARCHAR(#{STR_SZ}), \
#                  Store INT, \
#                  Date  DATE, \
#                  Price FLOAT, \
#                  OrigPrice FLOAT, \
#                  Type VARCHAR(#{STR_SZ}), \
#                  Sku VARCHAR(#{STR_SZ}))")


  con.query("CREATE TABLE IF NOT EXISTS Transactions(Id INT PRIMARY KEY AUTO_INCREMENT, Name VARCHAR(#{STR_SZ}), Size VARCHAR(#{STR_SZ}), Color VARCHAR(#{STR_SZ}), Store INT, Date  DATE, Price FLOAT, OrigPrice FLOAT, Type VARCHAR(#{STR_SZ}), Sku VARCHAR(#{STR_SZ}))")


  # now generate the data and insert it
  rnd = Random.new
  (1..QNTY) . each { |i|
    # pick a random date
    date = rnd.rand(DATE_START..DATE_END)

    # a random STORE
    store = STORES.sample

    # a random STYLE
    style = STYLES.sample

    # a random size
    size = SIZES.sample

    # a random COLOR
    color = COLORS.sample

    sku="#{style}#{size}#{color}"
    puts "About to insert \
      #{style}-#{size}-#{color}-#{store}-#{date}-100.0-100.0-#{TRANSACTION_TYPE}-#{sku} \n"

    con.query "INSERT INTO Transactions \
      (Name, Size, Color, Store, Date, Price, OrigPrice, Type, Sku) \
      VALUES(\"#{style}\", \"#{size}\", \"#{color}\", \"#{store}\", \"#{date}\", \"#{100.0}\", \"#{100.0}\", \"#{TRANSACTION_TYPE}\", \"#{sku}\")"
  }
 

rescue Mysql::Error => e
  puts e.errno
  puts e.error
    
ensure
  con.close if con
end

