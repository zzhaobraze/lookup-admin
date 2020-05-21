class LookupadminController < ApplicationController
  before_action :check_for_lockup

  @@sql_limit_default = 50
  @@sql_offset_default = 0
  @@lookup_key = ENV['DB_KEY_FIELD']
  @@lookup_field = ENV['DB_VALUE_FIELD']

  def index
    @lookup = Record.getRecords(sql_offset: @@sql_offset_default, sql_limit: @@sql_limit_default)
    @sql_limit = @@sql_limit_default
    @sql_offset = @@sql_offset_default
    @lookup_key = @@lookup_key
    @lookup_field = @@lookup_field

  end

end
