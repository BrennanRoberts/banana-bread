#!/usr/bin/ruby

require 'dbf'
require 'optparse'
require 'mysql'

# load configuration
require_relative 'config.rb'

#################################
#  TODO
#  1. write to db
#  2. error checking
#  3. make progress method that spits out a . every 100 calls
#  4. class structure
################################

options = {}
# 1. accept folder_path, db_name, 
parser = OptionParser . new do |opts|
  opts.banner = "Usage : retail-logic-inhaler.rb [options]"

  opts.on("-d", "--dir DIRECTORY",
          "path to directory that contains retail logic data") do |rectory|
    options[:dir] = rectory
  end

  opts.on("-b", "--database DATABASE", "update this db") do |base|
    options[:db] = base
  end

  opts.on("-t", "--[no-]try", "trial run, don't make any changes") do |dr|
    options[:dry] = dr
  end
end

begin
  parser . parse!
rescue
  print "#{$! . backtrace[0]} --> #{$! . to_s}\n"
  exit
end

puts options.inspect.to_s

def read_dbf (file)
  return DBF::Table . new (file) if File . exists? file
end

if options[:dry] == false
# 2. connect
  HOST = "localhost" if ! defined? HOST
  USER = "test" if ! defined? USER
  PASS = "test" if ! defined? PASS
  options[:db] = "stussy_test" if options[:db].nil?

  # connect to database
  con = {}
  begin
    con = Mysql.new HOST, USER, PASS

    # if DB does not exist, create it
    con.query "CREATE DATABASE #{DB}" if ! con.list_dbs.include? DB

    con.query "USE #{DB}"

    con.query("CREATE TABLE IF NOT EXISTS Transactions(Id INT PRIMARY KEY AUTO_INCREMENT, Name VARCHAR(#{STR_SZ}), Size VARCHAR(#{STR_SZ}), Color VARCHAR(#{STR_SZ}), Store INT, Date  DATE, Discount FLOAT, OrigPrice FLOAT, Type VARCHAR(#{STR_SZ}), Sku VARCHAR(#{STR_SZ}))")
  rescue Mysql::Error => e
    puts e.errno
    puts e.error
  end
end


def compute_join options
  # Id - SALE in SALE.DBF
  # Date - DATE in SALE.DBF
  # Price - 
  # Discount - 
  # Sku - using ID, column SKU in SALEL.DBF
  # Size - using Sku, from HLABEL in SKU.DBF
  # Name - using Sku, column ITEM in SKU.DBF, then col DESC in ITEM.DBF
  # Color - using Sku, column ITEM in SKU.DBF, then col COLOR in ITEM.DBF
  # Store - col STORENAME in CONFIG.DBF
  # 
  combined_table = Hash . new
  row = Hash . new 

  # SALE.DBF
  sale_tab = read_dbf (FULL_PATHS[0])
  salel_tab = read_dbf (FULL_PATHS[1])
  sku_tab = read_dbf (FULL_PATHS[2])
  store_tab = read_dbf (FULL_PATHS[3])
  item_tab = read_dbf (FULL_PATHS[4])
  store_name = store_tab . record(0)["STORENAME"]
 
  print "gathering sale dates from SALE.DBF..."
  sale_dates = Hash.new
  sale_tab . each do |row|
    sale_dates[row[:SALE]] = row[:DATE]
  end
  print "done.\n"

  print "starting pass over SALEL.DBF..."
  salel_tab . each do |r| 
    combined_table [combined_table . length] = 
            { :ID => r[:SALE], 
              :DATE => sale_dates[r[:SALE]],
              :SKU => r[:SKU], 
              :PRICE => r[:LINEAMT],
              :DISCOUNT => r[:DISCOUNT],
              :STORE => store_name }
    print "."
#    break if combined_table . length > 3
  end
  print "done.\n"

  print "starting pass over SKU.DBF..."
  sku_items = Hash . new
  sku_sizes = Hash . new
  sku_tab . each do |row|
    sku_items[row[:SKU]] = row[:ITEM]
    sku_sizes[row[:SKU]] = row[:HLABEL]
  end
  print "done.\n"

  print "starting pass over ITEM.DBF..."
  item_data = Hash . new
  item_tab . each do |row|
    item_data[row[:ITEM]] = {:NAME => row[:DESC], :COLOR => row[:COLOR]}    
  end
  print "done.\n"

  print "starting final pass to add to table..."
  combined_table . each_value do |row|
    #sku_row = sku_tab . find(:first, :SKU => row[:SKU]) 
    #row[:SIZE] = sku_row[:HLABEL]
    cur_sku = row[:SKU]
    row[:SIZE] = sku_sizes[cur_sku]
    tem = sku_items[cur_sku]
    #tem_row = item_tab . find(:first, :ITEM => tem)
    row[:NAME] = item_data[tem][:NAME]
    row[:COLOR] = item_data[tem][:COLOR]
    print "."
  end
  print "done.\n"

  return combined_table
end


# 3. select files to read
# Those that matter
# SALE, SALEL, SKU, CONFIG.DBF
FILES = %w[SALE.DBF SALEL.DBF SKU.DBF CONFIG.DBF ITEM.DBF]
FULL_PATHS = FILES . map { |f| options [:dir] + f }
puts "will read the following files: #{FULL_PATHS}"

combined_table = compute_join options







