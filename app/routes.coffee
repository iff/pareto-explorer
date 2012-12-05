{ _ } = require 'underscore'
{ render } = require './app'

app.get '/', (req, res) ->
    render req, res, 'front'

app.post '/', (req, res) ->
    render req, res, 'front'

app.get '/about', (req, res) ->
    render req, res, 'about'

# ----------------------------------------------------------------------------
# Catch-all-route
# ----------------------------------------------------------------------------
#
app.get '*', (req, res) ->
    render req, res, 404, 'Seite nicht gefunden!'

