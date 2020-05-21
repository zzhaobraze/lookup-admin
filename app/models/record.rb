class Record < ApplicationRecord
	# @db_schema = 'public'
	# @table_name = 'lookup'
	@lookup_key = ENV['DB_KEY_FIELD']
	@lookup_field = ENV['DB_VALUE_FIELD']
	@lookup_index = 'bz_lookup_index'
	@lookup_fields = [@lookup_key, @lookup_field]
	@upload_batch_size = 100
	# self.table_name = `${ENV['DB_SCHEMA']}.${ENV['DB_TABLE']}`
	# self.primary_key = ENV['DB_KEY_FIELD']
	# self.table_name = 'public.lookup'
	# self.primary_key = 'id'
	self.table_name = "#{ENV['DB_SCHEMA']}.#{ENV['DB_TABLE']}"
	self.primary_key = ENV['DB_KEY_FIELD']

def self.getRecords(sql_offset: nil, sql_limit: nil, sql_filter: nil)
		records = Record.select( @lookup_fields.join(','))
		if (sql_filter)
			records = records.where("#{@lookup_key} ILIKE ? OR #{@lookup_field} ILIKE ?", "%#{sql_filter}%", "%#{sql_filter}%")
		end
		if (sql_limit)
			records = records.limit(sql_limit.to_i)
		end
		if (sql_offset)
			records = records.offset(sql_offset.to_i)
		end

		return records
	end
	def self.getRecord(key: nil)
			records = Record.select( @lookup_fields.join(',')).where("#{@lookup_key} = ?", key).limit(1)
			return records
		end
	def self.editRecord(params)
		return self.updateRecord(params)
	end
	def self.createRecord(params)
		return self.updateRecord(params, false)
	end
	def self.deleteRecord(record_id)
		record = {}
		begin
			record['delete'] = Record.delete(record_id)
			record['results'] = 'success'

		rescue Exception => e
			record['results'] = 'error'
			record['message'] = e.to_s
		end
		return record
	end
	def self.deleteRecordAll(params)
		record = {}
		reqparams = [:confirmDate, :confirm]
		todays_date = Date.today.strftime('%Y-%m-%d')
		allparams = true
		reqparams.each do |rq|
			if params[rq].nil?
				allparams = false
			end
		end
		unless allparams
			return {'results' => 'error', 'message' => 'Missing parameter'}
		else
			if ((params[:confirmDate] === params[:confirm] ) && (params[:confirmDate] === todays_date) )
				begin
					record['delete'] = Record.delete_all()
					record['results'] = 'success'
				rescue Exception => e
					record['results'] = 'error'
					record['message'] = e.to_s
				end
			else
				return {'results' => 'error', 'message' => 'Bad Request'}
			end
		end
		return record
	end

	def self.getBackUp()
		records =  Record.select( @lookup_fields.join(',')).all
		records_backup = [@lookup_fields.join(',')]
		records.each do |ms |
			records_row = []
			@lookup_fields.each do | mf |
				records_row.push(ms[mf])
			end
			records_backup.push(records_row.to_csv(row_sep: nil ))
		end
		return records_backup.join("\n")
	end

	def self.csvUpload(params)
		reqparams = [:records]
		allparams = true
		reqparams.each do |rq|
			if params[rq].nil?
				allparams = false
			end
		end
		unless allparams
			return {'results' => 'error', 'message' => 'Missing parameter'}
		else
			result = {}
			begin
				records = JSON.parse(params[:records])

				records.each_slice(@upload_batch_size) { | record |
					record_clean = []
					record.each do | r |
						rc =  r.select { |key,_| @lookup_fields.include? key }
						if (rc[@lookup_key] && rc[@lookup_field])
							record_clean.push(rc)
						end
					end
					if (record_clean.length > 0)
						Record.upsert_all(record_clean, unique_by: @lookup_index )
					end
				}
				result['results'] = 'success'
				result['message'] = 'Done'
			rescue Exception => e
				result['results'] = 'error'
				result['message'] = e.to_s
			end
			return result
		end
		return {'results' => 'success', 'message' => 'Done'}
	end

	private
	def self.updateRecord(params, updateexisting = true)
		reqparams = [:key, :value]
		allparams = true
		reqparams.each do |rq|
			if params[rq].nil?
				allparams = false
			end
		end
		unless allparams
			return {'results' => 'error', 'message' => 'Missing parameter'}
		else
			record = {}
			record[@lookup_key ] = params[:key].strip
			record[@lookup_field ] = params[:value].strip
			result = {}
			begin
				if updateexisting
					result['upsert'] = Record.upsert_all([record], unique_by: @lookup_index )
					result['results'] = 'success'
				else
					result['insert'] = Record.insert_all!([record] )
					result['results'] = 'success'
				end
			rescue ActiveRecord::RecordNotUnique => e
				result['results'] = 'Error'
				result['message'] = "Unique key #{record[@lookup_key ]} already exist in the table"
			rescue Exception => e
				result['results'] = 'error'
				result['message'] = e.to_s
			end
			return result
		end
	end

end
