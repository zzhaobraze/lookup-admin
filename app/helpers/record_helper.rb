module RecordHelper
  def html_id(key)
    return key.gsub(/^[^a-z]+|[^\w:.-]+/i, "")
  end
end