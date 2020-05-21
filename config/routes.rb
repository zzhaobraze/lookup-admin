Rails.application.routes.draw do
  mount Lockup::Engine, at: '/lockup'

  root to: 'lookupadmin#index'

	scope path: '/lookupadmin', controller: :lookupadmin do
	  get '/' => :index
	end

	scope path: '/record', controller: :record do
	  get '/' => :index
    get '/download' => :download
    put '/' => :edit
    delete '/' => :delete
    delete '/all' => :clear
    post '/' => :create
    post '/upload' => :upload
	end
end
