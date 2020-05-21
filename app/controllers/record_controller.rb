class RecordController < ApplicationController
  before_action :check_for_lockup

  def index
    sql_limit = params[:limit]
    sql_offset = params[:offset]
    sql_filter = params[:filter].strip

    lookup = Record.getRecords(sql_limit: sql_limit, sql_offset: sql_offset, sql_filter: sql_filter)
    render json: lookup.to_json.html_safe
  end

  def edit
    render json: Record.editRecord(params).to_json.html_safe
  end

  def create
    render json: Record.createRecord(params).to_json.html_safe
  end

  def delete
    render json: Record.deleteRecord(params[:key]).to_json.html_safe
  end

  def clear
    render json: Record.deleteRecordAll(params).to_json.html_safe
  end

  def upload
    render json: Record.csvUpload(params).to_json.html_safe
  end

  def download
    backup_sql = ''
    backup_sql << Record.getBackUp()
    send_data backup_sql.to_s, :type => 'text; charset=utf-8; header=present', :disposition => "attachment; filename=braze_data_lookup-#{Date.today}.csv"
  end

end
